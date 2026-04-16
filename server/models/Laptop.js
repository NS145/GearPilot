const mongoose = require('mongoose');

const laptopSchema = new mongoose.Schema({
  model: { type: String, required: true, trim: true },
  ram: { type: String, required: true, trim: true },
  storage: { type: String, required: true, trim: true },
  serialNumber: { type: String, required: true, unique: true, trim: true },
  purchaseDate: { type: Date, required: true },
  vendor: { type: String, required: true, trim: true },
  status: { type: String, enum: ['available', 'assigned', 'maintenance'], default: 'available' },
  trayId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tray', default: null },
  lastReturnedDate: { type: Date, default: null },
  notes: { type: String, trim: true },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

laptopSchema.pre(/^find/, function (next) {
  this.where({ deletedAt: null });
  next();
});

// Critical indexes for assignment priority logic
laptopSchema.index({ status: 1, lastReturnedDate: -1 }); // Priority 1
laptopSchema.index({ status: 1, purchaseDate: 1 });       // Priority 2
laptopSchema.index({ serialNumber: 1 });
laptopSchema.index({ trayId: 1 });
laptopSchema.index({ model: 'text' });

module.exports = mongoose.model('Laptop', laptopSchema);
