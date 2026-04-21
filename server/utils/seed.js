require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/User');
const Rack = require('../models/Rack');
const Tray = require('../models/Tray');
const Laptop = require('../models/Laptop');
const Employee = require('../models/Employee');
const Assignment = require('../models/Assignment');
const Activity = require('../models/Activity');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear collections
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Rack.deleteMany({}),
    Tray.deleteMany({}),
    Laptop.deleteMany({}),
    Employee.deleteMany({}),
    Assignment.deleteMany({}),
    Activity.deleteMany({})
  ]);

  // 1. Users
  const users = await User.create([
    { name: 'Admin User', email: 'admin@wms.com', password: 'Admin@123', role: 'admin' },
    { name: 'Service Tech', email: 'service@wms.com', password: 'Service@123', role: 'service' }
  ]);
  console.log('✅ Users seeded');

  // 2. Racks
  const racks = await Rack.create([
    { rackNumber: 'R-01', location: 'Section A, Aisle 1' },
    { rackNumber: 'R-02', location: 'Section A, Aisle 2' },
    { rackNumber: 'R-03', location: 'Section B, Aisle 1' },
    { rackNumber: 'R-04', location: 'Section B, Aisle 2' },
    { rackNumber: 'R-05', location: 'Warehouse Central' },
  ]);
  console.log('✅ Racks seeded');

  // 3. Trays
  const trays = [];
  for (const rack of racks) {
    const rackTrays = await Tray.create([
      { trayNumber: 'T1', rackId: rack._id },
      { trayNumber: 'T2', rackId: rack._id },
      { trayNumber: 'T3', rackId: rack._id },
    ]);
    trays.push(...rackTrays);
  }
  console.log('✅ Trays seeded');

  // 4. Employees & Employee Users
  const depts = ['Engineering', 'Sales', 'HR', 'Finance', 'Marketing'];
  const employeeData = [
    { employeeId: 'EMP001', name: 'Alice Johnson', email: 'alice@example.com', department: 'Engineering' },
    { employeeId: 'EMP002', name: 'Bob Smith', email: 'bob@example.com', department: 'Sales' },
    { employeeId: 'EMP003', name: 'Charlie Davis', email: 'charlie@example.com', department: 'HR' },
    { employeeId: 'EMP004', name: 'Diana Prince', email: 'diana@example.com', department: 'Engineering' },
    { employeeId: 'EMP005', name: 'Evan Wright', email: 'evan@example.com', department: 'Finance' },
    { employeeId: 'EMP006', name: 'Fiona G.', email: 'fiona@example.com', department: 'Marketing' },
    { employeeId: 'EMP007', name: 'George K.', email: 'george@example.com', department: 'Engineering' },
    { employeeId: 'EMP008', name: 'Hannah S.', email: 'hannah@example.com', department: 'Sales' },
    { employeeId: 'EMP009', name: 'Ian M.', email: 'ian@example.com', department: 'HR' },
    { employeeId: 'EMP010', name: 'Jane D.', email: 'jane@example.com', department: 'Marketing' },
  ];

  const employees = [];
  for (const emp of employeeData) {
    const password = emp.name.replace(/\s+/g, '').toLowerCase() + '@123';
    const newEmp = await Employee.create({ ...emp, plainPassword: password });
    
    // Create corresponding User
    await User.create({
      name: emp.name,
      email: emp.email,
      password: password,
      role: 'employee'
    });
    employees.push(newEmp);
  }
  console.log('✅ Employees and User accounts seeded');

  // 5. Laptops
  const laptopModels = [
    { model: 'MacBook Pro 14"', ram: '16GB', storage: '512GB SSD', vendor: 'Apple' },
    { model: 'Dell XPS 15', ram: '32GB', storage: '1TB SSD', vendor: 'Dell' },
    { model: 'ThinkPad X1 Carbon', ram: '16GB', storage: '512GB SSD', vendor: 'Lenovo' },
    { model: 'HP Spectre x360', ram: '16GB', storage: '1TB SSD', vendor: 'HP' },
    { model: 'MacBook Air M2', ram: '8GB', storage: '256GB SSD', vendor: 'Apple' },
  ];

  const laptops = [];
  for (let i = 0; i < 15; i++) {
    const modelInfo = laptopModels[i % laptopModels.length];
    const laptop = await Laptop.create({
      ...modelInfo,
      serialNumber: `SN-${1000 + i}`,
      purchaseDate: new Date(Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000)), // Random date in last year
      status: 'available',
      trayId: trays[i]._id,
      notes: `Fresh stock - Batch ${Math.ceil((i+1)/5)}`
    });
    
    // Update Tray status to occupied
    await Tray.findByIdAndUpdate(trays[i]._id, { status: 'occupied' });
    laptops.push(laptop);
  }
  console.log('✅ Laptops seeded and linked to trays');

  // 6. Assignments (Create 3 dummy assignments)
  console.log('Creating dummy assignments...');
  for (let i = 0; i < 3; i++) {
    const laptop = laptops[i];
    const employee = employees[i];
    
    await Assignment.create({
      laptopId: laptop._id,
      employeeId: employee._id,
      assignedBy: users[0]._id, // Admin
      notes: 'Initial assignment for testing.',
      status: 'active'
    });

    // Mark laptop as assigned
    await Laptop.findByIdAndUpdate(laptop._id, { status: 'assigned' });
  }
  console.log('✅ Assignments seeded');

  console.log('\n🚀 ALL DONE! Database is ready.');
  console.log('-----------------------------------');
  console.log('Admin: admin@wms.com / Admin@123');
  console.log('Service: service@wms.com / Service@123');
  console.log('-----------------------------------');
  
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
