// models/Leaderboard.js
// Stores per-player stats for a specific tournament.
// Updated automatically whenever a match result is entered.

const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
    },
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    matchesPlayed: {
      type: Number,
      default: 0,
    },
    wins: {
      type: Number,
      default: 0,
    },
    losses: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

leaderboardSchema.index({ tournament: 1, player: 1 }, { unique: true });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
