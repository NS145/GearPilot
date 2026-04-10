const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const logActivity = require('../utils/activityLogger');
const { getPagination, paginateResponse } = require('../utils/pagination');

exports.createEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.create(req.body);
    logActivity({ userId: req.user._id, action: 'CREATE_EMPLOYEE', entity: 'Employee', entityId: employee._id, ip: req.ip });
    res.status(201).json({ success: true, data: employee });
  } catch (err) { next(err); }
};

exports.getAllEmployees = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = { $regex: req.query.department, $options: 'i' };
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { employeeId: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [employees, total] = await Promise.all([
      Employee.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
      Employee.countDocuments(filter)
    ]);

    res.json({ success: true, ...paginateResponse(employees, total, page, limit) });
  } catch (err) { next(err); }
};

exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) throw new AppError('Employee not found', 404);
    res.json({ success: true, data: employee });
  } catch (err) { next(err); }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!employee) throw new AppError('Employee not found', 404);
    logActivity({ userId: req.user._id, action: 'UPDATE_EMPLOYEE', entity: 'Employee', entityId: employee._id, ip: req.ip });
    res.json({ success: true, data: employee });
  } catch (err) { next(err); }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) throw new AppError('Employee not found', 404);
    employee.deletedAt = new Date();
    await employee.save();
    logActivity({ userId: req.user._id, action: 'DELETE_EMPLOYEE', entity: 'Employee', entityId: employee._id, ip: req.ip });
    res.json({ success: true, message: 'Employee deleted' });
  } catch (err) { next(err); }
};
