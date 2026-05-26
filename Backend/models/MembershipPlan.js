const mongoose = require('mongoose')

const membershipPlanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  duration: { type: String, enum: ['monthly', 'quarterly', 'half-yearly', 'annual'], default: 'monthly' },
  monthlyPrice: { type: Number, required: true },
  quarterlyPrice: Number,
  halfYearlyPrice: Number,
  yearlyPrice: Number,
  features: [String],
  color: { type: String, default: '#e63946' },
  maxMembers: Number,
  currentMembers: { type: Number, default: 0 },
  isPopular: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  offer: {
    title: String,
    image: String,
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: true },
  },
}, { timestamps: true })

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema)
