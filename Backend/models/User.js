const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  duration: Number,
  workoutType: String,
})

const progressSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  weight: Number,
  bodyFat: Number,
  muscleMass: Number,
  notes: String,
})

const userSchema = new mongoose.Schema({
  regNo: { type: String, unique: true, sparse: true },
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, match: [/\S+@\S+\.\S+/, 'Invalid email'] },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  phone: { type: String, trim: true },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'trainer', 'admin'], default: 'user' },
  goal: { type: String, enum: ['Lose Weight', 'Build Muscle', 'Improve Fitness', 'Athletic Training', 'General Health', ''], default: '' },
  membership: {
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan' },
    startDate: Date,
    endDate: Date,
    status: { type: String, enum: ['active', 'expired', 'pending', 'frozen'], default: 'pending' },
    package: { type: String, enum: ['monthly', 'quarterly', 'half-yearly', 'annual'] },
    joiningDate: Date,
    paymentDate: Date,
    nextPaymentDate: Date,
  },
  attendance: [attendanceSchema],
  progress: [progressSchema],
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  personalTrainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  classTrainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  branchTransferHistory: [{
    fromBranch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    toBranch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    fee: Number,
    date: { type: Date, default: Date.now },
    notes: String,
  }],
  socialLinks: {
    instagram: String,
    facebook: String,
    twitter: String,
    linkedin: String,
  },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpire: { type: Date, select: false },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password)
}

module.exports = mongoose.model('User', userSchema)
