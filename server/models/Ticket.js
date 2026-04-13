const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['hardware', 'software', 'other'], default: 'hardware' },
  status: { type: String, enum: ['open', 'solved'], default: 'open' },
  adminResponse: { type: String },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
