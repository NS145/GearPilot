require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const rackRoutes = require('./routes/rack');
const trayRoutes = require('./routes/tray');
const laptopRoutes = require('./routes/laptop');
const assignmentRoutes = require('./routes/assignment');
const employeeRoutes = require('./routes/employee');
const qrRoutes = require('./routes/qr');
const activityRoutes = require('./routes/activity');
const ticketRoutes = require('./routes/ticket');

const app = express();

// Connect to MongoDB
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rack', rackRoutes);
app.use('/api/tray', trayRoutes);
app.use('/api/laptop', laptopRoutes);
app.use('/api/assignment', assignmentRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/tickets', ticketRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

module.exports = app;
