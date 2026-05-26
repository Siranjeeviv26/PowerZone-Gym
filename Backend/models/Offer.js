const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  description: { type: String, trim: true },
  startDate: { type: Date },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Offer', offerSchema)
