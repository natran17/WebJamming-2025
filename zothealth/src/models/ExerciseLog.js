const mongoose = require('mongoose');

const ExerciseLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  day: { type: String, enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
  completedAt: { type: Date, default: Date.now, index: true },
  sets: Number,
  reps: Number,
  timeMinutes: Number,
  estimatedCaloriesBurned: Number,
}, { timestamps: true });

module.exports = mongoose.model('ExerciseLog', ExerciseLogSchema);
