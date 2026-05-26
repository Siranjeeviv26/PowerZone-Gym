const mongoose = require('mongoose')

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['Gym Floor', 'Classes', 'Trainers', 'Members', 'Events'], required: true },
  imageUrl: { type: String, required: true },
  cloudinaryId: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  showOnSite: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Gallery', gallerySchema)
