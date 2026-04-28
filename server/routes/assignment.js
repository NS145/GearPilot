const router = require('express').Router();
const ctrl = require('../controllers/assignmentController');
const { protect, authorize } = require('../middlewares/auth');
const { validate, assignSchema, returnSchema } = require('../validators');

router.use(protect);
router.get('/', ctrl.getAssignments);
router.get('/:id', ctrl.getAssignment);
router.post('/assign', authorize('admin'), validate(assignSchema), ctrl.assign);
router.post('/fulfill', authorize('admin', 'service'), ctrl.fulfill);
router.post('/return', authorize('admin', 'service'), validate(returnSchema), ctrl.returnLaptop);

module.exports = router;
