const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const RefreshTokenSchema = new mongoose.Schema({ token: { type: String, required: true }, userAgent: String, createdAt: { type: Date, default: Date.now }, expiresAt: { type: Date, required: true } }, { _id: false });
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  dateOfBirth: { type: Date },
  heightCm: { type: Number },
  weightKg: { type: Number },
  goals: { type: String, enum: ['cut','gain','maintain'], default: 'maintain' },
  preferredExerciseTypes: [{ type: String }],
  dailyCalorieLimit: { type: Number, default: 2000 },
  timezone: { type: String, default: 'America/Los_Angeles' },
  refreshTokens: [RefreshTokenSchema]
}, { timestamps: true });
UserSchema.methods.comparePassword = async function(pw){ return bcrypt.compare(pw, this.passwordHash); };
UserSchema.statics.hashPassword = async function(pw){ const salt = await bcrypt.genSalt(10); return bcrypt.hash(pw, salt); };
module.exports = mongoose.model('User', UserSchema);
