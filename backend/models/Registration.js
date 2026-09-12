// models/Registration.js
// Links a Player to a Tournament they want to join.
// Organizer approves or rejects each registration.

const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// A player can only register once for the same tournament
registrationSchema.index({ tournament: 1, player: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
