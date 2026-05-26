const express = require('express')
const router = express.Router()
const Activity = require('../models/Activity')
const Notification = require('../models/Notification')
const User = require('../models/User')
const { protect, authorize } = require('../middleware/auth')

// GET activities — public/trainer: upcoming only, admin: all
router.get('/', async (req, res) => {
  try {
    const query = { isActive: true }
    if (req.query.admin !== 'true') query.status = 'upcoming'
    const activities = await Activity.find(query)
      .populate('trainers', 'name speciality image')
      .populate('branch', 'name location')
      .populate('registeredUsers', 'name phone email')
      .sort('date')
    res.json({ success: true, activities })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST create (admin) — fans out notifications to all active users & trainers
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const activity = await Activity.create(req.body)
    await activity.populate([
      { path: 'trainers', select: 'name speciality image' },
      { path: 'branch', select: 'name location' },
    ])

    // Notify all active users and trainers
    const recipients = await User.find(
      { isActive: true, role: { $in: ['user', 'trainer'] } },
      '_id'
    )
    if (recipients.length) {
      const actDate = new Date(activity.date).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
      await Notification.insertMany(
        recipients.map((u) => ({
          recipient: u._id,
          type: 'activity',
          title: `New Activity: ${activity.title}`,
          message: `Scheduled on ${actDate}${activity.time ? ' at ' + activity.time : ''}${activity.branch ? '' : ''}`,
          activityId: activity._id,
        }))
      )
    }

    res.status(201).json({ success: true, activity })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT update (admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('trainers', 'name speciality image')
      .populate('branch', 'name location')
      .populate('registeredUsers', 'name phone email')
    if (!activity) return res.status(404).json({ message: 'Activity not found' })
    res.json({ success: true, activity })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Activity deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST register (any authenticated user/trainer) — blocked after registrationDeadline
router.post('/:id/register', protect, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
    if (!activity) return res.status(404).json({ message: 'Activity not found' })
    if (activity.status !== 'upcoming') return res.status(400).json({ message: 'Registration is closed for this activity' })
    if (activity.registrationDeadline && new Date() > new Date(activity.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed' })
    }
    if (activity.maxParticipants && activity.registeredUsers.length >= activity.maxParticipants) {
      return res.status(400).json({ message: 'Activity is full' })
    }
    const userId = req.user._id.toString()
    const alreadyIn = activity.registeredUsers.some((id) => id.toString() === userId)
    if (alreadyIn) return res.status(400).json({ message: 'Already registered' })
    activity.registeredUsers.push(req.user._id)
    await activity.save()
    await activity.populate('registeredUsers', 'name phone email')
    res.json({ success: true, registeredUsers: activity.registeredUsers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST unregister (any authenticated user/trainer)
router.post('/:id/unregister', protect, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
    if (!activity) return res.status(404).json({ message: 'Activity not found' })
    const userId = req.user._id.toString()
    activity.registeredUsers = activity.registeredUsers.filter((id) => id.toString() !== userId)
    await activity.save()
    await activity.populate('registeredUsers', 'name phone email')
    res.json({ success: true, registeredUsers: activity.registeredUsers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST admin add user (bypasses deadline)
router.post('/:id/add-user', protect, authorize('admin'), async (req, res) => {
  try {
    const { userId } = req.body
    if (!userId) return res.status(400).json({ message: 'userId is required' })
    const activity = await Activity.findById(req.params.id)
    if (!activity) return res.status(404).json({ message: 'Activity not found' })
    const alreadyIn = activity.registeredUsers.some((id) => id.toString() === userId)
    if (alreadyIn) return res.status(400).json({ message: 'User already registered' })
    activity.registeredUsers.push(userId)
    await activity.save()
    await activity.populate('registeredUsers', 'name phone email avatar')
    res.json({ success: true, registeredUsers: activity.registeredUsers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST admin remove user
router.post('/:id/remove-user', protect, authorize('admin'), async (req, res) => {
  try {
    const { userId } = req.body
    const activity = await Activity.findById(req.params.id)
    if (!activity) return res.status(404).json({ message: 'Activity not found' })
    activity.registeredUsers = activity.registeredUsers.filter((id) => id.toString() !== userId)
    await activity.save()
    await activity.populate('registeredUsers', 'name phone email avatar')
    res.json({ success: true, registeredUsers: activity.registeredUsers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
