const mongoose = require('mongoose')

const masterDataSchema = new mongoose.Schema({
  type: { type: String, required: true, trim: true, index: true },
  code: { type: String, required: true, trim: true, uppercase: true },
  label: { type: Object, default: {} },
  description: { type: String, trim: true, default: '' },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true })

masterDataSchema.index({ type: 1, code: 1 }, { unique: true })

module.exports = mongoose.model('MasterData', masterDataSchema)
