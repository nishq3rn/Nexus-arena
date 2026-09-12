// controllers/tournamentController.js
// Full CRUD for tournaments + search/filter/pagination

const Tournament = require('../models/Tournament');
const Registration = require('../models/Registration');

// @route  POST /api/tournaments
// @access Private (Organizer only)
const createTournament = async (req, res, next) => {
  try {
    const {
      name,
      gameName,
      description,
      date,
      time,
      venueType,
      venueDetails,
      maxPlayers,
      entryFee,
      prizePool,
    } = req.body;

    const tournament = await Tournament.create({
      name,
      gameName,
      description,
      date,
      time,
      venueType,
      venueDetails,
      maxPlayers,
      entryFee,
      prizePool,
      organizer: req.user._id,
    });

    res.status(201).json(tournament);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/tournaments
// Supports: ?search=, ?game=, ?status=, ?page=, ?limit=
// @access Public
const getTournaments = async (req, res, next) => {
  try {
    const { search, game, status, page = 1, limit = 6 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { gameName: { $regex: search, $options: 'i' } },
      ];
    }

    if (game) {
      query.gameName = { $regex: game, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.max(parseInt(limit), 1);

    const total = await Tournament.countDocuments(query);

    const tournaments = await Tournament.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      tournaments,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      totalResults: total,
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/tournaments/:id
// @access Public
const getTournamentById = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate(
      'organizer',
      'name email'
    );

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Count how many players are currently approved, for "slots left" info
    const approvedCount = await Registration.countDocuments({
      tournament: tournament._id,
      status: 'Approved',
    });

    res.json({ ...tournament.toObject(), approvedCount });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/tournaments/:id
// @access Private (Organizer who owns it)
const updateTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this tournament' });
    }

    const fields = [
      'name',
      'gameName',
      'description',
      'date',
      'time',
      'venueType',
      'venueDetails',
      'maxPlayers',
      'entryFee',
      'prizePool',
      'status',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) tournament[field] = req.body[field];
    });

    const updated = await tournament.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/tournaments/:id
// @access Private (Organizer who owns it)
const deleteTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this tournament' });
    }

    await tournament.deleteOne();
    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/tournaments/organizer/mine
// @access Private (Organizer only)
const getMyTournaments = async (req, res, next) => {
  try {
    const tournaments = await Tournament.find({ organizer: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(tournaments);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTournament,
  getTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
  getMyTournaments,
};
