const Laptop = require('../models/Laptop');
const Tray = require('../models/Tray');
const AppError = require('../utils/AppError');
const logActivity = require('../utils/activityLogger');
const { getPagination, paginateResponse } = require('../utils/pagination');

exports.createLaptop = async (req, res, next) => {
  try {
    const { trayId } = req.body;

    if (trayId) {
      const tray = await Tray.findById(trayId);
      if (!tray) throw new AppError('Tray not found', 404);
      if (tray.status === 'maintenance') throw new AppError('Tray is under maintenance', 400);
      if (tray.status === 'occupied') throw new AppError('Tray already has a laptop', 400);
      await Tray.findByIdAndUpdate(trayId, { status: 'occupied' });
    }

    const laptop = await Laptop.create(req.body);
    logActivity({ userId: req.user._id, action: 'ADD_LAPTOP', entity: 'Laptop', entityId: laptop._id, details: { model: laptop.model }, ip: req.ip });
    res.status(201).json({ success: true, data: laptop });
  } catch (err) { next(err); }
};

exports.getAllLaptops = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.model) filter.model = { $regex: req.query.model, $options: 'i' };
    if (req.query.trayId) filter.trayId = req.query.trayId;
    if (req.query.purchaseDateFrom || req.query.purchaseDateTo) {
      filter.purchaseDate = {};
      if (req.query.purchaseDateFrom) filter.purchaseDate.$gte = new Date(req.query.purchaseDateFrom);
      if (req.query.purchaseDateTo) filter.purchaseDate.$lte = new Date(req.query.purchaseDateTo);
    }

    const [laptops, total] = await Promise.all([
      Laptop.find(filter)
        .populate('trayId', 'trayNumber status qrCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Laptop.countDocuments(filter)
    ]);

    res.json({ success: true, ...paginateResponse(laptops, total, page, limit) });
  } catch (err) { next(err); }
};

exports.getLaptop = async (req, res, next) => {
  try {
    const laptop = await Laptop.findById(req.params.id).populate({
      path: 'trayId',
      populate: { path: 'rackId', select: 'rackNumber status' }
    });
    if (!laptop) throw new AppError('Laptop not found', 404);
    res.json({ success: true, data: laptop });
  } catch (err) { next(err); }
};

exports.updateLaptop = async (req, res, next) => {
  try {
    const laptop = await Laptop.findById(req.params.id);
    if (!laptop) throw new AppError('Laptop not found', 404);

    if (req.body.trayId && req.body.trayId !== String(laptop.trayId)) {
      const newTray = await Tray.findById(req.body.trayId);
      if (!newTray) throw new AppError('Tray not found', 404);
      if (newTray.status === 'occupied') throw new AppError('Target tray is already occupied', 400);
      if (laptop.trayId) {
        await Tray.findByIdAndUpdate(laptop.trayId, { status: 'free' });
      }
      await Tray.findByIdAndUpdate(req.body.trayId, { status: 'occupied' });
    }

    Object.assign(laptop, req.body);
    await laptop.save();
    logActivity({ userId: req.user._id, action: 'UPDATE_LAPTOP', entity: 'Laptop', entityId: laptop._id, details: req.body, ip: req.ip });
    res.json({ success: true, data: laptop });
  } catch (err) { next(err); }
};

exports.deleteLaptop = async (req, res, next) => {
  try {
    const laptop = await Laptop.findById(req.params.id);
    if (!laptop) throw new AppError('Laptop not found', 404);
    if (laptop.status === 'assigned') throw new AppError('Cannot delete an assigned laptop', 400);
    if (laptop.trayId) await Tray.findByIdAndUpdate(laptop.trayId, { status: 'free' });
    laptop.deletedAt = new Date();
    await laptop.save();
    logActivity({ userId: req.user._id, action: 'DELETE_LAPTOP', entity: 'Laptop', entityId: laptop._id, ip: req.ip });
    res.json({ success: true, message: 'Laptop deleted' });
  } catch (err) { next(err); }
};

