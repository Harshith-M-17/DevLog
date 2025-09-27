const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Entry = require('../models/Entry');
const User = require('../models/User');

// @route   GET api/analytics/stats
// @desc    Get user stats (total entries, etc.)
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const totalEntries = await Entry.countDocuments({ userId: req.user.id });
    // More stats can be added here
    res.json({ totalEntries });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/analytics/team
// @desc    Get team overview (if applicable)
// @access  Private
router.get('/team', auth, async (req, res) => {
  try {
    // This is a placeholder. In a real app, you'd have a concept of teams.
    const users = await User.find().select('-password').limit(10);
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
