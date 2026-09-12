// models/Tournament.js
// Represents a single gaming tournament created by an organizer.

const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tournament name is required'],
      trim: true,
    },
    gameName: {
      type: String,
      required: [true, 'Game name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    date: {
      type: Date,
      required: [true, 'Tournament date is required'],
    },
    time: {
      type: String,
      required: [true, 'Tournament time is required'],
    },
    venueType: {
      type: String,
      enum: ['Online', 'Offline'],
      default: 'Online',
    },
    venueDetails: {
      type: String,
      default: '',
    },
    maxPlayers: {
      type: Number,
      required: [true, 'Maximum players is required'],
      min: 2,
    },
    entryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    prizePool: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed'],
      default: 'Upcoming',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Simple text index to support the "search tournament" feature
tournamentSchema.index({ name: 'text', gameName: 'text' });

module.exports = mongoose.model('Tournament', tournamentSchema);
