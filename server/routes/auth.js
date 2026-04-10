const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { validate, loginSchema, registerSchema } = require('../validators');

router.post('/register', validate(registerSchema), ctrl.register);
router.post('/login', validate(loginSchema), ctrl.login);
router.get('/me', protect, ctrl.getMe);

module.exports = router;
