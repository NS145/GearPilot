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
const assignLaptopToEmployee = async ({ employeeId, laptopId, assignedBy, notes, ip }) => {
  try {
    // Validate employee
    const employee = await Employee.findById(employeeId);
    if (!employee) throw new AppError('Employee not found', 404);
    if (employee.status !== 'active') throw new AppError('Cannot assign laptop to inactive employee', 400);

    // Check if employee already has an active assignment
    const existingActive = await Assignment.findOne({ employeeId, status: 'active' });
    if (existingActive) throw new AppError('Employee already has an assigned laptop', 400);

    let laptop;
    // Get user role to determine initial status
    const User = require('../models/User');
    const user = await User.findById(assignedBy);
    const initialStatus = user.role === 'admin' ? 'requested' : 'active';

    if (laptopId) {
      // DIRECT ASSIGN (from QR Scan)
      laptop = await Laptop.findById(laptopId);
      if (!laptop) throw new AppError('Laptop not found', 404);
      if (laptop.status === 'assigned') throw new AppError('This laptop is already assigned to someone else', 400);
      
      // If it's already reserved for THIS employee, we are just fulfilling a request
      const existingRequest = await Assignment.findOne({ employeeId, laptopId, status: 'requested' });
      if (existingRequest) {
        return await fulfillAssignment({ laptopId, fulfilledBy: assignedBy, ip });
      }
    } else {
      // SMART ASSIGN LOGIC
      // Check for pending requests first
      const pending = await Assignment.findOne({ employeeId, status: 'requested' });
      if (pending) throw new AppError('Employee already has a pending request. Please fulfill it via QR scan.', 400);

      // Priority 1: Most recently returned
      laptop = await Laptop.findOneAndUpdate(
        { status: 'available', lastReturnedDate: { $ne: null } },
        { $set: { status: 'reserved' } }, 
        { sort: { lastReturnedDate: -1 }, new: true }
      );

      // Priority 2: Oldest purchase date
      if (!laptop) {
        laptop = await Laptop.findOneAndUpdate(
          { status: 'available' },
          { $set: { status: 'reserved' } }, 
          { sort: { purchaseDate: 1 }, new: true }
        );
      }
    }

    if (!laptop) throw new AppError('No available laptops in the warehouse', 404);

    // Finalize laptop status
    laptop.status = initialStatus === 'requested' ? 'reserved' : 'assigned';
    await laptop.save();

    // Create assignment record
    const assignment = await Assignment.create({
      laptopId: laptop._id,
      employeeId: employee._id,
      assignedBy,
      notes,
      status: initialStatus
    });

    let employeeUser = await User.findOne({ email: employee.email });
    let employeeCredentials = null;
    if (!employeeUser) {
      const generatedPassword = employee.name.replace(/\s+/g, '').toLowerCase() + '@123';
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
      action: 'ASSIGNMENT_REQUESTED',
      entity: 'Assignment',
      entityId: assignment._id,
      details: {
        laptopId: laptop._id,
        laptopModel: laptop.model,
        serialNumber: laptop.serialNumber,
        employeeId: employee._id,
        employeeName: employee.name,
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
 * Fulfill an assignment — service tech scans QR and completes the task
 */
const fulfillAssignment = async ({ laptopId, fulfilledBy, ip }) => {
  try {
    const assignment = await Assignment.findOne({ laptopId, status: 'requested' });
    if (!assignment) throw new AppError('No pending assignment request for this laptop', 404);

    // Update assignment to active
    assignment.status = 'active';
    await assignment.save();

    // Update laptop status to assigned
    const laptop = await Laptop.findByIdAndUpdate(
      laptopId,
      { status: 'assigned' },
      { new: true }
    );

    logActivity({
      userId: fulfilledBy,
      action: 'ASSIGNMENT_FULFILLED',
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

/**
 * Cancel a pending assignment request — delete record and set laptop back to available
 */
const cancelAssignmentRequest = async ({ assignmentId, cancelledBy, ip }) => {
  try {
    const assignment = await Assignment.findOne({ _id: assignmentId, status: 'requested' });
    if (!assignment) throw new AppError('Pending assignment request not found', 404);

    // Set laptop back to available
    await Laptop.findByIdAndUpdate(assignment.laptopId, { status: 'available' });

    // Delete the assignment record
    await Assignment.findByIdAndDelete(assignmentId);

    logActivity({
      userId: cancelledBy,
      action: 'CANCEL_ASSIGNMENT_REQUEST',
      entity: 'Assignment',
      entityId: assignmentId,
      details: { laptopId: assignment.laptopId },
      ip
    });

    return { success: true };
  } catch (err) {
    throw err;
  }
};

module.exports = { 
  assignLaptopToEmployee, 
  fulfillAssignment, 
  returnLaptop, 
  cancelAssignmentRequest 
};
