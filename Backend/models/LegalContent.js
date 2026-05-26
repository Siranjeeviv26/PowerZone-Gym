const mongoose = require('mongoose')

const sectionSchema = new mongoose.Schema({
  heading: { type: String, default: '' },
  body:    { type: String, default: '' },
}, { _id: false })

const legalContentSchema = new mongoose.Schema({
  type:        { type: String, enum: ['terms', 'privacy'], required: true, unique: true },
  lastUpdated: { type: Date, default: Date.now },
  sections:    { type: [sectionSchema], default: [] },
})

module.exports = mongoose.model('LegalContent', legalContentSchema)
