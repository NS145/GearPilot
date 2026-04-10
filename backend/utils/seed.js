require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/User');
const Rack = require('../models/Rack');
const Tray = require('../models/Tray');
const Laptop = require('../models/Laptop');
const Employee = require('../models/Employee');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear collections
  await Promise.all([
    User.deleteMany({}),
    Rack.deleteMany({}),
    Tray.deleteMany({}),
    Laptop.deleteMany({}),
    Employee.deleteMany({})
  ]);

  // Users
  const users = await User.create([
    { name: 'Admin User', email: 'admin@wms.com', password: 'Admin@123', role: 'admin' },
    { name: 'Service Tech', email: 'service@wms.com', password: 'Service@123', role: 'service' }
  ]);
  console.log('Users seeded');

  // Racks
  const racks = await Rack.create([
    { rackNumber: 'R-01', location: 'Aisle A', status: 'active' },
    { rackNumber: 'R-02', location: 'Aisle A', status: 'active' },
    { rackNumber: 'R-03', location: 'Aisle B', status: 'maintenance' }
  ]);
  console.log('Racks seeded');

  // Trays
  const trayData = [];
  for (let i = 1; i <= 5; i++) {
    trayData.push({ trayNumber: `T-0${i}`, rackId: racks[0]._id, status: 'free' });
  }
  for (let i = 1; i <= 3; i++) {
    trayData.push({ trayNumber: `T-0${i}`, rackId: racks[1]._id, status: 'free' });
  }
  const trays = await Tray.create(trayData);
  console.log('Trays seeded');

  // Laptops
  const laptopData = [
    { model: 'Dell Latitude 5420', ram: '16GB', storage: '512GB SSD', serialNumber: 'SN-DELL-001', purchaseDate: new Date('2022-01-15'), vendor: 'Dell India', trayId: trays[0]._id, status: 'available' },
    { model: 'HP EliteBook 840', ram: '8GB', storage: '256GB SSD', serialNumber: 'SN-HP-001', purchaseDate: new Date('2021-06-10'), vendor: 'HP Inc', trayId: trays[1]._id, status: 'available', lastReturnedDate: new Date('2023-10-01') },
    { model: 'Lenovo ThinkPad T14', ram: '16GB', storage: '512GB SSD', serialNumber: 'SN-LEN-001', purchaseDate: new Date('2023-03-20'), vendor: 'Lenovo', trayId: trays[2]._id, status: 'available' },
    { model: 'Apple MacBook Pro M2', ram: '16GB', storage: '512GB SSD', serialNumber: 'SN-APPLE-001', purchaseDate: new Date('2023-08-01'), vendor: 'Apple', trayId: trays[3]._id, status: 'available', lastReturnedDate: new Date('2024-01-10') },
    { model: 'Dell Latitude 7420', ram: '32GB', storage: '1TB SSD', serialNumber: 'SN-DELL-002', purchaseDate: new Date('2022-11-30'), vendor: 'Dell India', trayId: trays[4]._id, status: 'available' }
  ];

  await Laptop.create(laptopData);
  // Mark trays occupied
  for (let i = 0; i < 5; i++) {
    await Tray.findByIdAndUpdate(trays[i]._id, { status: 'occupied' });
  }
  console.log('Laptops seeded');

  // Employees
  await Employee.create([
    { employeeId: 'EMP-001', name: 'Alice Johnson', email: 'alice@company.com', department: 'Engineering', status: 'active' },
    { employeeId: 'EMP-002', name: 'Bob Smith', email: 'bob@company.com', department: 'Marketing', status: 'active' },
    { employeeId: 'EMP-003', name: 'Carol White', email: 'carol@company.com', department: 'HR', status: 'active' },
    { employeeId: 'EMP-004', name: 'David Lee', email: 'david@company.com', department: 'Finance', status: 'active' },
    { employeeId: 'EMP-005', name: 'Eve Davis', email: 'eve@company.com', department: 'Engineering', status: 'exited' }
  ]);
  console.log('Employees seeded');

  console.log('\n✅ Seed complete!');
  console.log('Admin: admin@wms.com / Admin@123');
  console.log('Service: service@wms.com / Service@123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
