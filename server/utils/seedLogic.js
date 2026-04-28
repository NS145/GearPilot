const mongoose = require('mongoose');
const User = require('../models/User');
const Rack = require('../models/Rack');
const Tray = require('../models/Tray');
const Laptop = require('../models/Laptop');
const Employee = require('../models/Employee');
const Assignment = require('../models/Assignment');
const Activity = require('../models/Activity');

const performSeed = async () => {
    // Clear collections
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

    // 2. Racks
    const racks = await Rack.create([
        { rackNumber: 'R-01', location: 'Section A, Aisle 1' },
        { rackNumber: 'R-02', location: 'Section A, Aisle 2' },
        { rackNumber: 'R-03', location: 'Section B, Aisle 1' },
        { rackNumber: 'R-04', location: 'Section B, Aisle 2' },
        { rackNumber: 'R-05', location: 'Warehouse Central' },
    ]);

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

    // 4. Employees & User Accounts
    const employeeData = [
        { employeeId: 'EMP001', name: 'Alice Johnson', email: 'alice@example.com', department: 'Engineering' },
        { employeeId: 'EMP002', name: 'Bob Smith', email: 'bob@example.com', department: 'Sales' },
    ];

    const employees = [];
    for (const emp of employeeData) {
        const password = emp.name.replace(/\s+/g, '').toLowerCase() + '@123';
        const newEmp = await Employee.create({ ...emp, plainPassword: password });
        await User.create({ name: emp.name, email: emp.email, password: password, role: 'employee' });
        employees.push(newEmp);
    }

    // 5. Laptops
    for (let i = 0; i < 5; i++) {
        await Laptop.create({
            model: 'MacBook Pro 14"',
            serialNumber: `SN-${1000 + i}`,
            status: 'available',
            trayId: trays[i]._id,
            vendor: 'Apple',
            ram: '16GB',
            storage: '512GB SSD'
        });
        await Tray.findByIdAndUpdate(trays[i]._id, { status: 'occupied' });
    }

    return { message: 'Database Seeded Successfully!' };
};

module.exports = performSeed;
