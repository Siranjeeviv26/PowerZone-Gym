import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FaTimes, FaQrcode, FaMoneyBillWave, FaCheckCircle,
  FaClock, FaCopy, FaChevronLeft, FaCreditCard, FaShieldAlt,
} from 'react-icons/fa'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const BILLING_MAP = {
  monthly:       { months: 1,  priceKey: 'monthlyPrice',     label: 'Monthly' },
  quarterly:     { months: 3,  priceKey: 'quarterlyPrice',   label: 'Quarterly' },
  'half-yearly': { months: 6,  priceKey: 'halfYearlyPrice',  label: 'Half-Yearly' },
  yearly:        { months: 12, priceKey: 'yearlyPrice',       label: 'Yearly' },
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function PaymentModal({ plan, billing, onClose }) {
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)
  const [settings, setSettings] = useState(null)
  const [method, setMethod] = useState(null)
  const [txnId, setTxnId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [payingOnline, setPayingOnline] = useState(false)
  const [done, setDone] = useState(null)
  const [refNum] = useState(`PZ-${Date.now().toString(36).toUpperCase()}`)

  const opt = BILLING_MAP[billing] || BILLING_MAP.monthly
  const price = plan[opt.priceKey] || plan.monthlyPrice

  useEffect(() => {
    api.get('/settings/payment')
      .then(({ data }) => setSettings(data.settings))
      .catch(() => setSettings({ cashEnabled: true, razorpayEnabled: true, qrEnabled: false }))
  }, [])

  const copy = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied!')
  }

  const handleCashSubmit = async () => {
    setSubmitting(true)
    try {
      const { data } = await api.post('/plans/purchase', {
        planId: plan._id,
        billingCycle: billing,
        paymentMethod: 'cash',
      })
      setDone({ pending: data.pending })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleQrSubmit = async () => {
    setSubmitting(true)
    try {
      const { data } = await api.post('/plans/purchase', {
        planId: plan._id,
        billingCycle: billing,
        paymentMethod: 'qr',
        transactionId: txnId || undefined,
      })
      setDone({ pending: data.pending })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOnlinePay = async () => {
    if (payingOnline) return
    setPayingOnline(true)
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        toast.error('Razorpay SDK failed to load. Check your connection.')
        setPayingOnline(false)
        return
      }
      const { data } = await api.post('/plans/razorpay/order', {
        planId: plan._id,
        billingCycle: billing,
      })
      if (!data.success) throw new Error(data.message || 'Failed to create order')

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'PowerZone Gym',
        description: `${plan.name} — ${opt.label}`,
        order_id: data.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        notes: {
          planId: plan._id,
          billingCycle: billing,
        },
        theme: { color: '#e63946' },
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/plans/razorpay/verify', {
              planId: plan._id,
              billingCycle: billing,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            if (verifyRes.data.success) {
              toast.success('Payment successful! Membership activated.')
              setDone({ pending: false })
            }
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed. Contact support.')
          } finally {
            setPayingOnline(false)
          }
        },
        modal: {
          ondismiss: () => setPayingOnline(false),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (resp) {
        toast.error(resp.error?.description || 'Payment failed. Try again.')
        setPayingOnline(false)
      })
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not initiate online payment.')
      setPayingOnline(false)
    }
  }

  if (!settings) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const hasCash = settings.cashEnabled !== false
  const hasOnline = settings.razorpayEnabled !== false
  const hasQr = settings.qrEnabled === true && settings.qrCodeImage

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-400">
          <div>
            <h3 className="text-white font-black text-lg" style={{ fontFamily: 'Oswald' }}>
              COMPLETE PAYMENT
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">
              {plan.name} · {opt.label} · ₹{price?.toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <FaTimes />
          </button>
        </div>

        <div className="p-5 max-h-[75vh] overflow-y-auto">
          {/* Success / Pending state */}
          {done ? (
            <div className="text-center py-6">
              {done.pending ? (
                <>
                  <div className="w-16 h-16 bg-yellow-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaClock className="text-yellow-400 text-3xl" />
                  </div>
                  <h4 className="text-white font-black text-xl mb-2" style={{ fontFamily: 'Oswald' }}>
                    REQUEST SUBMITTED
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Your payment request is awaiting admin approval. Your membership will be activated once confirmed.
                  </p>
                  <div className="bg-dark-300 border border-dark-500 rounded-xl p-3 text-xs text-gray-400 mb-5">
                    Reference: <span className="text-white font-mono font-bold">{refNum}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="btn-primary px-8 py-2.5 text-sm"
                  >
                    Done
                  </motion.button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCheckCircle className="text-green-400 text-3xl" />
                  </div>
                  <h4 className="text-white font-black text-xl mb-2" style={{ fontFamily: 'Oswald' }}>
                    PAYMENT SUCCESSFUL
                  </h4>
                  <p className="text-gray-400 text-sm mb-5">
                    Your membership is now active. Welcome to PowerZone!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { onClose(); navigate('/dashboard') }}
                    className="btn-primary px-8 py-2.5 text-sm"
                  >
                    Go to Dashboard
                  </motion.button>
                </>
              )}
            </div>

          ) : !method ? (
            /* Method selection — Two types: Online (Razorpay) + Cash */
            <div className="space-y-3">
              <p className="text-gray-400 text-sm mb-4">Select your payment method:</p>
              {hasOnline && (
                <button
                  onClick={() => setMethod('online')}
                  className="w-full flex items-center gap-4 p-4 bg-dark-200 border border-dark-400 hover:border-primary/50 rounded-xl transition-all text-left group"
                >
                  <div className="w-11 h-11 bg-primary/10 group-hover:bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                    <FaCreditCard className="text-primary text-lg" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm flex items-center gap-2">
                      Online Payment <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded-full">Razorpay</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">UPI, Cards, Net Banking & Wallets — instant activation</p>
                  </div>
                </button>
              )}
              {hasCash && (
                <button
                  onClick={() => setMethod('cash')}
                  className="w-full flex items-center gap-4 p-4 bg-dark-200 border border-dark-400 hover:border-green-500/50 rounded-xl transition-all text-left group"
                >
                  <div className="w-11 h-11 bg-green-500/10 group-hover:bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                    <FaMoneyBillWave className="text-green-400 text-lg" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Pay at Gym (Cash)</p>
                    <p className="text-gray-500 text-xs mt-0.5">Submit request, then pay at front desk</p>
                  </div>
                </button>
              )}
              {/* Legacy QR fallback if enabled but razorpay disabled */}
              {!hasOnline && hasQr && (
                <button
                  onClick={() => setMethod('qr')}
                  className="w-full flex items-center gap-4 p-4 bg-dark-200 border border-dark-400 hover:border-primary/50 rounded-xl transition-all text-left group"
                >
                  <div className="w-11 h-11 bg-primary/10 group-hover:bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                    <FaQrcode className="text-primary text-lg" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Pay via QR Code / UPI</p>
                    <p className="text-gray-500 text-xs mt-0.5">Scan & pay instantly</p>
                  </div>
                </button>
              )}
              {!hasCash && !hasOnline && !hasQr && (
                <p className="text-gray-500 text-sm text-center py-4">
                  No payment methods are configured. Please contact the gym.
                </p>
              )}
              {(hasOnline || hasCash) && (
                <p className="text-gray-600 text-xs text-center flex items-center justify-center gap-1.5 pt-2">
                  <FaShieldAlt className="text-[10px]" /> Payments secured by Razorpay
                </p>
              )}
            </div>

          ) : method === 'cash' ? (
            /* Cash flow */
            <div>
              <button
                onClick={() => setMethod(null)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-white text-xs mb-4 transition-colors"
              >
                <FaChevronLeft className="text-[9px]" /> Back
              </button>

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaMoneyBillWave className="text-green-400 flex-shrink-0" />
                  <span className="text-green-400 font-semibold text-sm">Cash Payment Instructions</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {settings.cashInstructions}
                </p>
              </div>

              <div className="bg-dark-300 border border-dark-500 rounded-xl p-4 mb-5">
                <p className="text-gray-500 text-xs mb-2">Your Reference Number</p>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-white font-mono font-bold">{refNum}</span>
                  <button onClick={() => copy(refNum)} className="text-gray-500 hover:text-primary transition-colors">
                    <FaCopy className="text-xs" />
                  </button>
                </div>
                <p className="text-gray-600 text-xs">Amount Due: ₹{price?.toLocaleString()}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleCashSubmit}
                disabled={submitting}
                className="btn-primary w-full py-3 text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                  : 'Submit Cash Payment Request'}
              </motion.button>
            </div>

          ) : method === 'online' ? (
            /* Online Razorpay flow */
            <div>
              <button
                onClick={() => setMethod(null)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-white text-xs mb-4 transition-colors"
              >
                <FaChevronLeft className="text-[9px]" /> Back
              </button>

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaCreditCard className="text-primary flex-shrink-0" />
                  <span className="text-primary font-semibold text-sm">Online Payment</span>
                  <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full">Razorpay</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {settings.razorpayInstructions || 'Pay securely online via Razorpay — UPI, Cards, Net Banking & Wallets accepted.'}
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                  <FaShieldAlt className="text-green-400" /> Secure & instant activation
                </div>
              </div>

              <div className="bg-dark-300 border border-dark-500 rounded-xl p-4 mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs">Amount to Pay</p>
                    <p className="text-white font-black text-2xl" style={{ fontFamily: 'Oswald' }}>₹{price?.toLocaleString()}</p>
                    <p className="text-gray-500 text-xs">{plan.name} · {opt.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">Reference</p>
                    <p className="text-white font-mono text-xs font-bold">{refNum}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-3">
                  <span className="text-[10px] bg-dark-400 text-gray-300 px-2 py-1 rounded-full">UPI</span>
                  <span className="text-[10px] bg-dark-400 text-gray-300 px-2 py-1 rounded-full">Card</span>
                  <span className="text-[10px] bg-dark-400 text-gray-300 px-2 py-1 rounded-full">NetBanking</span>
                  <span className="text-[10px] bg-dark-400 text-gray-300 px-2 py-1 rounded-full">Wallet</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleOnlinePay}
                disabled={payingOnline}
                className="btn-primary w-full py-3 text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {payingOnline
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                  : `Pay ₹${price?.toLocaleString()} Online`}
              </motion.button>
              <p className="text-gray-600 text-xs text-center mt-2">You’ll be redirected to Razorpay’s secure checkout</p>
            </div>

          ) : (
            /* QR flow (legacy) */
            <div>
              <button
                onClick={() => setMethod(null)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-white text-xs mb-4 transition-colors"
              >
                <FaChevronLeft className="text-[9px]" /> Back
              </button>

              <div className="text-center mb-4">
                <div className="inline-block bg-white p-3 rounded-2xl mb-3">
                  <img
                    src={settings.qrCodeImage}
                    alt="Payment QR Code"
                    className="w-44 h-44 object-contain"
                  />
                </div>
                {settings.qrCodeLabel && (
                  <p className="text-gray-400 text-xs font-medium">{settings.qrCodeLabel}</p>
                )}
                {settings.upiId && (
                  <div className="flex items-center justify-center gap-2 mt-1.5">
                    <span className="text-primary text-sm font-mono">{settings.upiId}</span>
                    <button onClick={() => copy(settings.upiId)} className="text-gray-500 hover:text-primary transition-colors">
                      <FaCopy className="text-xs" />
                    </button>
                  </div>
                )}
                <p className="text-white font-bold text-lg mt-2">₹{price?.toLocaleString()}</p>
              </div>

              <p className="text-gray-400 text-xs text-center mb-4 leading-relaxed">
                {settings.qrInstructions}
              </p>

              <div className="mb-5">
                <label className="text-gray-400 text-xs mb-1.5 block">
                  Transaction ID <span className="text-gray-600">(optional but recommended)</span>
                </label>
                <input
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  placeholder="e.g. UPI1234567890"
                  className="input-field text-sm"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleQrSubmit}
                disabled={submitting}
                className="btn-primary w-full py-3 text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                  : 'I Have Paid — Submit'}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
