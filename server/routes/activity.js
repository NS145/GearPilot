const router = require('express').Router();
const ctrl = require('../controllers/activityController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);
router.get('/', authorize('admin'), ctrl.getActivities);

module.exports = router;
