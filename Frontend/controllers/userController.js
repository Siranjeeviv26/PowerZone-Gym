const User = require('../models/User')
const DietPlan = require('../models/DietPlan')
const WorkoutProgram = require('../models/WorkoutProgram')
const mongoose = require('mongoose')
const { sendWelcomeEmail } = require('../utils/mailer')

// Valid membership status values
const VALID_MEMBERSHIP_STATUS = ['active', 'expired', 'pending', 'frozen']
// Valid membership package values
const VALID_PACKAGES = ['monthly', 'quarterly', 'half-yearly', 'annual']

// Validate membership object
const validateMembership = (membership) => {
  if (!membership) return null
  const errors = []

  if (membership.status && !VALID_MEMBERSHIP_STATUS.includes(membership.status)) {
    errors.push(`Invalid membership status: ${membership.status}`)
  }
  if (membership.package && !VALID_PACKAGES.includes(membership.package)) {
    errors.push(`Invalid membership package: ${membership.package}`)
  }
  if (membership.plan && !mongoose.Types.ObjectId.isValid(membership.plan)) {
    errors.push('Invalid membership plan ID')
  }
  if (membership.startDate && isNaN(new Date(membership.startDate).getTime())) {
    errors.push('Invalid start date')
  }
  if (membership.endDate && isNaN(new Date(membership.endDate).getTime())) {
    errors.push('Invalid end date')
  }

  return errors.length > 0 ? errors : null
}

