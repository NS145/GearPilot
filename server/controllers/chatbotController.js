const Laptop = require('../models/Laptop');
const Employee = require('../models/Employee');
const Rack = require('../models/Rack');
const AppError = require('../utils/AppError');

exports.queryBot = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) return res.json({ success: true, message: "Hello! I am GearBot. Click one of the options below to get started." });

    const lowerQuery = query.toLowerCase();
    
    // --- QUICK STATS ---
    if (lowerQuery.includes('stats') || lowerQuery.includes('count')) {
      const [laptops, employees, racks] = await Promise.all([
        Laptop.countDocuments(),
        Employee.countDocuments(),
        Rack.countDocuments()
      ]);
      const available = await Laptop.countDocuments({ status: 'available' });
      
      return res.json({ 
        success: true, 
        message: `📊 **Warehouse Overview**\n\n- **Total Laptops:** ${laptops} (${available} available)\n- **Registered Employees:** ${employees}\n- **Storage Racks:** ${racks}` 
      });
    }

    // --- RACKS ---
    if (lowerQuery.includes('rack')) {
      const racks = await Rack.find().limit(5);
      let msg = `🏗️ **Active Racks Status**\n\n`;
      racks.forEach(r => msg += `- **${r.rackNumber}**: ${r.location} [${r.status.toUpperCase()}]\n`);
      return res.json({ success: true, message: msg });
    }

    // --- TRAYS ---
    if (lowerQuery.includes('tray')) {
      const occupiedTrays = await Tray.find({ status: 'occupied' }).populate('rackId').limit(5);
      const count = await Tray.countDocuments({ status: 'occupied' });
      
      let msg = `📥 **Occupied Trays (${count} total)**\n\n`;
      if (occupiedTrays.length === 0) {
        msg = "All trays are currently free!";
      } else {
        occupiedTrays.forEach(t => {
          msg += `- **${t.trayNumber}** (in ${t.rackId?.rackNumber || 'Unknown Rack'})\n`;
        });
      }
      return res.json({ success: true, message: msg });
    }

    // --- EMPLOYEES ---
    if (lowerQuery.includes('employee')) {
      const employees = await Employee.find().sort({ createdAt: -1 }).limit(5);
      let msg = `👤 **Recent Employees**\n\n`;
      employees.forEach(e => msg += `- ${e.name} (${e.employeeId}) | ${e.department}\n`);
      return res.json({ success: true, message: msg });
    }

    // --- LAPTOPS ---
    if (lowerQuery.includes('laptop')) {
      const counts = await Laptop.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      let msg = `💻 **Laptop Inventory Summary**\n\n`;
      counts.forEach(c => msg += `- **${c._id.toUpperCase()}**: ${c.count}\n`);
      return res.json({ success: true, message: msg });
    }

    return res.json({ success: true, message: "I'm sorry, I couldn't process that command. Please try one of the dashboard buttons below." });

  } catch (err) { next(err); }
};
