const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['card', 'upi', 'netbanking', 'cash', 'wallet'] },
  transactionId: String,
  billingCycle: { type: String, enum: ['monthly', 'yearly'] },
  startDate: Date,
  endDate: Date,
  invoiceNumber: String,
}, { timestamps: true })

paymentSchema.pre('save', function (next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = `PZ-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }
  next()
})

module.exports = mongoose.model('Payment', paymentSchema)
