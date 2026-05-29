const mongoose = require('mongoose')

const footerSettingsSchema = new mongoose.Schema({
  address: { type: String, default: '123 Fitness Avenue, Sports Complex, New Delhi 110001' },
  phone: { type: String, default: '+91 12345 67890' },
  email: { type: String, default: 'info@powerzone.com' },
  weekdayHours: { type: String, default: 'Mon – Fri: 5:00 AM – 11:00 PM' },
  weekendHours: { type: String, default: 'Sat – Sun: 6:00 AM – 10:00 PM' },
  facebook: { type: String, default: '' },
  instagram: { type: String, default: '' },
  twitter: { type: String, default: '' },
  youtube: { type: String, default: '' },
  showFacebook: { type: Boolean, default: true },
  showInstagram: { type: Boolean, default: true },
  showTwitter: { type: Boolean, default: true },
  showYoutube: { type: Boolean, default: true },
  transferFeeLabel: { type: String, default: 'Branch Transfer Fee' },
}, { timestamps: true })

module.exports = mongoose.model('FooterSettings', footerSettingsSchema)
