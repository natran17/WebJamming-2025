const mongoose = require('mongoose');
const RecipeSchema = new mongoose.Schema({ title: { type: String, required: true }, description: String, estimatedCalories: { type: Number, default: 0 }, imageUrl: String, url: String }, { _id: false });
const MealEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true },
  items: [{ name: { type: String, required: true }, calories: { type: Number, required: true }, quantity: { type: Number, default: 1 } }],
  recipes: [RecipeSchema]
}, { timestamps: true });
module.exports = mongoose.model('Meal', MealEntrySchema);
