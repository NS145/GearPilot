const Activity = require('../models/Activity');
const { getPagination, paginateResponse } = require('../utils/pagination');

exports.getActivities = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.entity) filter.entity = req.query.entity;
    if (req.query.userId) filter.userId = req.query.userId;

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Activity.countDocuments(filter)
    ]);

    res.json({ success: true, ...paginateResponse(activities, total, page, limit) });
  } catch (err) { next(err); }
};
