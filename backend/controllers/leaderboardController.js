// controllers/leaderboardController.js
// Read-only endpoint: leaderboard is written to automatically by matchController

const Leaderboard = require('../models/Leaderboard');

// @route  GET /api/leaderboard/:tournamentId
// @access Public
const getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await Leaderboard.find({ tournament: req.params.tournamentId })
      .populate('player', 'name')
      .sort({ points: -1, wins: -1 });

    // Attach rank number based on sorted order
    const ranked = leaderboard.map((entry, index) => ({
      rank: index + 1,
      player: entry.player,
      matchesPlayed: entry.matchesPlayed,
      wins: entry.wins,
      losses: entry.losses,
      points: entry.points,
    }));

    res.json(ranked);
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeaderboard };
