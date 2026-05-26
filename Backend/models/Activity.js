const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  activityType: { type: String, default: 'General', trim: true },
  date: { type: Date, required: true },
  time: { type: String, trim: true },
  registrationDeadline: { type: Date },
  maxParticipants: { type: Number },
  trainers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' }],
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  image: { type: String },
  status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Activity', activitySchema)
