const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { protect, restrictTo } = require('../middlewares/auth');

router.use(protect);

// Employee routes
router.post('/', restrictTo('employee'), ticketController.createTicket);
router.get('/my-tickets', restrictTo('employee'), ticketController.getEmployeeTickets);

// Admin / Service routes
router.get('/', restrictTo('admin', 'service'), ticketController.getAllTickets);
router.put('/:id/respond', restrictTo('admin', 'service'), ticketController.respondToTicket);

module.exports = router;
