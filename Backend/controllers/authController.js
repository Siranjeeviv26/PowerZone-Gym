const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Trainer = require('../models/Trainer')
const { sendResetEmail } = require('../utils/mailer')
const mongoose = require('mongoose')

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' })

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  user.password = undefined
  res.status(statusCode).json({ success: true, token, user })
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, goal } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already registered' })

    // Retry loop for regNo duplicate race (handles concurrent registers + counter edge cases)
    let user = null
    let lastErr = null
    for (let attempt = 0; attempt < 3; attempt++) {
      const counter = await mongoose.connection.db.collection('counters').findOneAndUpdate(
        { _id: 'userRegNo' },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: 'after' }
      )
      const year = new Date().getFullYear()
      const seq = counter?.seq ?? counter?.value?.seq ?? 1
      const regNo = `PZ-${year}-${String(seq).padStart(4, '0')}`
      try {
        user = await User.create({ name, email, password, phone, goal, regNo })
        break
      } catch (e) {
        if (e.code === 11000 && e.keyPattern?.regNo) {
          lastErr = e
          continue // retry with next seq
        }
        throw e
      }
    }
    if (!user) throw lastErr || new Error('Failed to create user')
    
    sendToken(user, 201, res)
  } catch (err) {
    // Duplicate email handled above, but keep fallback
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(400).json({ message: 'Email already registered' })
    }
    res.status(500).json({ message: err.message })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    if (!user.isActive) return res.status(401).json({ message: 'Account is deactivated' })
    // For trainers: if no user avatar, pull image from Trainer profile so Navbar shows their photo
    if (user.role === 'trainer' && !user.avatar) {
      const trainer = await Trainer.findOne({ user: user._id }).select('image')
      if (trainer?.image) {
        user.avatar = trainer.image
      }
    }
    sendToken(user, 200, res)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate('membership.plan')
  res.json({ success: true, user })
}

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(404).json({ message: 'No account found with that email address' })

    const rawToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex')
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000 // 1 hour
    await user.save({ validateBeforeSave: false })

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`

    if (process.env.RESEND_API_KEY) {
      await sendResetEmail({ to: user.email, name: user.name, resetUrl })
      res.json({ success: true, message: 'Password reset link sent to your email' })
    } else {
      // Dev fallback — no email configured, only show in development
      if (process.env.NODE_ENV === 'development') {
        res.json({ success: true, message: 'Reset link generated (email not configured)', resetUrl })
      } else {
        res.json({ success: true, message: 'Password reset link sent to your email' })
      }
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpire')

    if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired' })

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    sendToken(user, 200, res)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user.id).select('+password')
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }
    user.password = newPassword
    await user.save()
    sendToken(user, 200, res)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
