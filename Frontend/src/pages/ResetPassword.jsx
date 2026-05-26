import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaDumbbell, FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [show, setShow] = useState({ password: false, confirm: false })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (!form.confirm) e.confirm = 'Please confirm your password'
    else if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password })
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80" alt="" className="w-full h-full object-cover" />
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
            CREATE A NEW<br />
            <span className="text-primary">PASSWORD</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-sm leading-relaxed">
            Choose a strong password that you haven't used before. Your account security matters to us.
          </p>
        </div>
        <div className="relative z-10">
          <blockquote className="border-l-2 border-primary pl-4">
            <p className="text-gray-300 text-sm italic">"A fresh start is always a good idea."</p>
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
          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
              <div className="w-20 h-20 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center mx-auto">
                <FaCheckCircle className="text-primary text-3xl" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Oswald' }}>PASSWORD RESET!</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Your password has been updated successfully.<br />Redirecting you to login…
                </p>
              </div>
              <Link to="/login" className="btn-primary text-sm py-3 inline-block">Go to Login</Link>
            </motion.div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'Oswald' }}>NEW PASSWORD</h2>
                <p className="text-gray-400 mt-1.5 text-sm">Enter and confirm your new password below</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                    <input
                      type={show.password ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); setErrors((er) => ({ ...er, password: '' })) }}
                      placeholder="At least 6 characters"
                      className={`input-field pl-11 pr-12 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <button type="button" onClick={() => setShow((s) => ({ ...s, password: !s.password }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {show.password ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                    <input
                      type={show.confirm ? 'text' : 'password'}
                      value={form.confirm}
                      onChange={(e) => { setForm((f) => ({ ...f, confirm: e.target.value })); setErrors((er) => ({ ...er, confirm: '' })) }}
                      placeholder="Re-enter your password"
                      className={`input-field pl-11 pr-12 ${errors.confirm ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <button type="button" onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {show.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>}
                </div>

                {/* Password strength hint */}
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      form.password.length === 0 ? 'bg-dark-400' :
                      form.password.length < 6 && i <= 1 ? 'bg-red-500' :
                      form.password.length < 8 && i <= 2 ? 'bg-yellow-500' :
                      form.password.length < 10 && i <= 3 ? 'bg-blue-500' :
                      i <= 4 ? 'bg-green-500' : 'bg-dark-400'
                    }`} />
                  ))}
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
                      Updating Password...
                    </span>
                  ) : 'Update Password'}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Back to login
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