// Validate social links
const validateSocialLinks = (socialLinks) => {
  if (!socialLinks) return null
  const errors = []
  const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-._~:/?#[\]@!$&'()*+,;=]*)?$/i

  for (const [key, value] of Object.entries(socialLinks)) {
    if (value && typeof value !== 'string') {
      errors.push(`Invalid ${key} link`)
    } else if (value && value.length > 500) {
      errors.push(`${key} link is too long`)
    } else if (value && !urlPattern.test(value)) {
      errors.push(`Invalid ${key} URL format`)
    }
  }

  return errors.length > 0 ? errors : null
}

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('membership.plan')
    .populate('branch')
    .populate('personalTrainer', 'name speciality image email phone trainerId')
    .populate('classTrainer', 'name speciality image email phone trainerId')
  res.json({ success: true, user })
}

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, goal, socialLinks } = req.body

    // Validate social links
    if (socialLinks) {
      const socialErrors = validateSocialLinks(socialLinks)
      if (socialErrors) {
        return res.status(400).json({ message: 'Invalid social links', errors: socialErrors })
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, { name, phone, goal, socialLinks }, { new: true, runValidators: true })
      .populate('membership.plan').populate('branch')
      .populate('personalTrainer', 'name speciality image trainerId')
      .populate('classTrainer', 'name speciality image trainerId')
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' })
    const user = await User.findByIdAndUpdate(req.user.id, { avatar: req.file.path }, { new: true })
      .populate('membership.plan').populate('branch')
      .populate('personalTrainer', 'name speciality image trainerId')
      .populate('classTrainer', 'name speciality image trainerId')
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.checkIn = async (req, res) => {
  try {
    const { duration, workoutType, notes } = req.body

    // Require both workoutType (Workout Session) and duration (Duration in minutes)
    if (!workoutType || !workoutType.trim()) {
      return res.status(400).json({ message: 'Workout Session is required' })
    }
    if (!duration || isNaN(duration) || duration <= 0) {
      return res.status(400).json({ message: 'Duration (minutes) is required and must be a positive number' })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Use atomic operation to prevent race conditions
    const result = await User.findOneAndUpdate(
      {
        _id: req.user.id,
        'attendance.date': { $not: { $gte: today, $lt: tomorrow } }
      },
      {
        $push: {
          attendance: {
            date: new Date(),
            duration: duration ? Number(duration) : undefined,
            workoutType,
            notes
          }
        }
      },
      { new: true }
    )

    if (!result) {
      // Check if user exists
      const user = await User.findById(req.user.id)
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
      // Already checked in today
      return res.status(400).json({ message: 'Already checked in today' })
    }

    res.json({ success: true, attendance: result.attendance })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getAttendance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('attendance')
    res.json({ success: true, attendance: user.attendance })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.logWeight = async (req, res) => {
  try {
    const { weight, bodyFat, muscleMass, notes } = req.body

    // Validate weight is provided and is a number
    if (!weight || isNaN(weight) || weight <= 0) {
      return res.status(400).json({ message: 'Weight must be a positive number' })
    }

    // Validate optional fields if provided
    if (bodyFat !== undefined && bodyFat !== null && bodyFat !== '') {
      if (isNaN(bodyFat) || bodyFat < 0 || bodyFat > 100) {
        return res.status(400).json({ message: 'Body fat must be between 0 and 100' })
      }
    }
    if (muscleMass !== undefined && muscleMass !== null && muscleMass !== '') {
      if (isNaN(muscleMass) || muscleMass <= 0) {
        return res.status(400).json({ message: 'Muscle mass must be a positive number' })
      }
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.progress.push({
      date: new Date(),
      weight: Number(weight),
      bodyFat: bodyFat ? Number(bodyFat) : undefined,
      muscleMass: muscleMass ? Number(muscleMass) : undefined,
      notes
    })
    await user.save()
    res.json({ success: true, progress: user.progress })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('progress')
    res.json({ success: true, progress: user.progress.sort((a, b) => new Date(b.date) - new Date(a.date)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.deleteProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    user.progress = user.progress.filter((p) => p._id.toString() !== req.params.id)
    await user.save()
    res.json({ success: true, progress: user.progress.sort((a, b) => new Date(b.date) - new Date(a.date)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.updateProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const entry = user.progress.id(req.params.id)
    if (!entry) return res.status(404).json({ message: 'Progress entry not found' })
    if (req.body.notes !== undefined) entry.notes = req.body.notes
    await user.save()
    res.json({ success: true, progress: user.progress.sort((a, b) => new Date(b.date) - new Date(a.date)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getMyDietPlan = async (req, res) => {
  try {
    const plan = await DietPlan.findOne({ assignedTo: req.user.id, isActive: true })
      .populate('assignedBy', 'name speciality')
    res.json({ success: true, plan })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getMyWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutProgram.findOne({ assignedTo: req.user.id, isActive: true })
      .populate('trainer', 'name speciality image')
      .populate('assignedBy', 'name speciality')
    res.json({ success: true, plan })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, phone } = req.query
    const query = { role: 'user' }
    if (search) {
      // Escape special regex characters to prevent ReDoS
      const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const safeSearch = escapeRegex(search)
      const phoneQuery = safeSearch.replace(/[\s\-().+]/g, '')
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
        { phone: { $regex: safeSearch, $options: 'i' } },
        ...(phoneQuery.length >= 4 ? [{ phone: { $regex: phoneQuery, $options: 'i' } }] : []),
      ]
    }
    if (phone) {
      const safePhone = phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      query.phone = { $regex: safePhone, $options: 'i' }
    }
    if (status) query['membership.status'] = status
    const users = await User.find(query)
      .limit(Number(limit)).skip((page - 1) * Number(limit))
      .populate('membership.plan')
      .populate('branch', 'name')
      .populate('personalTrainer', 'name speciality')
      .populate('classTrainer', 'name speciality')
      .populate('referredBy', 'name phone email')
      .sort('-createdAt')
    const total = await User.countDocuments(query)
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, goal, membership, referredBy, branch } = req.body

    // Validate membership if provided
    if (membership) {
      const membershipErrors = validateMembership(membership)
      if (membershipErrors) {
        return res.status(400).json({ message: 'Invalid membership data', errors: membershipErrors })
      }
    }

    // Validate branch if provided
    if (branch && !mongoose.Types.ObjectId.isValid(branch)) {
      return res.status(400).json({ message: 'Invalid branch ID' })
    }

    // Validate referredBy if provided
    if (referredBy && !mongoose.Types.ObjectId.isValid(referredBy)) {
      return res.status(400).json({ message: 'Invalid referrer ID' })
    }

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already registered' })

    // Use atomic counter for regNo
    const counter = await mongoose.connection.db.collection('counters').findOneAndUpdate(
      { _id: 'userRegNo' },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    )
    const regNo = `GYM${String(counter.seq).padStart(4, '0')}`

    const user = await User.create({
      regNo, name, email, password: password || 'changeme123', phone, goal,
      role: 'user',
      membership: membership || {},
      referredBy: referredBy || undefined,
      branch: branch || undefined,
    })

    // Send welcome email with credentials (non-blocking) - only for admin-created users
    if (process.env.RESEND_API_KEY) {
      const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`
      sendWelcomeEmail({
        to: user.email,
        name: user.name,
        email: user.email,
        password: req.body.password || 'changeme123', // plain password only available here
        regNo: user.regNo,
        loginUrl,
      }).catch((e) => console.error('Welcome email failed:', e.message))
    }

    user.password = undefined
    res.status(201).json({ success: true, user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const { name, phone, goal, role, isActive, membership, branch, personalTrainer, referredBy } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, goal, role, isActive, membership, branch, personalTrainer, referredBy: referredBy || undefined },
      { new: true, runValidators: true }
    ).populate('membership.plan').populate('branch', 'name').populate('personalTrainer', 'name speciality').populate('referredBy', 'name phone email')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.addAttendance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    user.attendance.push(req.body)
    await user.save()
    res.json({ success: true, attendance: user.attendance })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.addProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    user.progress.push(req.body)
    await user.save()
    res.json({ success: true, progress: user.progress })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
