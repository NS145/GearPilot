const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const logActivity = require('../utils/activityLogger');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role });
    const token = signToken(user._id);

    logActivity({ userId: user._id, action: 'REGISTER', entity: 'User', entityId: user._id, ip: req.ip });

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl }
    });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      throw new AppError('Invalid credentials', 401);
    }
    if (!user.isActive) throw new AppError('Account is deactivated', 403);

    const token = signToken(user._id);
    logActivity({ userId: user._id, action: 'LOGIN', entity: 'User', entityId: user._id, ip: req.ip });

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl }
    });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, avatarUrl } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) throw new AppError('User not found', 404);

    if (name) user.name = name;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    
    await user.save();
    res.json({ success: true, user });
  } catch (err) { next(err); }
};
