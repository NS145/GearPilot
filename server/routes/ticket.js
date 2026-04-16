const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { protect, authorize } = require('../middlewares/auth');

// Unauthenticated password reset request
router.post('/request-reset', ticketController.requestPasswordReset);

router.use(protect);

// Employee routes
router.post('/', authorize('employee'), ticketController.createTicket);
router.get('/my-tickets', authorize('employee'), ticketController.getEmployeeTickets);

// Admin / Service routes
router.get('/', authorize('admin', 'service'), ticketController.getAllTickets);
router.put('/:id/respond', authorize('admin', 'service'), ticketController.respondToTicket);
router.put('/:id/reset-password', authorize('admin'), ticketController.resetEmployeePassword);

module.exports = router;
