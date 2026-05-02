const express = require('express');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const { dashboardStats } = require('../controllers/dashboardController');

const router = express.Router();
router.use(ensureAuthenticated);
router.get('/', dashboardStats);

module.exports = router;
