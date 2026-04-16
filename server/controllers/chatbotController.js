const Laptop = require('../models/Laptop');
const Employee = require('../models/Employee');
const Rack = require('../models/Rack');
const ObjectUtils = require('../utils/AppError'); // Maybe use AppError if needed

exports.queryBot = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) return res.json({ success: true, message: "Hello! I am GearBot. Ask me about an employee, laptop, or rack." });

    const lowerQuery = query.toLowerCase();
    
    // Very simple NLP detection
    if (lowerQuery.includes('employee') || lowerQuery.includes('who is')) {
      const parts = lowerQuery.split(' ');
      const nameGuess = parts[parts.length - 1]; // very naive guess
      const employees = await Employee.find({ $or: [{ name: new RegExp(nameGuess, 'i') }, { employeeId: new RegExp(nameGuess, 'i') }] }).limit(3);
      if (employees.length) {
        let msg = `I found these employees:\n`;
        employees.forEach(e => msg += `- ${e.name} (${e.employeeId}), Dept: ${e.department}\n`);
        return res.json({ success: true, message: msg });
      } else {
        return res.json({ success: true, message: `I couldn't find any employee matching that description.` });
      }
    }

    if (lowerQuery.includes('laptop') || lowerQuery.includes('serial') || lowerQuery.includes('macbook') || lowerQuery.includes('dell')) {
      // Find laptops
      const parts = lowerQuery.split(' ');
      const hint = parts.find(p => p.length > 3 && p !== 'laptop' && p !== 'serial');
      const laptops = await Laptop.find({ $or: [{ serialNumber: new RegExp(hint || '', 'i') }, { model: new RegExp(hint || '', 'i') }] }).limit(3);
      if (laptops.length) {
        let msg = `Here are the laptops I found:\n`;
        laptops.forEach(l => msg += `- ${l.model} (${l.serialNumber}) | Status: ${l.status}\n`);
        return res.json({ success: true, message: msg });
      } else {
        return res.json({ success: true, message: `I couldn't find any laptop.` });
      }
    }

    if (lowerQuery.includes('rack')) {
      const racks = await Rack.find().limit(5);
      let msg = `Here are the active racks in the warehouse:\n`;
      racks.forEach(r => msg += `- ${r.rackNumber} situated at ${r.location} (Status: ${r.status})\n`);
      return res.json({ success: true, message: msg });
    }

    return res.json({ success: true, message: "I'm sorry, I am a simple bot. Try asking me about 'employee Alice', 'laptop', or 'rack'." });

  } catch (err) { next(err); }
};
