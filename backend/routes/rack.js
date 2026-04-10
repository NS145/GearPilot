const router = require('express').Router();
const ctrl = require('../controllers/rackController');
const { protect, authorize } = require('../middlewares/auth');
const { validate, rackSchema } = require('../validators');

router.use(protect);
router.get('/', ctrl.getAllRacks);
router.get('/:id', ctrl.getRack);
router.post('/', authorize('admin'), validate(rackSchema), ctrl.createRack);
router.put('/:id', authorize('admin'), ctrl.updateRack);
router.delete('/:id', authorize('admin'), ctrl.deleteRack);

module.exports = router;
