// controllers/matchController.js
// Organizer creates matches, assigns players, and updates results.
// Updating a result automatically updates the Leaderboard collection.

const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const Leaderboard = require('../models/Leaderboard');

// Helper: only the organizer who owns the tournament can manage its matches
const ensureOwnership = async (tournamentId, userId) => {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) return { error: 'Tournament not found', status: 404 };
  if (tournament.organizer.toString() !== userId.toString()) {
    return { error: 'Not authorized for this tournament', status: 403 };
  }
  return { tournament };
};

// @route  POST /api/matches
// @access Private (Organizer only)
const createMatch = async (req, res, next) => {
  try {
    const { tournament, round, player1, player2, matchDate, matchTime } = req.body;

    const check = await ensureOwnership(tournament, req.user._id);
    if (check.error) return res.status(check.status).json({ message: check.error });

    if (player1 === player2) {
      return res.status(400).json({ message: 'Player 1 and Player 2 must be different' });
    }

    const match = await Match.create({
      tournament,
      round,
      player1,
      player2,
      matchDate,
      matchTime,
    });

    res.status(201).json(match);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/matches/tournament/:tournamentId
// @access Public
const getMatchesForTournament = async (req, res, next) => {
  try {
    const matches = await Match.find({ tournament: req.params.tournamentId })
      .populate('player1', 'name')
      .populate('player2', 'name')
      .populate('winner', 'name')
      .sort({ matchDate: 1 });

    res.json(matches);
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/matches/:id
// Update schedule (date/time) and player assignment
// @access Private (Organizer only)
const updateMatchSchedule = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const check = await ensureOwnership(match.tournament, req.user._id);
    if (check.error) return res.status(check.status).json({ message: check.error });

    const { round, player1, player2, matchDate, matchTime, status } = req.body;

    if (round !== undefined) match.round = round;
    if (player1 !== undefined) match.player1 = player1;
    if (player2 !== undefined) match.player2 = player2;
    if (matchDate !== undefined) match.matchDate = matchDate;
    if (matchTime !== undefined) match.matchTime = matchTime;
    if (status !== undefined) match.status = status;

    const updated = await match.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/matches/:id/result
// Updates scores + winner, then syncs the Leaderboard collection
// @access Private (Organizer only)
const updateMatchResult = async (req, res, next) => {
  try {
    const { player1Score, player2Score, winner } = req.body;

    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const check = await ensureOwnership(match.tournament, req.user._id);
    if (check.error) return res.status(check.status).json({ message: check.error });

    const wasCompletedBefore = match.status === 'Completed';

    match.player1Score = player1Score;
    match.player2Score = player2Score;
    match.winner = winner;
    match.status = 'Completed';
    await match.save();

    // Only adjust leaderboard stats the first time this match is marked complete,
    // to avoid double counting if an organizer edits the result later.
    if (!wasCompletedBefore) {
      const loser = winner === String(match.player1) ? match.player2 : match.player1;

      await Leaderboard.findOneAndUpdate(
        { tournament: match.tournament, player: winner },
        {
          $inc: { matchesPlayed: 1, wins: 1, points: 3 },
        },
        { upsert: true, new: true }
      );

      await Leaderboard.findOneAndUpdate(
        { tournament: match.tournament, player: loser },
        {
          $inc: { matchesPlayed: 1, losses: 1 },
        },
        { upsert: true, new: true }
      );
    }

    res.json(match);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMatch,
  getMatchesForTournament,
  updateMatchSchedule,
  updateMatchResult,
};
