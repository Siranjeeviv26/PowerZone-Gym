const express = require('express')
const router = express.Router()
const FooterSettings = require('../models/FooterSettings')
const PaymentSettings = require('../models/PaymentSettings')
const upload = require('../middleware/upload')
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

router.get('/payment', async (req, res) => {
  try {
    let settings = await PaymentSettings.findOne()
    if (!settings) settings = await PaymentSettings.create({})
    res.json({ success: true, settings })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/payment', protect, authorize('admin'), upload.single('qrCodeImage'), async (req, res) => {
  try {
    const updates = { ...req.body }
    if (req.file) updates.qrCodeImage = req.file.path
    if (updates.cashEnabled !== undefined) updates.cashEnabled = updates.cashEnabled === 'true' || updates.cashEnabled === true
    if (updates.qrEnabled !== undefined) updates.qrEnabled = updates.qrEnabled === 'true' || updates.qrEnabled === true
    const settings = await PaymentSettings.findOneAndUpdate(
      {},
      { $set: updates },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    res.json({ success: true, settings })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
