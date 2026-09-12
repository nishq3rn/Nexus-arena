// controllers/resultController.js
// Organizer publishes final tournament results based on the leaderboard

const Result = require('../models/Result');
const Leaderboard = require('../models/Leaderboard');
const Tournament = require('../models/Tournament');

// @route  POST /api/results/:tournamentId/publish
// @access Private (Organizer only)
const publishResult = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId);

    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    if (tournament.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this tournament' });
    }

    const leaderboard = await Leaderboard.find({ tournament: tournament._id })
      .populate('player', 'name')
      .sort({ points: -1, wins: -1 });

    if (leaderboard.length === 0) {
      return res.status(400).json({ message: 'No leaderboard data to publish results from' });
    }

    const finalRankings = leaderboard
      .filter((entry) => entry && entry.player)
      .map((entry, index) => ({
        player: entry.player._id || entry.player,
        rank: index + 1,
        points: entry.points || 0,
      }));

    const result = await Result.findOneAndUpdate(
      { tournament: tournament._id },
      {
        tournament: tournament._id,
        champion: leaderboard[0]?.player?._id || leaderboard[0]?.player || null,
        runnerUp: leaderboard[1]?.player?._id || leaderboard[1]?.player || null,
        thirdPosition: leaderboard[2]?.player?._id || leaderboard[2]?.player || null,
        finalRankings,
        publishedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    tournament.status = 'Completed';
    await tournament.save();

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/results/:tournamentId
// @access Public
const getResult = async (req, res, next) => {
  try {
    const result = await Result.findOne({ tournament: req.params.tournamentId })
      .populate('champion', 'name')
      .populate('runnerUp', 'name')
      .populate('thirdPosition', 'name')
      .populate('finalRankings.player', 'name');

    if (!result) {
      return res.status(404).json({ message: 'Results not published yet for this tournament' });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { publishResult, getResult };
