const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const Branch = require('../models/Branch')
const { protect, authorize } = require('../middleware/auth')
const { handleValidation } = require('../middleware/validate')

const branchRules = [
  body('name').trim().notEmpty().withMessage('Branch name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('phone').optional({ checkFalsy: true }).matches(/^[+\d][\d\s\-().]{6,17}$/).withMessage('Enter a valid phone number'),
  body('transferFee').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Transfer fee cannot be negative'),
]

router.get('/', async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true }).sort('name')
    res.json({ success: true, branches })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', protect, authorize('admin'), branchRules, handleValidation, async (req, res) => {
  try {
    const branch = await Branch.create(req.body)
    res.status(201).json({ success: true, branch })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id', protect, authorize('admin'), branchRules, handleValidation, async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!branch) return res.status(404).json({ message: 'Branch not found' })
    res.json({ success: true, branch })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Branch.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ success: true, message: 'Branch removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
