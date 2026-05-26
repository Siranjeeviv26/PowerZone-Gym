import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { FaDumbbell, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaBolt, FaFire, FaTrophy } from 'react-icons/fa'
import { loginUser, clearError } from '../store/slices/authSlice'
import toast from 'react-hot-toast'
import { validate, required, email, minLen, fieldClass } from '../utils/validate'
import { useSiteContent } from '../context/SiteContentContext'

const RULES = {
  email: [required('Email'), email()],
  password: [required('Password'), minLen(6, 'Password')],
}

const LOGIN_DEFAULTS = {
  bgImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
  headline1: 'TRANSFORM', headline2: 'YOUR BODY.', headline3: 'TRANSFORM YOUR LIFE.',
  subtitle: 'Join thousands of members who have already achieved their fitness goals with PowerZone.',
  feature1: 'Personalized workout plans',
  feature2: 'Track your daily progress',
  feature3: 'Expert trainer guidance',
  quote: '"The body achieves what the mind believes."',
  formTitle: 'WELCOME BACK',
  formSubtitle: 'Sign in to continue your fitness journey',
}

function Err({ msg }) {
  if (!msg) return null
  return <p className="text-red-400 text-xs mt-1">{msg}</p>
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [showPass, setShowPass] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, user } = useSelector((s) => s.auth)
  const saved = useSiteContent('page_login')
  const c = saved ? { ...LOGIN_DEFAULTS, ...saved } : LOGIN_DEFAULTS
  const features = [
    { icon: FaBolt, text: c.feature1 },
    { icon: FaFire, text: c.feature2 },
    { icon: FaTrophy, text: c.feature3 },
  ]

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : user.role === 'trainer' ? '/trainer' : '/dashboard')
    return () => dispatch(clearError())
  }, [user])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }))

  const handleChange = (field, value) => {
    const next = { ...form, [field]: value }
    setForm(next)
    if (touched[field]) setErrors(validate(next, RULES))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const allTouched = Object.fromEntries(Object.keys(RULES).map((k) => [k, true]))
    setTouched(allTouched)
    const errs = validate(form, RULES)
    setErrors(errs)
    if (Object.keys(errs).length) return
    dispatch(loginUser(form))
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* LEFT PANEL — Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0">
          <img src={c.bgImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-dark/95 via-dark/80 to-primary/20" />
        </div>

        {/* Logo */}
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

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-5xl font-black text-white leading-tight" style={{ fontFamily: 'Oswald' }}>
              {c.headline1}<br />
              <span className="text-primary">{c.headline2}</span><br />
              {c.headline3}
            </h1>
            <p className="text-gray-300 text-lg mt-4 max-w-sm leading-relaxed">{c.subtitle}</p>
          </div>

          <div className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="text-primary text-sm" />
                </div>
                <span className="text-gray-200 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <blockquote className="border-l-2 border-primary pl-4">
            <p className="text-gray-300 text-sm italic">{c.quote}</p>
          </blockquote>
        </div>
      </div>

      {/* RIGHT PANEL — Form */}
      <div className="flex-1 flex flex-col justify-center bg-dark relative overflow-y-auto">
        {/* Mobile logo */}
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
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => { touch('email'); setErrors(validate(form, RULES)) }}
                  placeholder="your@email.com"
                  className={fieldClass(errors, 'email', 'input-field pl-11')}
                />
              </div>
              <Err msg={errors.email} />
            </div>

            <div>
              <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => { touch('password'); setErrors(validate(form, RULES)) }}
                  placeholder="Enter your password"
                  className={fieldClass(errors, 'password', 'input-field pl-11 pr-12')}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <Err msg={errors.password} />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary" />
                <span className="text-xs">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-primary hover:text-primary-light transition-colors text-xs">Forgot password?</Link>
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
                  Signing In...
                </span>
              ) : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary-light font-semibold transition-colors">
                Create account
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-dark-200 rounded-2xl border border-dark-400">
            <p className="text-gray-600 text-xs font-medium mb-2 uppercase tracking-wider">Demo Credentials</p>
            <div className="space-y-1">
              <p className="text-gray-400 text-xs">Admin: admin@powerzone.com / admin123</p>
              <p className="text-gray-400 text-xs">User: user@powerzone.com / user123</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
