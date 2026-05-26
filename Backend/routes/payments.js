const express = require('express')
const router = express.Router()
const Payment = require('../models/Payment')
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

module.exports = router
