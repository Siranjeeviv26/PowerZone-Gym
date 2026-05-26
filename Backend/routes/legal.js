const express = require('express')
const router = express.Router()
const LegalContent = require('../models/LegalContent')
const { protect, authorize } = require('../middleware/auth')

// GET /api/legal/:type  — public
router.get('/:type', async (req, res) => {
  const { type } = req.params
  if (!['terms', 'privacy'].includes(type)) {
    return res.status(400).json({ message: 'Invalid type. Must be "terms" or "privacy".' })
  }
  try {
    const doc = await LegalContent.findOne({ type })
    if (!doc) {
      return res.json({
        success: true,
        legal: { type, sections: [], lastUpdated: null },
      })
    }
    res.json({ success: true, legal: doc })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/legal/:type  — admin only
router.put('/:type', protect, authorize('admin'), async (req, res) => {
  const { type } = req.params
  if (!['terms', 'privacy'].includes(type)) {
    return res.status(400).json({ message: 'Invalid type. Must be "terms" or "privacy".' })
  }
  const { sections } = req.body
  if (!Array.isArray(sections)) {
    return res.status(400).json({ message: '"sections" must be an array.' })
  }
  try {
    const doc = await LegalContent.findOneAndUpdate(
      { type },
      { sections, lastUpdated: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    res.json({ success: true, legal: doc })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
