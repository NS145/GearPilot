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
