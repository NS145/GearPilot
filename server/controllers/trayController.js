const Tray = require('../models/Tray');
const Rack = require('../models/Rack');
const Laptop = require('../models/Laptop');
const AppError = require('../utils/AppError');
const logActivity = require('../utils/activityLogger');
const { getPagination, paginateResponse } = require('../utils/pagination');

exports.createTray = async (req, res, next) => {
  try {
    const rack = await Rack.findById(req.body.rackId);
    if (!rack) throw new AppError('Rack not found', 404);
    if (rack.status === 'maintenance') throw new AppError('Cannot add tray to rack under maintenance', 400);

    const tray = await Tray.create(req.body);
    logActivity({ userId: req.user._id, action: 'CREATE_TRAY', entity: 'Tray', entityId: tray._id, ip: req.ip });
    res.status(201).json({ success: true, data: tray });
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
