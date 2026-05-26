import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaDumbbell, FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useSiteContent } from '../context/SiteContentContext'

const FORGOT_DEFAULTS = {
  bgImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
  headline1: 'FORGOT YOUR', headline2: 'PASSWORD?',
  subtitle: "No worries — it happens to the best of us. Enter your email and we'll send you a reset link instantly.",
  quote: '"Every setback is a setup for a comeback."',
  formTitle: 'RESET PASSWORD',
  formSubtitle: "Enter your account email and we'll send you a reset link",
}

export default function ForgotPassword() {
  const saved = useSiteContent('page_forgot')
  const c = saved ? { ...FORGOT_DEFAULTS, ...saved } : FORGOT_DEFAULTS
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setError('Email is required'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address'); return }
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0">
          <img src={c.bgImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-dark/95 via-dark/80 to-primary/20" />
        </div>
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <FaDumbbell className="text-white text-base" />
            </div>
            <span className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>
              POWER<span className="text-primary">ZONE</span>
            </span>
          </Link>
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-black text-white leading-tight" style={{ fontFamily: 'Oswald' }}>
            {c.headline1}<br />
            <span className="text-primary">{c.headline2}</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-sm leading-relaxed">{c.subtitle}</p>
        </div>
        <div className="relative z-10">
          <blockquote className="border-l-2 border-primary pl-4">
            <p className="text-gray-300 text-sm italic">{c.quote}</p>
          </blockquote>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col justify-center bg-dark relative overflow-y-auto">
        <div className="lg:hidden px-8 pt-8 pb-4">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <FaDumbbell className="text-white text-sm" />
            </div>
            <span className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>
              POWER<span className="text-primary">ZONE</span>
            </span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="px-8 md:px-16 py-10 max-w-md mx-auto w-full"
        >
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
              <div className="w-20 h-20 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center mx-auto">
                <FaCheckCircle className="text-primary text-3xl" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Oswald' }}>CHECK YOUR EMAIL</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  We've sent a password reset link to<br />
                  <span className="text-white font-semibold">{email}</span>
                </p>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">
                Didn't receive it? Check your spam folder or{' '}
                <button onClick={() => setSent(false)} className="text-primary hover:text-primary-light transition-colors font-medium">
                  try again
                </button>
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mt-4">
                <FaArrowLeft className="text-xs" /> Back to login
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'Oswald' }}>{c.formTitle}</h2>
                <p className="text-gray-400 mt-1.5 text-sm">{c.formSubtitle}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError('') }}
                      placeholder="your@email.com"
                      className={`input-field pl-11 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                  </div>
                  {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary py-3.5 text-sm disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending Reset Link...
                    </span>
                  ) : 'Send Reset Link'}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                  <FaArrowLeft className="text-xs" /> Back to login
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
