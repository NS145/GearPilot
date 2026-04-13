require('dotenv').config();
const mongoose = require('mongoose');

const Rack = require('../models/Rack');
const Tray = require('../models/Tray');
const Laptop = require('../models/Laptop');
const Employee = require('../models/Employee');

const seedMockData = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear relevant collections
  await Promise.all([
    Rack.deleteMany({}),
    Tray.deleteMany({}),
    Laptop.deleteMany({}),
    Employee.deleteMany({}) // Not User, so Admin and Employee users stay
  ]);

  // Racks
  const racks = await Rack.create([
    { rackNumber: 'R-01', location: 'Aisle A', status: 'active' },
    { rackNumber: 'R-02', location: 'Aisle B', status: 'active' }
  ]);

  // Trays
  const trayData = [];
  for (let i = 1; i <= 5; i++) trayData.push({ trayNumber: `T-0${i}`, rackId: racks[0]._id, status: 'free' });
  for (let i = 6; i <= 10; i++) trayData.push({ trayNumber: `T-0${i}`, rackId: racks[1]._id, status: 'free' });
  const trays = await Tray.create(trayData);

  // Laptops
  const laptopData = [
    { model: 'Dell Latitude 5420', ram: '16GB', storage: '512GB SSD', serialNumber: 'SN-DELL-001', purchaseDate: new Date('2022-01-15'), vendor: 'Dell', trayId: trays[0]._id, status: 'available' },
    { model: 'HP EliteBook 840', ram: '8GB', storage: '256GB SSD', serialNumber: 'SN-HP-001', purchaseDate: new Date('2021-06-10'), vendor: 'HP', trayId: trays[1]._id, status: 'available', lastReturnedDate: new Date('2023-10-01') },
    { model: 'Lenovo ThinkPad T14', ram: '16GB', storage: '512GB SSD', serialNumber: 'SN-LEN-001', purchaseDate: new Date('2023-03-20'), vendor: 'Lenovo', trayId: trays[2]._id, status: 'available' },
    { model: 'Apple MacBook Pro M2', ram: '16GB', storage: '512GB SSD', serialNumber: 'SN-APPLE-001', purchaseDate: new Date('2023-08-01'), vendor: 'Apple', trayId: trays[3]._id, status: 'available', lastReturnedDate: new Date('2024-01-10') }
  ];
  await Laptop.create(laptopData);

  for (let i = 0; i < 4; i++) {
    await Tray.findByIdAndUpdate(trays[i]._id, { status: 'occupied' });
  }

  // Employees
  await Employee.create([
    { employeeId: 'EMP-101', name: 'Alice Johnson', email: 'alice@company.com', department: 'Engineering' },
    { employeeId: 'EMP-102', name: 'Bob Smith', email: 'bob@company.com', department: 'Marketing' },
    { employeeId: 'EMP-103', name: 'Charlie Davis', email: 'charlie@company.com', department: 'Sales' },
    { employeeId: 'EMP-104', name: 'Diana Prince', email: 'diana@company.com', department: 'HR' }
  ]);

  console.log('✅ Dummy Warehouse and Team populated!');
  process.exit(0);
};

seedMockData().catch(err => { console.error(err); process.exit(1); });
