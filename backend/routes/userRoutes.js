// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { updateProfile, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.put('/profile', protect, updateProfile);
router.get('/:id', protect, getUserById);

module.exports = router;
