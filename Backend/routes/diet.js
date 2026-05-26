const express = require('express')
const router = express.Router()
const DietPlan = require('../models/DietPlan')
const { protect, authorize } = require('../middleware/auth')

router.get('/', async (req, res) => {
  try {
    const { goal, admin } = req.query
    const query = admin === 'true' ? { isActive: true } : { isActive: true, showOnSite: true }
    if (goal && goal !== 'All') query.goal = goal
    const plans = await DietPlan.find(query).sort('-createdAt')
    res.json({ success: true, plans })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', protect, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const plan = await DietPlan.create({ ...req.body, createdBy: req.user.id })
    res.status(201).json({ success: true, plan })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id', protect, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const plan = await DietPlan.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ success: true, plan })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await DietPlan.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ success: true, message: 'Plan removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
