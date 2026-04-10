const { assignLaptopToEmployee, returnLaptop } = require('../services/assignmentService');
const Assignment = require('../models/Assignment');
const AppError = require('../utils/AppError');
const { getPagination, paginateResponse } = require('../utils/pagination');

exports.assign = async (req, res, next) => {
  try {
    const result = await assignLaptopToEmployee({
      employeeId: req.body.employeeId,
      assignedBy: req.user._id,
      notes: req.body.notes,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: `Laptop assigned using ${result.laptop.lastReturnedDate ? 'Priority 1 (most recently returned)' : 'Priority 2 (oldest purchase date)'}`,
      data: result
    });
  } catch (err) { next(err); }
};

exports.returnLaptop = async (req, res, next) => {
  try {
    const result = await returnLaptop({
      assignmentId: req.body.assignmentId,
      returnedBy: req.user._id,
      notes: req.body.notes,
      ip: req.ip
    });
    res.json({ success: true, message: 'Laptop returned successfully', data: result });
  } catch (err) { next(err); }
};

exports.getAssignments = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.employeeId) filter.employeeId = req.query.employeeId;
    if (req.query.laptopId) filter.laptopId = req.query.laptopId;

    const [assignments, total] = await Promise.all([
      Assignment.find(filter)
        .populate('laptopId', 'model serialNumber ram storage status')
        .populate('employeeId', 'name employeeId department email')
        .populate('assignedBy', 'name email')
        .populate('returnedBy', 'name email')
        .sort({ assignedDate: -1 })
        .skip(skip)
        .limit(limit),
      Assignment.countDocuments(filter)
    ]);

    res.json({ success: true, ...paginateResponse(assignments, total, page, limit) });
  } catch (err) { next(err); }
};

exports.getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('laptopId')
      .populate('employeeId')
      .populate('assignedBy', 'name email')
      .populate('returnedBy', 'name email');
    if (!assignment) throw new AppError('Assignment not found', 404);
    res.json({ success: true, data: assignment });
  } catch (err) { next(err); }
};
