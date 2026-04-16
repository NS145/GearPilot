const Ticket = require('../models/Ticket');
const AppError = require('../utils/AppError');
const logActivity = require('../utils/activityLogger');
const { getPagination, paginateResponse } = require('../utils/pagination');

exports.createTicket = async (req, res, next) => {
  try {
    const { title, description, type } = req.body;
    const ticket = await Ticket.create({
      employeeId: req.user._id, // User logic maps Employee -> User
      title,
      description,
      type
    });
    
    logActivity({ userId: req.user._id, action: 'CREATE_TICKET', entity: 'Ticket', entityId: ticket._id, ip: req.ip });
    res.status(201).json({ success: true, data: ticket });
  } catch (err) { next(err); }
};

exports.getEmployeeTickets = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { employeeId: req.user._id };

    const [tickets, total] = await Promise.all([
      Ticket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Ticket.countDocuments(filter)
    ]);

    res.json({ success: true, ...paginateResponse(tickets, total, page, limit) });
  } catch (err) { next(err); }
};

exports.getAllTickets = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [tickets, total] = await Promise.all([
      Ticket.find(filter).populate('employeeId', 'name email').populate('adminId', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Ticket.countDocuments(filter)
    ]);

    res.json({ success: true, ...paginateResponse(tickets, total, page, limit) });
  } catch (err) { next(err); }
};

exports.respondToTicket = async (req, res, next) => {
  try {
    const { response, status } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) throw new AppError('Ticket not found', 404);

    ticket.adminResponse = response || ticket.adminResponse;
    ticket.status = status || ticket.status;
    ticket.adminId = req.user._id;
    await ticket.save();

    logActivity({ userId: req.user._id, action: 'RESPOND_TICKET', entity: 'Ticket', entityId: ticket._id, ip: req.ip });
    res.json({ success: true, data: ticket });
  } catch (err) { next(err); }
};

exports.resetEmployeePassword = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('employeeId');
    if (!ticket) throw new AppError('Ticket not found', 404);
    if (ticket.type !== 'password_reset') throw new AppError('Not a password reset ticket', 400);

    const User = require('../models/User');
    const employeeUser = await User.findById(ticket.employeeId._id);
    if (!employeeUser) throw new AppError('Employee user not found', 404);

    const newPassword = req.body.password || (employeeUser.name.replace(/\s+/g, '').toLowerCase() + '@laptopwms');
    employeeUser.password = newPassword;
    await employeeUser.save();

    const Employee = require('../models/Employee');
    const employeeProfile = await Employee.findOne({ email: employeeUser.email });
    if (employeeProfile) {
      employeeProfile.plainPassword = newPassword;
      await employeeProfile.save();
    }

    ticket.adminResponse = `Your password has been successfully reset. New Password: ${newPassword}\nPlease keep it safe.`;
    ticket.status = 'solved';
    ticket.adminId = req.user._id;
    await ticket.save();

    logActivity({ userId: req.user._id, action: 'RESET_PASSWORD_VIA_TICKET', entity: 'Ticket', entityId: ticket._id, ip: req.ip });
    res.json({ success: true, data: ticket, newPassword });
  } catch (err) { next(err); }
};

exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError('Email is required', 400);

    const User = require('../models/User');
    const user = await User.findOne({ email, role: 'employee' });
    if (!user) {
      // Return a 200 anyway so we don't leak user existence
      return res.json({ success: true, message: 'If an employee account exists for this email, a reset request ticket has been raised.' });
    }

    // Check if an open reset ticket already exists
    const existingTicket = await Ticket.findOne({ employeeId: user._id, type: 'password_reset', status: 'open' });
    if (existingTicket) {
      return res.json({ success: true, message: 'A password reset request is already active for this account.' });
    }

    await Ticket.create({
      employeeId: user._id,
      title: 'Password change requested from login screen',
      description: 'The employee requested a password reset from the login screen.',
      type: 'password_reset'
    });

    res.json({ success: true, message: 'If an employee account exists for this email, a reset request ticket has been raised.' });
  } catch (err) { next(err); }
};
