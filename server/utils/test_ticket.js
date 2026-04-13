require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Ticket = require('../models/Ticket');

const testTicket = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const emp = await User.findOne({ email: 'employee@test.com' });
  if (emp) {
    try {
      const ticket = await Ticket.create({
         employeeId: emp._id,
         title: 'Keyboard issue',
         description: 'Spacebar is sticky',
         type: 'hardware'
      });
      console.log('Ticket created:', ticket);
    } catch(err) {
      console.log('Ticket error:', err.message);
    }
  } else {
    console.log('Test setup missing employee user');
  }
  process.exit(0);
};

testTicket();
