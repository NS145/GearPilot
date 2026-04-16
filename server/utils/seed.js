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

  console.log('\n✅ Seed complete!');
  console.log('Admin: admin@wms.com / Admin@123');
  console.log('Service: service@wms.com / Service@123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
