const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profile
// @desc    Update user profile
// @access  Private
router.put('/', auth, async (req, res) => {
  const { name, email } = req.body;

  // Build profile object
  const profileFields = {};
  if (name) profileFields.name = name;
  if (email) profileFields.email = email;

  try {
    let user = await User.findById(req.user.id);

    if (user) {
      // Update
      user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: profileFields },
        { new: true }
      ).select('-password');

      return res.json(user);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