// ─── Dashboard aggregation (fixed) ───────────────────────────
exports.getDashboard = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const pipeline = [
      { $match: { deletedAt: null } },
      {
        $lookup: {
          from: 'trays',
          localField: 'trayId',
          foreignField: '_id',
          as: 'tray'
        }
      },
      // ✅ FIXED: preserveNullAndEmptyArrays (not preserveNullAndEmpty)
      { $unwind: { path: '$tray', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'racks',
          localField: 'tray.rackId',
          foreignField: '_id',
          as: 'rack'
        }
      },
      // ✅ FIXED: preserveNullAndEmptyArrays (not preserveNullAndEmpty)
      { $unwind: { path: '$rack', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'assignments',
          let: { laptopId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$laptopId', '$$laptopId'] },
                    { $eq: ['$status', 'active'] }
                  ]
                }
              }
            },
            {
              $lookup: {
                from: 'employees',
                localField: 'employeeId',
                foreignField: '_id',
                as: 'employee'
              }
            },
            { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } }
          ],
          as: 'activeAssignment'
        }
      },
      {
        $project: {
          model: 1,
          ram: 1,
          storage: 1,
          serialNumber: 1,
          purchaseDate: 1,
          vendor: 1,
          status: 1,
          lastReturnedDate: 1,
          rackNumber: { $ifNull: ['$rack.rackNumber', 'N/A'] },
          trayNumber: { $ifNull: ['$tray.trayNumber', 'N/A'] },
          trayStatus: { $ifNull: ['$tray.status', 'N/A'] },
          assignedEmployee: {
            $cond: {
              if: { $gt: [{ $size: '$activeAssignment' }, 0] },
              then: { $arrayElemAt: ['$activeAssignment.employee.name', 0] },
              else: null
            }
          }
        }
      }
    ];

    // Apply optional filters after projection
    const matchStage = {};
    if (req.query.status) matchStage.status = req.query.status;
    if (req.query.model) matchStage.model = { $regex: req.query.model, $options: 'i' };
    if (req.query.rackNumber) matchStage.rackNumber = req.query.rackNumber;
    if (req.query.trayNumber) matchStage.trayNumber = req.query.trayNumber;

    if (Object.keys(matchStage).length) {
      pipeline.push({ $match: matchStage });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];
    pipeline.push({ $sort: { rackNumber: 1, trayNumber: 1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const [rows, countResult] = await Promise.all([
      Laptop.aggregate(pipeline),
      Laptop.aggregate(countPipeline)
    ]);

    const total = countResult[0]?.total || 0;
    res.json({ success: true, ...paginateResponse(rows, total, page, limit) });
  } catch (err) { next(err); }
};

exports.getAvailableModels = async (req, res, next) => {
  try {
    const inventory = await Laptop.aggregate([
      { $match: { deletedAt: null } },
      { $group: { 
        _id: '$model', 
        count: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'available'] }, { $eq: ['$trayId', null] }] }, 1, 0] } },
        ram: { $first: '$ram' },
        storage: { $first: '$storage' },
        vendor: { $first: '$vendor' }
      } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({ success: true, data: inventory.map(item => ({ 
      model: item._id, 
      count: item.count,
      ram: item.ram,
      storage: item.storage,
      vendor: item.vendor
    })) });
  } catch (err) { next(err); }
};

exports.bulkCreateLaptops = async (req, res, next) => {
  try {
    const { model, ram, storage, vendor, purchaseDate, quantity, serialPrefix, notes } = req.body;
    
    const count = parseInt(quantity);
    if (count > 50) throw new AppError('Maximum 50 laptops can be added in bulk', 400);

    const laptopsToCreate = [];
    const now = new Date();
    for (let i = 1; i <= count; i++) {
      laptopsToCreate.push({
        model,
        ram,
        storage,
        vendor,
        purchaseDate: purchaseDate || now,
        serialNumber: `${serialPrefix}-${i.toString().padStart(3, '0')}`,
        notes: notes || `Bulk added on ${now.toLocaleDateString()}`
      });
    }

    const serials = laptopsToCreate.map(l => l.serialNumber);
    const existing = await Laptop.findOne({ serialNumber: { $in: serials } });
    if (existing) throw new AppError(`A laptop with serial number "${existing.serialNumber}" already exists`, 400);

    const laptops = await Laptop.insertMany(laptopsToCreate);
    
    logActivity({ 
      userId: req.user._id, 
      action: 'BULK_CREATE_LAPTOPS', 
      entity: 'Laptop', 
      details: { model, count, serialPrefix },
      ip: req.ip 
    });

    res.status(201).json({ success: true, count: laptops.length, data: laptops });
  } catch (err) { next(err); }
};
