require('dotenv').config();
const mongoose = require('mongoose');
const { assignLaptopToEmployee } = require('../services/assignmentService');
const Employee = require('../models/Employee');
const User = require('../models/User');

const test = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const emp = await Employee.findOne({ email: 'employee@test.com' });
  const admin = await User.findOne({ role: 'admin' });
  
  if (emp && admin) {
    try {
      const result = await assignLaptopToEmployee({
         employeeId: emp._id,
         assignedBy: admin._id,
         notes: 'Test Assignment for Credentials',
         ip: '127.0.0.1'
      });
      console.log('Assignment successful!');
      console.log('Credentials:', result.employeeCredentials);
    } catch(err) {
      console.log('Assign error:', err.message);
    }
  } else {
    console.log('Test setup missing emp or admin');
  }
  process.exit(0);
};

test();
