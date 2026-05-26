const express = require('express')
const router = express.Router()
const Notification = require('../models/Notification')
const { protect } = require('../middleware/auth')

router.use(protect)

// GET my notifications (newest 50)
router.get('/', async (req, res) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.user._id }).sort('-createdAt').limit(50),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ])
    res.json({ success: true, notifications, unreadCount })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT mark all as read
router.put('/mark-all-read', async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT mark single as read
router.put('/:id/read', async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE single notification
router.delete('/:id', async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
