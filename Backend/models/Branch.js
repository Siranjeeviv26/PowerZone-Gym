const mongoose = require('mongoose')

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  location: { type: String, required: true },
  address: String,
  phone: String,
  manager: String,
  transferFee: { type: Number, default: 500 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Branch', branchSchema)
