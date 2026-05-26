const mongoose = require('mongoose')

const mealSchema = new mongoose.Schema({
  time: String,
  name: String,
  quantity: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  instructions: String,
})

const dietPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  goal: { type: String, enum: ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Vegan'], required: true },
  description: String,
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFat: Number,
  duration: String,
  meals: [mealSchema],
  image: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  planType: { type: String, enum: ['site', 'member'], default: 'site' },
  isActive: { type: Boolean, default: true },
  showOnSite: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('DietPlan', dietPlanSchema)
