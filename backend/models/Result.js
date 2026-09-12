// models/Result.js
// Stores the final standings of a completed tournament.

const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
      unique: true,
    },
    champion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    runnerUp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    thirdPosition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Full ranking snapshot, ordered best to worst
    finalRankings: [
      {
        player: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rank: Number,
        points: Number,
      },
    ],
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);
