// controllers/dashboardController.js
// Aggregates summary stats for the Organizer and Player dashboards

const Tournament = require('../models/Tournament');
const Registration = require('../models/Registration');
const Match = require('../models/Match');

// @route  GET /api/dashboard/organizer
// @access Private (Organizer only)
const getOrganizerDashboard = async (req, res, next) => {
  try {
    const organizerId = req.user._id;

    const tournaments = await Tournament.find({ organizer: organizerId });
    const tournamentIds = tournaments.map((t) => t._id);

    const totalTournaments = tournaments.length;

    const totalRegistrations = await Registration.countDocuments({
      tournament: { $in: tournamentIds },
    });

    // Count unique players across all of this organizer's tournaments
    const distinctPlayers = await Registration.distinct('player', {
      tournament: { $in: tournamentIds },
      status: 'Approved',
    });

    const upcomingMatches = await Match.find({
      tournament: { $in: tournamentIds },
      status: 'Scheduled',
    })
      .populate('player1', 'name')
      .populate('player2', 'name')
      .populate('tournament', 'name')
      .sort({ matchDate: 1 })
      .limit(5);

    res.json({
      totalTournaments,
      totalPlayers: distinctPlayers.length,
      totalRegistrations,
      upcomingMatches,
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/dashboard/player
// @access Private (Player only)
const getPlayerDashboard = async (req, res, next) => {
  try {
    const playerId = req.user._id;

    const registrations = await Registration.find({
      player: playerId,
      status: 'Approved',
    }).populate('tournament');

    const registeredTournaments = registrations
      .map((r) => r.tournament)
      .filter(Boolean);
    const tournamentIds = registeredTournaments.map((t) => t._id);

    const upcomingMatches = await Match.find({
      tournament: { $in: tournamentIds },
      $or: [{ player1: playerId }, { player2: playerId }],
      status: 'Scheduled',
    })
      .populate('player1', 'name')
      .populate('player2', 'name')
      .populate('tournament', 'name')
      .sort({ matchDate: 1 });

    const completedTournaments = registeredTournaments.filter(
      (t) => t && t.status === 'Completed'
    );

    res.json({
      registeredTournaments,
      upcomingMatches,
      completedTournaments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrganizerDashboard, getPlayerDashboard };
