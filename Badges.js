const express = require('express');
const router = express.Router();
const Badge = require('../models/Badge');
const User = require('../models/User');

// GET all badges with user details
router.get('/', async (req, res) => {
  try {
    const badges = await Badge.find().populate('user', '-_id name familyName fonction etablissement');
    res.status(200).json(badges);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST route to add a new badge for a user with their CIN
router.post('/add', async (req, res) => {
  const { CIN, validity, zone, type, userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newBadge = await Badge.create({
      user: userId,
      CIN,
      validity,
      qrCode: Math.random().toString(36).substring(7),
      zone,
      type,
    });

    res.status(201).json(newBadge);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE route to delete a badge
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const badge = await Badge.findById(id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    await badge.remove();
    res.status(200).json({ message: 'Badge deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
