const express = require('express')
const router = express.Router()
const MasterData = require('../models/MasterData')
const { protect, authorize } = require('../middleware/auth')

// ── Public ────────────────────────────────────────────────────────────────────

// GET /api/v1/master          → all active (optional ?type=plan)
router.get('/master', async (req, res) => {
  try {
    const filter = { isActive: true }
    if (req.query.type) filter.type = req.query.type
    const data = await MasterData.find(filter).sort({ type: 1, code: 1 })
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/v1/master/:type/:code  → single item
router.get('/master/:type/:code', async (req, res) => {
  try {
    const item = await MasterData.findOne({
      type: req.params.type,
      code: req.params.code.toUpperCase(),
      isActive: true,
    })
    if (!item) return res.status(404).json({ message: 'Not found' })
    res.json({ success: true, data: item })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Admin ─────────────────────────────────────────────────────────────────────

// GET /api/v1/admin/master    → all (including inactive), optional ?type=
router.get('/admin/master', protect, authorize('admin'), async (req, res) => {
  try {
    const filter = {}
    if (req.query.type) filter.type = req.query.type
    const data = await MasterData.find(filter).sort({ type: 1, code: 1 })
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/v1/admin/master
router.post('/admin/master', protect, authorize('admin'), async (req, res) => {
  try {
    const item = await MasterData.create(req.body)
    res.status(201).json({ success: true, data: item })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'A record with this type and code already exists' })
    res.status(400).json({ message: err.message })
  }
})

// PUT /api/v1/admin/master/:id
router.put('/admin/master/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const item = await MasterData.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!item) return res.status(404).json({ message: 'Not found' })
    res.json({ success: true, data: item })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'A record with this type and code already exists' })
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/v1/admin/master/:id
router.delete('/admin/master/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await MasterData.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
