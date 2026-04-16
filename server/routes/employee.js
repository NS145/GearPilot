// employee.js
const router = require('express').Router();
const ctrl = require('../controllers/employeeController');
const { protect, authorize } = require('../middlewares/auth');
const { validate, employeeSchema } = require('../validators');

router.use(protect);
router.get('/', ctrl.getAllEmployees);
router.get('/:id', ctrl.getEmployee);
router.post('/', authorize('admin'), validate(employeeSchema), ctrl.createEmployee);
router.put('/:id', authorize('admin'), ctrl.updateEmployee);
router.delete('/:id', authorize('admin'), ctrl.deleteEmployee);

module.exports = router;
