// controllers/registrationController.js
// Players join/cancel tournaments; organizers approve/reject registrations

const Registration = require('../models/Registration');
const Tournament = require('../models/Tournament');
const Leaderboard = require('../models/Leaderboard');

// @route  POST /api/registrations/:tournamentId
// @access Private (Player only)
const joinTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.status !== 'Upcoming') {
      return res.status(400).json({ message: 'Registration closed for this tournament' });
    }

    const approvedCount = await Registration.countDocuments({
      tournament: tournament._id,
      status: 'Approved',
    });

    if (approvedCount >= tournament.maxPlayers) {
      return res.status(400).json({ message: 'Tournament is full' });
    }

    const existing = await Registration.findOne({
      tournament: tournament._id,
      player: req.user._id,
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already registered for this tournament' });
    }

    const registration = await Registration.create({
      tournament: tournament._id,
      player: req.user._id,
    });

    res.status(201).json(registration);
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/registrations/cancel/:id
// @access Private (Player who owns the registration)
const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.player.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    registration.status = 'Cancelled';
    await registration.save();

    res.json({ message: 'Registration cancelled', registration });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/registrations/:id/approve
// @access Private (Organizer only)
const approveRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('tournament');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (!registration.tournament) {
      return res.status(404).json({ message: 'Associated tournament not found' });
    }

    if (registration.tournament.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    registration.status = 'Approved';
    await registration.save();

    // Create an initial leaderboard entry for this player in this tournament
    await Leaderboard.findOneAndUpdate(
      { tournament: registration.tournament._id, player: registration.player },
      { $setOnInsert: { matchesPlayed: 0, wins: 0, losses: 0, points: 0 } },
      { upsert: true, new: true }
    );

    res.json({ message: 'Registration approved', registration });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/registrations/:id/reject
// @access Private (Organizer only)
const rejectRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('tournament');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (!registration.tournament) {
      return res.status(404).json({ message: 'Associated tournament not found' });
    }

    if (registration.tournament.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    registration.status = 'Rejected';
    await registration.save();

    res.json({ message: 'Registration rejected', registration });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/registrations/tournament/:tournamentId
// @access Private (Organizer only) - view registered players for a tournament
const getRegistrationsForTournament = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ tournament: req.params.tournamentId })
      .populate('player', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/registrations/mine
// @access Private (Player only) - view tournaments the player registered for
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ player: req.user._id })
      .populate('tournament')
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  joinTournament,
  cancelRegistration,
  approveRegistration,
  rejectRegistration,
  getRegistrationsForTournament,
  getMyRegistrations,
};
