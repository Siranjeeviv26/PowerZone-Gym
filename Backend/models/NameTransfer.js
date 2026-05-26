const mongoose = require('mongoose')

const nameTransferSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  membershipPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan' },
  fee: { type: Number, default: 0 },
  transferMembership: { type: Boolean, default: false },
  notes: String,
  date: { type: Date, default: Date.now },
}, { timestamps: true })

module.exports = mongoose.model('NameTransfer', nameTransferSchema)
