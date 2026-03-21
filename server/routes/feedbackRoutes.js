const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Menu = require('../models/Menu');
const auth = require('../middleware/auth');

// POST /api/feedback - Submit feedback (public)
router.post('/', async (req, res) => {
  try {
    const { orderId, menuItemId, rating, comment } = req.body;

    const feedback = new Feedback({
      order: orderId,
      menuItem: menuItemId,
      rating,
      comment
    });
    await feedback.save();

    // Update menu item average rating
    const allFeedback = await Feedback.find({ menuItem: menuItemId });
    const avgRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;

    await Menu.findByIdAndUpdate(menuItemId, {
      rating: avgRating.toFixed(1),
      totalRatings: allFeedback.length
    });

    res.status(201).json({ message: 'Feedback submitted', feedback });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/feedback - Get all feedback (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('menuItem', 'name')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;