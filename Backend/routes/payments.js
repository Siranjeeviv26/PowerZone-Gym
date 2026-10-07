const express = require('express')
const router = express.Router()
const Payment = require('../models/Payment')
const User = require('../models/User')
const MembershipPlan = require('../models/MembershipPlan')
const { protect, authorize } = require('../middleware/auth')
const { sendPaymentReceipt } = require('../utils/mailer')

router.get('/my', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id }).populate('plan', 'name monthlyPrice').sort('-createdAt')
    res.json({ success: true, payments })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, user, status } = req.query
    const filter = {}
    if (user) filter.user = user
    if (status && status !== 'all') filter.status = status
    const effectiveLimit = user ? Number(limit) || 100 : Number(limit) || 20
    const payments = await Payment.find(filter)
      .populate('user', 'name email')
      .populate('plan', 'name')
      .sort('-createdAt')
      .limit(effectiveLimit)
      .skip((Number(page) - 1) * effectiveLimit)
    const total = await Payment.countDocuments(filter)
    const totalRevenue = await Payment.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
    res.json({ success: true, payments, total, totalRevenue: totalRevenue[0]?.total || 0 })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'pending' })
      .populate('user', 'name email phone')
      .populate('plan', 'name')
      .sort('-createdAt')
    res.json({ success: true, payments })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('plan', 'name')
    if (!payment) return res.status(404).json({ message: 'Payment not found' })
    if (payment.status !== 'pending') return res.status(400).json({ message: 'Payment is not pending' })

    // Validate required fields before approval
    if (!payment.plan) return res.status(400).json({ message: 'Payment has no associated plan' })
    if (!payment.startDate || !payment.endDate) {
      return res.status(400).json({ message: 'Payment has invalid date range' })
    }

    payment.status = 'success'
    await payment.save()

    const pkgMap = { monthly: 'monthly', quarterly: 'quarterly', 'half-yearly': 'half-yearly', yearly: 'annual' }
    const billingCycle = payment.billingCycle || 'monthly'
    await User.findByIdAndUpdate(payment.user, {
      'membership.plan': payment.plan,
      'membership.startDate': payment.startDate,
      'membership.endDate': payment.endDate,
      'membership.status': 'active',
      'membership.package': pkgMap[billingCycle] || 'monthly',
      'membership.nextPaymentDate': payment.endDate,
      'membership.joiningDate': payment.startDate,
      'membership.paymentDate': new Date(),
    })

    // Send payment receipt email (non-blocking)
    if (process.env.RESEND_API_KEY) {
      const user = await User.findById(payment.user).select('name email phone regNo')
      const plan = await MembershipPlan.findById(payment.plan._id || payment.plan).select('name')
      if (user && plan) {
        sendPaymentReceipt({
          to: user.email,
          name: user.name,
          payment,
          plan,
          user,
        }).catch((e) => console.error('Payment receipt email failed:', e.message))
      }
    }

    res.json({ success: true, payment })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
    if (!payment) return res.status(404).json({ message: 'Payment not found' })
    if (payment.status !== 'pending') return res.status(400).json({ message: 'Payment is not pending' })

    payment.status = 'failed'
    await payment.save()

    res.json({ success: true, payment })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
