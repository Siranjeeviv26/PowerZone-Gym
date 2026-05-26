const MembershipPlan = require('../models/MembershipPlan')
const User = require('../models/User')
const Payment = require('../models/Payment')

exports.getPlans = async (req, res) => {
  try {
    const plans = await MembershipPlan.find({ isActive: true }).sort('order')
    res.json({ success: true, plans })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.createPlan = async (req, res) => {
  try {
    const plan = await MembershipPlan.create(req.body)
    res.status(201).json({ success: true, plan })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.updatePlan = async (req, res) => {
  try {
    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!plan) return res.status(404).json({ message: 'Plan not found' })
    res.json({ success: true, plan })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.deletePlan = async (req, res) => {
  try {
    await MembershipPlan.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ success: true, message: 'Plan deactivated' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.uploadOffer = async (req, res) => {
  try {
    const updates = {}
    if (req.body.title !== undefined) updates['offer.title'] = req.body.title
    if (req.file) updates['offer.image'] = req.file.path
    if (req.body.startDate !== undefined) updates['offer.startDate'] = req.body.startDate || null
    if (req.body.endDate !== undefined) updates['offer.endDate'] = req.body.endDate || null
    if (req.body.isActive !== undefined) updates['offer.isActive'] = req.body.isActive === 'true' || req.body.isActive === true
    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true })
    if (!plan) return res.status(404).json({ message: 'Plan not found' })
    res.json({ success: true, plan })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.removeOffer = async (req, res) => {
  try {
    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, { $unset: { offer: '' } }, { new: true })
    if (!plan) return res.status(404).json({ message: 'Plan not found' })
    res.json({ success: true, plan })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.purchasePlan = async (req, res) => {
  try {
    const { planId, billingCycle, paymentMethod } = req.body
    const plan = await MembershipPlan.findById(planId)
    if (!plan) return res.status(404).json({ message: 'Plan not found' })

    const amount = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
    const months = billingCycle === 'yearly' ? 12 : 1
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + months)

    const payment = await Payment.create({
      user: req.user.id,
      plan: planId,
      amount,
      paymentMethod,
      billingCycle,
      status: 'success',
      startDate,
      endDate,
    })

    await User.findByIdAndUpdate(req.user.id, {
      'membership.plan': planId,
      'membership.startDate': startDate,
      'membership.endDate': endDate,
      'membership.status': 'active',
    })

    res.status(201).json({ success: true, payment })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
