// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { getOrganizerDashboard, getPlayerDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/organizer', protect, authorize('organizer'), getOrganizerDashboard);
router.get('/player', protect, authorize('player'), getPlayerDashboard);

module.exports = router;
