const mongoose = require('mongoose');
const Laptop = require('../models/Laptop');
const Assignment = require('../models/Assignment');
const Employee = require('../models/Employee');
const Tray = require('../models/Tray');
const AppError = require('../utils/AppError');
const logActivity = require('../utils/activityLogger');

/**
 * CORE ASSIGNMENT ALGORITHM
 *
 * Priority 1: Assign the laptop with the most recent lastReturnedDate
 * Priority 2: If no returned laptops → assign laptop with oldest purchaseDate
 *
 * Uses a MongoDB session for atomicity to prevent race conditions.
 */
const assignLaptopToEmployee = async ({ employeeId, assignedBy, notes, ip }) => {
  try {
    // Validate employee
    const employee = await Employee.findById(employeeId);
    if (!employee) throw new AppError('Employee not found', 404);
    if (employee.status !== 'active') throw new AppError('Cannot assign laptop to inactive employee', 400);

    // Check if employee already has an active assignment
    const existing = await Assignment.findOne({ employeeId, status: 'active' });
    if (existing) throw new AppError('Employee already has an assigned laptop', 400);

    // --- Priority 1: Most recently returned laptop ---
    let laptop = await Laptop.findOneAndUpdate(
      {
        status: 'available',
        lastReturnedDate: { $ne: null }
      },
      { $set: { status: 'assigned' } },
      {
        sort: { lastReturnedDate: -1 }, // Most recent return first
        new: true
      }
    );

    // --- Priority 2: Oldest purchase date ---
    if (!laptop) {
      laptop = await Laptop.findOneAndUpdate(
        { status: 'available' },
        { $set: { status: 'assigned' } },
        {
          sort: { purchaseDate: 1 }, // Oldest first
          new: true
        }
      );
    }

    if (!laptop) throw new AppError('No available laptops in the warehouse', 404);

    // Create assignment record
    const assignment = await Assignment.create({
      laptopId: laptop._id,
      employeeId: employee._id,
      assignedBy,
      notes,
      status: 'active'
    });

    const User = require('../models/User'); // require here to avoid circular dep if any
    let employeeUser = await User.findOne({ email: employee.email });
    let employeeCredentials = null;
    if (!employeeUser) {
      const generatedPassword = employee.name.replace(/\s+/g, '').toLowerCase() + '@laptopwms';
      employeeUser = await User.create({
        name: employee.name,
        email: employee.email,
        password: generatedPassword,
        role: 'employee'
      });
      // Store plain password in employee too
      employee.plainPassword = generatedPassword;
      await employee.save();
      employeeCredentials = { email: employee.email, password: generatedPassword };
    }

    // Log activity (non-blocking)
    logActivity({
      userId: assignedBy,
      action: 'ASSIGN_LAPTOP',
      entity: 'Assignment',
      entityId: assignment._id,
      details: {
        laptopId: laptop._id,
        laptopModel: laptop.model,
        serialNumber: laptop.serialNumber,
        employeeId: employee._id,
        employeeName: employee.name,
        priority: laptop.lastReturnedDate ? 'RETURNED_FIRST' : 'OLDEST_PURCHASE'
      },
      ip
    });

    return {
      assignment: assignment,
      laptop,
      employee,
      employeeCredentials
    };
  } catch (err) {
    throw err;
  }
};

/**
 * Return a laptop — update assignment, laptop status, lastReturnedDate
 */
const returnLaptop = async ({ assignmentId, returnedBy, notes, ip }) => {
  try {
    const assignment = await Assignment.findOne({ _id: assignmentId, status: 'active' });
    if (!assignment) throw new AppError('Active assignment not found', 404);

    const now = new Date();

    // Mark assignment returned
    assignment.status = 'returned';
    assignment.returnedDate = now;
    assignment.returnedBy = returnedBy;
    if (notes) assignment.notes = notes;
    await assignment.save();

    // Update laptop — available again, set lastReturnedDate
    const laptop = await Laptop.findByIdAndUpdate(
      assignment.laptopId,
      { status: 'available', lastReturnedDate: now },
      { new: true }
    );

    logActivity({
      userId: returnedBy,
      action: 'RETURN_LAPTOP',
      entity: 'Assignment',
      entityId: assignment._id,
      details: { laptopId: laptop._id, laptopModel: laptop.model },
      ip
    });

    return { assignment, laptop };
  } catch (err) {
    throw err;
  }
};

module.exports = { assignLaptopToEmployee, returnLaptop };
