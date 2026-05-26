const mongoose = require('mongoose')

const settingsSchema = new mongoose.Schema({
  nameTransferFee: { type: Number, default: 500 },
  transferFees: [{
    name: { type: String, required: true, trim: true },
    value: { type: Number, default: 0 },
  }],
}, { timestamps: true })

settingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne()
  if (!doc) doc = await this.create({})
  return doc
}

module.exports = mongoose.model('Settings', settingsSchema)
