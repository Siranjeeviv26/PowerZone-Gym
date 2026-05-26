const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['activity', 'general'], default: 'general' },
  title: { type: String, required: true },
  message: { type: String },
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Notification', notificationSchema)
