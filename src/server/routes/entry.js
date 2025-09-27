const express = require('express');
const Entry = require('../models/Entry');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a new entry
router.post('/', auth, async (req, res) => {
  try {
    const { workDone, blockers, learnings, githubCommitLink } = req.body;
    const entry = new Entry({
      workDone,
      blockers,
      learnings,
      githubCommitLink,
      userId: req.user.id,
    });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all entries for a user
router.get('/', auth, async (req, res) => {
  try {
    const entries = await Entry.find().populate('userId', 'name').sort({ date: -1 });
    const formattedEntries = entries.map(entry => ({
      id: entry._id,
      date: entry.date,
      workDone: entry.workDone,
      blockers: entry.blockers,
      learnings: entry.learnings,
      githubCommitLink: entry.githubCommitLink,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      userId: entry.userId._id,
      userName: entry.userId.name,
    }));
    res.json(formattedEntries);
  } catch (err) {
    console.error('Error fetching entries:', err.message);
    res.status(500).send('Server Error');
  }
});

// Get a single entry by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    if (entry.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update an entry
router.put('/:id', auth, async (req, res) => {
  try {
    const { workDone, blockers, learnings, githubCommitLink } = req.body;

    let entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ msg: 'Entry not found' });
    }

    // Make sure user owns the entry
    if (entry.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    entry = await Entry.findByIdAndUpdate(
      req.params.id,
      { $set: { workDone, blockers, learnings, githubCommitLink } },
      { new: true }
    );

    res.json(entry);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Entry not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Delete an entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ msg: 'Entry not found' });
    }

    // Make sure user owns the entry
    if (entry.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Entry.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Entry removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Entry not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;

