const mongoose = require('mongoose');

const rackSchema = new mongoose.Schema({
  rackNumber: { type: String, required: true, unique: true, trim: true },
  location: { type: String, trim: true },
  status: { type: String, enum: ['active', 'maintenance'], default: 'active' },
  notes: { type: String, trim: true },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

rackSchema.pre(/^find/, function (next) {
  this.where({ deletedAt: null });
  next();
});

rackSchema.index({ rackNumber: 1 });
rackSchema.index({ status: 1 });

module.exports = mongoose.model('Rack', rackSchema);
