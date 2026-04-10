const Rack = require('../models/Rack');
const Tray = require('../models/Tray');
const AppError = require('../utils/AppError');
const logActivity = require('../utils/activityLogger');
const { getPagination, paginateResponse } = require('../utils/pagination');

exports.createRack = async (req, res, next) => {
  try {
    const rack = await Rack.create(req.body);
    logActivity({ userId: req.user._id, action: 'CREATE_RACK', entity: 'Rack', entityId: rack._id, ip: req.ip });
    res.status(201).json({ success: true, data: rack });
  } catch (err) { next(err); }
};

exports.getAllRacks = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [racks, total] = await Promise.all([
      Rack.find(filter).sort({ rackNumber: 1 }).skip(skip).limit(limit),
      Rack.countDocuments(filter)
    ]);

    res.json({ success: true, ...paginateResponse(racks, total, page, limit) });
  } catch (err) { next(err); }
};

exports.getRack = async (req, res, next) => {
  try {
    const rack = await Rack.findById(req.params.id);
    if (!rack) throw new AppError('Rack not found', 404);
    res.json({ success: true, data: rack });
  } catch (err) { next(err); }
};

exports.updateRack = async (req, res, next) => {
  try {
    const rack = await Rack.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!rack) throw new AppError('Rack not found', 404);
    logActivity({ userId: req.user._id, action: 'UPDATE_RACK', entity: 'Rack', entityId: rack._id, details: req.body, ip: req.ip });
    res.json({ success: true, data: rack });
  } catch (err) { next(err); }
};

exports.deleteRack = async (req, res, next) => {
  try {
    const rack = await Rack.findById(req.params.id);
    if (!rack) throw new AppError('Rack not found', 404);
    // Check if rack has trays
    const trayCount = await Tray.countDocuments({ rackId: req.params.id });
    if (trayCount > 0) throw new AppError('Cannot delete rack with existing trays', 400);

    rack.deletedAt = new Date();
    await rack.save();
    logActivity({ userId: req.user._id, action: 'DELETE_RACK', entity: 'Rack', entityId: rack._id, ip: req.ip });
    res.json({ success: true, message: 'Rack deleted' });
  } catch (err) { next(err); }
};
