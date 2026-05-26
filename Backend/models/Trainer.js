const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  date: { type: Date, default: Date.now },
})

const trainerSchema = new mongoose.Schema({
  trainerId: { type: String, unique: true, sparse: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  speciality: { type: String, required: true },
  bio: String,
  experience: Number,
  image: String,
  certifications: [String],
  socialLinks: {
    instagram: String,
    facebook: String,
    twitter: String,
    linkedin: String,
  },
  workingHours: {
    start: String,
    end: String,
    days: [String],
  },
  reviews: [reviewSchema],
  averageRating: { type: Number, default: 0 },
  totalMembers: { type: Number, default: 0 },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  clients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

trainerSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) { this.averageRating = 0; return }
  const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0)
  this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10
}

module.exports = mongoose.model('Trainer', trainerSchema)
