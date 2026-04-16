const Tray = require('../models/Tray');
const Rack = require('../models/Rack');
const Laptop = require('../models/Laptop');
const AppError = require('../utils/AppError');
const logActivity = require('../utils/activityLogger');
const { getPagination, paginateResponse } = require('../utils/pagination');

exports.createTray = async (req, res, next) => {
  try {
    const { rackId, laptopModel } = req.body;
    const rack = await Rack.findById(rackId);
    if (!rack) throw new AppError('Rack not found', 404);
    if (rack.status === 'maintenance') throw new AppError('Cannot add tray to rack under maintenance', 400);

    let laptop = null;
    if (laptopModel) {
      laptop = await Laptop.findOne({ model: laptopModel, status: 'available', trayId: null });
      if (!laptop) throw new AppError(`No available pieces of ${laptopModel} found`, 400);
      req.body.status = 'occupied';
    }

    const tray = await Tray.create(req.body);

    if (laptop) {
      await Laptop.findByIdAndUpdate(laptop._id, { trayId: tray._id });
    }

    logActivity({ userId: req.user._id, action: 'CREATE_TRAY', entity: 'Tray', entityId: tray._id, ip: req.ip });
    res.status(201).json({ success: true, data: tray });
  } catch (err) { next(err); }
};

exports.bulkCreateTrays = async (req, res, next) => {
  try {
    const { rackId, prefix = '', startNumber, quantity, laptopModel } = req.body;
    
    const rack = await Rack.findById(rackId);
    if (!rack) throw new AppError('Rack not found', 404);
    if (rack.status === 'maintenance') throw new AppError('Cannot add trays to rack under maintenance', 400);

    const count = parseInt(quantity);
    if (count > 50) throw new AppError('Maximum 50 trays can be added in bulk', 400);

    let laptops = [];
    if (laptopModel) {
      laptops = await Laptop.find({ model: laptopModel, status: 'available', trayId: null }).limit(count);
      if (laptops.length < count) {
        throw new AppError(`Only ${laptops.length} pieces of ${laptopModel} are available (${count} requested)`, 400);
      }
    }

    const start = parseInt(startNumber);
    const traysToCreate = [];
    for (let i = 0; i < count; i++) {
      traysToCreate.push({
        trayNumber: `${prefix}${start + i}`,
        rackId: rackId,
        status: laptopModel ? 'occupied' : 'free'
      });
    }

    const trayNumbers = traysToCreate.map(t => t.trayNumber);
    const existing = await Tray.findOne({ rackId, trayNumber: { $in: trayNumbers } });
    if (existing) throw new AppError(`Tray "${existing.trayNumber}" already exists in this rack`, 400);

    const trays = await Tray.create(traysToCreate);

    if (laptopModel) {
      // Bulk update laptops with their corresponding tray IDs
      const laptopUpdates = laptops.map((l, i) => 
        Laptop.findByIdAndUpdate(l._id, { trayId: trays[i]._id })
      );
      await Promise.all(laptopUpdates);
    }
    
    logActivity({ 
      userId: req.user._id, 
      action: 'BULK_CREATE_TRAYS', 
      entity: 'Tray', 
      details: { rackId, count, prefix, startNumber, laptopModel },
      ip: req.ip 
    });

    res.status(201).json({ success: true, count: trays.length, data: trays });
  } catch (err) { next(err); }
};

exports.getAllTrays = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.rackId) filter.rackId = req.query.rackId;

    const [trays, total] = await Promise.all([
      Tray.find(filter)
        .populate('rackId', 'rackNumber status location')
        .populate('laptop', 'model serialNumber')
        .sort({ trayNumber: 1 })
        .skip(skip)
        .limit(limit),
      Tray.countDocuments(filter)
    ]);

    res.json({ success: true, ...paginateResponse(trays, total, page, limit) });
  } catch (err) { next(err); }
};

exports.getTray = async (req, res, next) => {
  try {
    const tray = await Tray.findById(req.params.id).populate('rackId', 'rackNumber status location');
    if (!tray) throw new AppError('Tray not found', 404);
    const laptop = await Laptop.findOne({ trayId: tray._id });
    res.json({ success: true, data: { ...tray.toObject(), laptop: laptop || null } });
  } catch (err) { next(err); }
};

exports.updateTray = async (req, res, next) => {
  try {
    const tray = await Tray.findByIdAndUpdate(
      req.params.id,
      { ...req.body, qrCode: undefined }, // QR code cannot be changed
      { new: true, runValidators: true }
    ).populate('rackId', 'rackNumber status');
    if (!tray) throw new AppError('Tray not found', 404);
    logActivity({ userId: req.user._id, action: 'UPDATE_TRAY', entity: 'Tray', entityId: tray._id, details: req.body, ip: req.ip });
    res.json({ success: true, data: tray });
  } catch (err) { next(err); }
};

exports.deleteTray = async (req, res, next) => {
  try {
    const tray = await Tray.findById(req.params.id);
    if (!tray) throw new AppError('Tray not found', 404);
    const laptop = await Laptop.findOne({ trayId: req.params.id });
    if (laptop) throw new AppError('Cannot delete tray with laptop inside', 400);
    tray.deletedAt = new Date();
    await tray.save();
    logActivity({ userId: req.user._id, action: 'DELETE_TRAY', entity: 'Tray', entityId: tray._id, ip: req.ip });
    res.json({ success: true, message: 'Tray deleted' });
  } catch (err) { next(err); }
};

// QR lookup
exports.getTrayByQR = async (req, res, next) => {
  try {
    const tray = await Tray.findOne({ qrCode: req.params.code })
      .populate('rackId', 'rackNumber status location');
    if (!tray) throw new AppError('Tray not found for this QR code', 404);
    const laptop = await Laptop.findOne({ trayId: tray._id });
    res.json({ success: true, data: { ...tray.toObject(), laptop: laptop || null } });
  } catch (err) { next(err); }
};

exports.suggestTrayNumber = async (req, res, next) => {
  try {
    const { rackId } = req.params;
    const trays = await Tray.find({ rackId }).select('trayNumber');
    
    let max = 0;
    trays.forEach(t => {
      const numMatch = t.trayNumber.match(/\d+$/);
      if (numMatch) {
        const val = parseInt(numMatch[0]);
        if (val > max) max = val;
      }
    });

    const nextNumber = trays.length === 0 ? 1 : max + 1;
    res.json({ success: true, nextNumber });
  } catch (err) { next(err); }
};
