const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const traySchema = new mongoose.Schema({
  trayNumber: { type: String, required: true, trim: true },
  rackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rack', required: true },
  status: { type: String, enum: ['free', 'occupied', 'maintenance'], default: 'free' },
  qrCode: { type: String, unique: true },
  notes: { type: String, trim: true },
  deletedAt: { type: Date, default: null }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting the laptop in this tray
traySchema.virtual('laptop', {
  ref: 'Laptop',
  localField: '_id',
  foreignField: 'trayId',
  justOne: true
});

// Auto-generate QR code (UUID) on creation
traySchema.pre('validate', function (next) {
  if (!this.qrCode) {
    this.qrCode = uuidv4();
  }
  next();
});

// Compound unique: same tray number can't exist in same rack
traySchema.index({ trayNumber: 1, rackId: 1 }, { unique: true });
traySchema.index({ qrCode: 1 });
traySchema.index({ rackId: 1 });
traySchema.index({ status: 1 });

traySchema.pre(/^find/, function (next) {
  this.where({ deletedAt: null });
  next();
});

module.exports = mongoose.model('Tray', traySchema);
