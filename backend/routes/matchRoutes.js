// routes/matchRoutes.js
const express = require('express');
const router = express.Router();
const {
  createMatch,
  getMatchesForTournament,
  updateMatchSchedule,
  updateMatchResult,
} = require('../controllers/matchController');
const { protect, authorize } = require('../middleware/auth');

router.get('/tournament/:tournamentId', getMatchesForTournament);
router.post('/', protect, authorize('organizer'), createMatch);
router.put('/:id', protect, authorize('organizer'), updateMatchSchedule);
router.put('/:id/result', protect, authorize('organizer'), updateMatchResult);

module.exports = router;
