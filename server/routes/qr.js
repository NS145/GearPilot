const router = require('express').Router();
const { getTrayByQR } = require('../controllers/trayController');
const { protect } = require('../middlewares/auth');

router.use(protect);
router.get('/tray/:code', getTrayByQR);

module.exports = router;
