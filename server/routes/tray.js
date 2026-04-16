const router = require('express').Router();
const ctrl = require('../controllers/trayController');
const { protect, authorize } = require('../middlewares/auth');
const { validate, traySchema, bulkTraySchema } = require('../validators');

router.use(protect);
router.get('/', ctrl.getAllTrays);
router.get('/by-qr/:code', ctrl.getTrayByQR);
router.get('/next-number/:rackId', ctrl.suggestTrayNumber);
router.get('/:id', ctrl.getTray);
router.post('/', authorize('admin'), validate(traySchema), ctrl.createTray);
router.post('/bulk', authorize('admin'), validate(bulkTraySchema), ctrl.bulkCreateTrays);
router.put('/:id', authorize('admin', 'service'), ctrl.updateTray);
router.delete('/:id', authorize('admin'), ctrl.deleteTray);

module.exports = router;
