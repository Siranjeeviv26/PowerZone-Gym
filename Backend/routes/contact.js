const express = require('express')
const router = express.Router()
const Contact = require('../models/Contact')
const { protect, authorize } = require('../middleware/auth')

router.post('/', async (req, res) => {
  try {
    const contact = await Contact.create(req.body)
    res.status(201).json({ success: true, message: 'Message received! We\'ll respond within 24 hours.', contact })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const contacts = await Contact.find().sort('-createdAt')
    res.json({ success: true, contacts })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id/reply', protect, authorize('admin'), async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: 'replied', adminReply: req.body.reply, repliedAt: new Date() },
      { new: true }
    )
    res.json({ success: true, contact })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
