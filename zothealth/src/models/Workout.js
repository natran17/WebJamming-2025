const mongoose = require('mongoose');
const ExerciseSchema = new mongoose.Schema({ name: { type: String, required: true }, description: String, targetBodyPart: String, machineImageURL: String, howToVideoURL: String, estimatedCaloriesBurned: { type: Number, default: 0 }, sets: Number, reps: Number, timeMinutes: Number }, { _id: false });
const DaySchema = new mongoose.Schema({ day: { type: String, enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], required: true }, exercises: [ExerciseSchema] }, { _id: false });
const WeeklyScheduleSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, title: { type: String, default: 'Weekly Plan' }, weekOf: { type: Date, required: true }, days: [DaySchema] }, { timestamps: true });
module.exports = mongoose.model('Workout', WeeklyScheduleSchema);
