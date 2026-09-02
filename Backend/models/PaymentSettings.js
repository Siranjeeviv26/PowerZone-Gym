const mongoose = require('mongoose')

const paymentSettingsSchema = new mongoose.Schema({
  cashEnabled: { type: Boolean, default: true },
  qrEnabled: { type: Boolean, default: false },
  qrCodeImage: { type: String, default: '' },
  qrCodeLabel: { type: String, default: 'Scan to Pay' },
  upiId: { type: String, default: '' },
  cashInstructions: { type: String, default: 'Visit the gym front desk and pay the amount in cash. Please quote your reference number when paying.' },
  qrInstructions: { type: String, default: 'Scan the QR code and complete the payment. Enter your transaction ID below after paying.' },
}, { timestamps: true })

module.exports = mongoose.model('PaymentSettings', paymentSettingsSchema)
