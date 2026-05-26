const express = require('express')
const router = express.Router()
const WorkoutProgram = require('../models/WorkoutProgram')
const { protect, authorize } = require('../middleware/auth')

router.get('/', async (req, res) => {
  try {
    const { category, level, admin } = req.query
    const query = admin === 'true' ? { isActive: true } : { isActive: true, showOnSite: true }
    if (category && category !== 'All') query.category = category
    if (level) query.level = level
    const workouts = await WorkoutProgram.find(query).populate('trainer', 'name speciality image').sort('-createdAt')
    res.json({ success: true, workouts })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', protect, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const workout = await WorkoutProgram.create({ ...req.body, trainer: req.body.trainerId })
    res.status(201).json({ success: true, workout })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id', protect, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const workout = await WorkoutProgram.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ success: true, workout })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await WorkoutProgram.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ success: true, message: 'Workout removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
