// controllers/userController.js
// Handles user profile updates

const User = require('../models/User');

// @route  PUT /api/users/profile
// @access Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.avatar = req.body.avatar || user.avatar;

    if (req.body.password) {
      user.password = req.body.password; // pre-save hook will hash it
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/users/:id
// @access Private
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name email role phone avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = { updateProfile, getUserById };
