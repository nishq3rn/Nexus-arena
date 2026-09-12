// routes/registrationRoutes.js
const express = require('express');
const router = express.Router();
const {
  joinTournament,
  cancelRegistration,
  approveRegistration,
  rejectRegistration,
  getRegistrationsForTournament,
  getMyRegistrations,
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/mine', protect, authorize('player'), getMyRegistrations);
router.get('/tournament/:tournamentId', protect, authorize('organizer'), getRegistrationsForTournament);
router.post('/:tournamentId', protect, authorize('player'), joinTournament);
router.put('/cancel/:id', protect, authorize('player'), cancelRegistration);
router.put('/:id/approve', protect, authorize('organizer'), approveRegistration);
router.put('/:id/reject', protect, authorize('organizer'), rejectRegistration);

module.exports = router;
