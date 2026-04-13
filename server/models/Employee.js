const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  department: { type: String, required: true, trim: true },
  plainPassword: { type: String, trim: true },
  status: { type: String, enum: ['active', 'exited'], default: 'active' },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

employeeSchema.pre(/^find/, function (next) {
  this.where({ deletedAt: null });
  next();
});

employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ name: 'text', employeeId: 'text' });

module.exports = mongoose.model('Employee', employeeSchema);
