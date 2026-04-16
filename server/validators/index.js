const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const msg = error.details.map(d => d.message).join(', ');
    return res.status(400).json({ success: false, message: msg });
  }
  next();
};

// Auth
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'service').default('service')
});

// Rack
const rackSchema = Joi.object({
  rackNumber: Joi.string().required(),
  location: Joi.string().optional().allow(''),
  status: Joi.string().valid('active', 'maintenance').optional(),
  notes: Joi.string().optional().allow('')
});

// Tray
const traySchema = Joi.object({
  trayNumber: Joi.string().required(),
  rackId: Joi.string().required(),
  status: Joi.string().valid('free', 'occupied', 'maintenance').optional(),
  notes: Joi.string().optional().allow('')
});

const bulkTraySchema = Joi.object({
  rackId: Joi.string().required(),
  prefix: Joi.string().optional().allow(''),
  startNumber: Joi.number().min(1).required(),
  quantity: Joi.number().min(1).max(50).required()
});

// Laptop
const laptopSchema = Joi.object({
  model: Joi.string().required(),
  ram: Joi.string().required(),
  storage: Joi.string().required(),
  serialNumber: Joi.string().required(),
  purchaseDate: Joi.date().required(),
  vendor: Joi.string().required(),
  trayId: Joi.string().optional().allow(null, ''),
  notes: Joi.string().optional().allow('')
});

// Employee
const employeeSchema = Joi.object({
  employeeId: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  department: Joi.string().required(),
  plainPassword: Joi.string().min(6).optional().allow(''),
  status: Joi.string().valid('active', 'exited').optional()
});

// Assignment
const assignSchema = Joi.object({
  employeeId: Joi.string().required(),
  notes: Joi.string().optional().allow('')
});

const returnSchema = Joi.object({
  assignmentId: Joi.string().required(),
  notes: Joi.string().optional().allow('')
});

module.exports = {
  validate,
  loginSchema,
  registerSchema,
  rackSchema,
  traySchema,
  bulkTraySchema,
  laptopSchema,
  employeeSchema,
  assignSchema,
  returnSchema
};
