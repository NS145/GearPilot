const router = require('express').Router();
const ctrl = require('../controllers/laptopController');
const { protect, authorize } = require('../middlewares/auth');
const { validate, laptopSchema } = require('../validators');

router.use(protect);
router.get('/dashboard', ctrl.getDashboard);
router.get('/', ctrl.getAllLaptops);
router.get('/:id', ctrl.getLaptop);
router.post('/', authorize('admin', 'service'), validate(laptopSchema), ctrl.createLaptop);
router.put('/:id', authorize('admin', 'service'), ctrl.updateLaptop);
router.delete('/:id', authorize('admin'), ctrl.deleteLaptop);

module.exports = router;
