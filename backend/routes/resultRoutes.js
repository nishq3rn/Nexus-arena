// routes/resultRoutes.js
const express = require('express');
const router = express.Router();
const { publishResult, getResult } = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/auth');

router.post('/:tournamentId/publish', protect, authorize('organizer'), publishResult);
router.get('/:tournamentId', getResult);

module.exports = router;
