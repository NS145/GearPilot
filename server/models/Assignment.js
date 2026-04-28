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
// PARTIAL UNIQUE INDEX: Prevents an employee from having multiple active/pending assignments
assignmentSchema.index(
  { employeeId: 1 }, 
  { unique: true, partialFilterExpression: { status: { $in: ['active', 'requested'] } } }
);
assignmentSchema.index({ assignedDate: -1 });
assignmentSchema.index({ status: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
