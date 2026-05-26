const mongoose = require('mongoose')

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: Number,
  reps: String,
})

const daySchema = new mongoose.Schema({
  dayNumber: Number,
  dayName: { type: String, required: true },
  coachGuided: { type: Boolean, default: false },
  exercises: [exerciseSchema],
})

const workoutProgramSchema = new mongoose.Schema({
  title: { type: String, required: true },
  planType: { type: String, enum: ['site', 'member'], default: 'site' },
  category: { type: String, enum: ['Strength', 'Cardio', 'HIIT', 'Flexibility', 'Combat', 'Dance'] },
  description: { type: String },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels', 'Level 1', 'Level 2', 'Level 3'] },
  levelNumber: Number,
  duration: Number,
  caloriesBurn: Number,
  maxParticipants: Number,
  completionWeeks: Number,
  promotionNote: String,
  targetPackages: [{ type: String, enum: ['monthly', 'quarterly', 'half-yearly', 'annual'] }],
  days: [daySchema],
  schedule: [{ day: String, time: String }],
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  image: String,
  isActive: { type: Boolean, default: true },
  showOnSite: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('WorkoutProgram', workoutProgramSchema)
