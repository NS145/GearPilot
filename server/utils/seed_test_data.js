require('dotenv').config();
const mongoose = require('mongoose');
const Laptop = require('../models/Laptop');
const Employee = require('../models/Employee');
const Rack = require('../models/Rack');
const Tray = require('../models/Tray');

const seedTestData = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const rack = await Rack.create({ rackNumber: 'Test-Rack-1', location: 'A', status: 'active' });
  const tray = await Tray.create({ trayNumber: 'Test-Tray-1', rackId: rack._id, status: 'occupied' });
  const laptop = await Laptop.create({ 
    model: 'Test MacBook', 
    ram: '16GB', 
    storage: '512GB', 
    serialNumber: 'SN-TEST-123', 
    purchaseDate: new Date(), 
    vendor: 'Apple', 
    trayId: tray._id, 
    status: 'available' 
  });
  
  const employee = await Employee.create({ 
    employeeId: 'EMP-TEST-999', 
    name: 'Test Employee', 
    email: 'employee@test.com', 
    department: 'Engineering', 
    status: 'active' 
  });

  console.log('Test data created');
  process.exit(0);
};

seedTestData().catch(err => { console.error(err); process.exit(1); });
