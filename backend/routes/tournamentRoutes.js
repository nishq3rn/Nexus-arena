// routes/tournamentRoutes.js
const express = require('express');
const router = express.Router();
const {
  createTournament,
  getTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
  getMyTournaments,
} = require('../controllers/tournamentController');
const { protect, authorize } = require('../middleware/auth');

// IMPORTANT: specific routes before the /:id catch-all route
router.get('/organizer/mine', protect, authorize('organizer'), getMyTournaments);

router.route('/')
  .get(getTournaments)
  .post(protect, authorize('organizer'), createTournament);

router.route('/:id')
  .get(getTournamentById)
  .put(protect, authorize('organizer'), updateTournament)
  .delete(protect, authorize('organizer'), deleteTournament);

module.exports = router;
