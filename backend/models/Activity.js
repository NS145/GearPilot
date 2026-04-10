const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true }, // e.g. 'ASSIGN_LAPTOP', 'RETURN_LAPTOP'
  entity: { type: String }, // 'Laptop', 'Rack', 'Tray', etc.
  entityId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: mongoose.Schema.Types.Mixed }, // any extra context
  ip: { type: String }
}, { timestamps: true });

activitySchema.index({ userId: 1 });
activitySchema.index({ action: 1 });
activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
