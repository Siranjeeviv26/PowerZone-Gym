const express = require('express')
const router = express.Router()
const FooterSettings = require('../models/FooterSettings')
const { protect, authorize } = require('../middleware/auth')

router.get('/footer', async (req, res) => {
  try {
    let settings = await FooterSettings.findOne()
    if (!settings) settings = await FooterSettings.create({})
    res.json({ success: true, settings })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/footer', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await FooterSettings.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    res.json({ success: true, settings })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
