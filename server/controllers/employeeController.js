const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const logActivity = require('../utils/activityLogger');
const { getPagination, paginateResponse } = require('../utils/pagination');

exports.createEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.create(req.body);
    
    // Create corresponding user account automatically
    const User = require('../models/User');
    const existingUser = await User.findOne({ email: employee.email });
    if (!existingUser) {
      const initPassword = req.body.plainPassword || (employee.name.replace(/\s+/g, '').toLowerCase() + '@123');
      await User.create({
        name: employee.name,
        email: employee.email,
        password: initPassword,
        role: 'employee'
      });
      if (!req.body.plainPassword) {
        employee.plainPassword = initPassword;
        await employee.save();
      }
    }

    if (req.user) {
      logActivity({ userId: req.user._id, action: 'CREATE_EMPLOYEE', entity: 'Employee', entityId: employee._id, ip: req.ip });
    }
    res.status(201).json({ success: true, data: employee });
  } catch (err) { next(err); }
};

exports.getAllEmployees = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.hasPendingRequest === 'true') {
      const Assignment = require('../models/Assignment');
      const pendingRequests = await Assignment.find({ status: 'requested' }).distinct('employeeId');
      filter._id = { $in: pendingRequests };
    }
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

    // If plain password was provided, also sync it to their User account
    if (req.body.plainPassword) {
      const User = require('../models/User');
      const employeeUser = await User.findOne({ email: employee.email });
      if (employeeUser) {
        employeeUser.password = req.body.plainPassword;
        await employeeUser.save();
      } else {
        await User.create({ 
          name: employee.name, 
          email: employee.email, 
          password: req.body.plainPassword, 
          role: 'employee' 
        });
      }
    }

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
