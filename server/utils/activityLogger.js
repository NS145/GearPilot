const Activity = require('../models/Activity');

const logActivity = async ({ userId, action, entity, entityId, details, ip }) => {
  try {
    await Activity.create({ userId, action, entity, entityId, details, ip });
  } catch (err) {
    // Non-blocking — log but don't throw
    console.error('Activity log error:', err.message);
  }
};

module.exports = logActivity;
