const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

// Allow Admin and Service teams
router.post('/query', authorize('admin', 'service'), chatbotController.queryBot);

module.exports = router;
