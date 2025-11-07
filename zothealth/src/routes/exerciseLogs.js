const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const ExerciseLog = require('../models/ExerciseLog');
const router = express.Router();

// Create a log entry when a user completes an exercise
router.post(
  '/',
  auth,
  [
    body('name').isString().trim().notEmpty(),
    body('day').optional().isIn(['monday','tuesday','wednesday','thursday','friday','saturday','sunday']),
    body('sets').optional().isInt({ min: 0 }),
    body('reps').optional().isInt({ min: 0 }),
    body('timeMinutes').optional().isInt({ min: 0 }),
    body('estimatedCaloriesBurned').optional().isInt({ min: 0 })
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation error', details: errors.array() });
      const doc = await ExerciseLog.create({ ...req.body, user: req.user.id });
      res.status(201).json(doc);
    } catch (err) { next(err); }
  }
);

// Get recent logs for the current user (most recent first)
router.get('/', auth, async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    const items = await ExerciseLog.find({ user: req.user.id }).sort({ completedAt: -1, createdAt: -1 }).limit(parseInt(limit,10));
    res.json(items);
  } catch (err) { next(err); }
});

module.exports = router;
