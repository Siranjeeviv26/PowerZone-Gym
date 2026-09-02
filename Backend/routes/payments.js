const express = require('express')
const router = express.Router()
const Payment = require('../models/Payment')
const User = require('../models/User')
const { protect, authorize } = require('../middleware/auth')

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
    const { page = 1, limit = 20 } = req.query
    const payments = await Payment.find()
      .populate('user', 'name email')
      .populate('plan', 'name')
      .sort('-createdAt')
      .limit(limit)
      .skip((page - 1) * limit)
    const total = await Payment.countDocuments()
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

    await User.findByIdAndUpdate(payment.user, {
      'membership.plan': payment.plan,
      'membership.startDate': payment.startDate,
      'membership.endDate': payment.endDate,
      'membership.status': 'active',
      'membership.joiningDate': payment.startDate,
      'membership.paymentDate': new Date(),
    })

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
