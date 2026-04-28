const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  laptopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Laptop', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  assignedDate: { type: Date, default: Date.now },
  returnedDate: { type: Date, default: null },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  returnedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  notes: { type: String, trim: true },
  status: { type: String, enum: ['requested', 'active', 'returned'], default: 'requested' }
}, { timestamps: true });

assignmentSchema.index({ laptopId: 1, status: 1 });
assignmentSchema.index({ employeeId: 1, status: 1 });
assignmentSchema.index({ assignedDate: -1 });
assignmentSchema.index({ status: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
