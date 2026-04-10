const jwt = require('jsonwebtoken');
const User = require('../models/User');

const AppError = require('../utils/AppError');

// Protect routes - verify JWT
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) throw new AppError('Not authorized, no token', 401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) throw new AppError('User no longer exists', 401);

    next();
  } catch (err) {
    next(err);
  }
};

// Restrict to specific roles
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError(`Role '${req.user.role}' is not authorized for this action`, 403));
  }
  next();
};

module.exports = { protect, authorize };
