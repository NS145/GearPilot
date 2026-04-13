require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmins = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Check and create Admin
  let admin = await User.findOne({ email: 'admin@wms.com' });
  if (!admin) {
    await User.create({ name: 'Admin User', email: 'admin@wms.com', password: 'Admin@123', role: 'admin' });
    console.log('Admin account created.');
  } else {
    console.log('Admin account already exists.');
  }

  // Check and create Service
  let service = await User.findOne({ email: 'service@wms.com' });
  if (!service) {
    await User.create({ name: 'Service Tech', email: 'service@wms.com', password: 'Service@123', role: 'service' });
    console.log('Service account created.');
  } else {
    console.log('Service account already exists.');
  }

  process.exit(0);
};

seedAdmins().catch(err => { console.error(err); process.exit(1); });
