import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { FaDumbbell, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaStar, FaShieldAlt, FaUsers } from 'react-icons/fa'
import { registerUser, clearError } from '../store/slices/authSlice'
import toast from 'react-hot-toast'
import { validate, required, email, minLen, maxLen, phone, noNumbers, passwordStrength, matchField, fieldClass } from '../utils/validate'
import PhoneInput from '../components/shared/PhoneInput'
import LegalModal from '../components/shared/LegalModal'
import { useSiteContent } from '../context/SiteContentContext'

const REGISTER_DEFAULTS = {
  bgImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1920&q=80',
  headline1: 'START YOUR', headline2: 'FITNESS', headline3: 'JOURNEY TODAY',
  subtitle: 'Join over 500+ members training at PowerZone.',
  perk1Title: '7-Day Free Trial', perk1Desc: 'Start with no commitment',
  perk2Title: 'Personalized Plans', perk2Desc: 'Workouts tailored to your goals',
  perk3Title: 'Expert Trainers', perk3Desc: 'Guidance every step of the way',
  memberCount: '500+ members already transforming',
  formTitle: 'CREATE ACCOUNT',
  formSubtitle: 'Start your transformation — 7 days free trial',
}

const PERK_ICONS = [FaStar, FaShieldAlt, FaUsers]

function Err({ msg }) {
  if (!msg) return null
  return <p className="text-red-400 text-xs mt-1">{msg}</p>
}

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', goal: '' })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [agreedErr, setAgreedErr] = useState(false)
  const [legalModal, setLegalModal] = useState(null) // 'terms' | 'privacy' | null
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, user } = useSelector((s) => s.auth)
  const saved = useSiteContent('page_register')
  const c = saved ? { ...REGISTER_DEFAULTS, ...saved } : REGISTER_DEFAULTS
  const perks = [
    { icon: PERK_ICONS[0], title: c.perk1Title, desc: c.perk1Desc },
    { icon: PERK_ICONS[1], title: c.perk2Title, desc: c.perk2Desc },
    { icon: PERK_ICONS[2], title: c.perk3Title, desc: c.perk3Desc },
  ]

  const rules = {
    name: [required('Name'), minLen(2, 'Name'), maxLen(50, 'Name'), noNumbers('Name')],
    email: [required('Email'), email()],
    phone: [phone()],
    password: [required('Password'), minLen(6, 'Password'), passwordStrength()],
    confirm: [required('Confirm password'), matchField(form.password, 'Passwords')],
  }

  useEffect(() => {
    if (user) { toast.success('Welcome to PowerZone!'); navigate('/dashboard') }
    return () => dispatch(clearError())
  }, [user])

  useEffect(() => { if (error) toast.error(error) }, [error])

  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }))

  const handleChange = (field, value) => {
    const next = { ...form, [field]: value }
    setForm(next)
    if (touched[field] || (field === 'password' && touched.confirm)) {
      setErrors(validate(next, rules))
    }
  }

  const handleBlur = (field) => {
    touch(field)
    setErrors(validate(form, rules))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const allTouched = Object.fromEntries(Object.keys(rules).map((k) => [k, true]))
    setTouched(allTouched)
    const errs = validate(form, rules)
    setErrors(errs)
    if (!agreed) { setAgreedErr(true); return }
    if (Object.keys(errs).length) return
    const { confirm, ...data } = form
    dispatch(registerUser(data))
  }

  const fc = (field, extra = '') => fieldClass(errors, field, `input-field ${extra}`.trim())

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0">
          <img src={c.bgImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-dark/95 via-dark/85 to-secondary/20" />
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
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-black text-white leading-tight" style={{ fontFamily: 'Oswald' }}>
              {c.headline1}<br /><span className="text-primary">{c.headline2}</span><br />{c.headline3}
            </h1>
            <p className="text-gray-300 mt-3 text-sm leading-relaxed">{c.subtitle}</p>
          </div>
          <div className="space-y-4">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 bg-primary/15 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="text-primary text-sm" />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{title}</div>
                  <div className="text-gray-400 text-xs">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['A', 'B', 'C', 'D'].map((l) => (
                <div key={l} className="w-7 h-7 bg-gradient-to-br from-primary to-secondary rounded-full border-2 border-dark flex items-center justify-center text-white text-[10px] font-bold">{l}</div>
              ))}
            </div>
            <p className="text-gray-400 text-xs">{c.memberCount}</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col justify-center bg-dark overflow-y-auto">
        <div className="lg:hidden px-8 pt-8 pb-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <FaDumbbell className="text-white text-sm" />
            </div>
            <span className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>
              POWER<span className="text-primary">ZONE</span>
            </span>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="px-8 md:px-14 py-8 max-w-lg mx-auto w-full">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'Oswald' }}>{c.formTitle}</h2>
            <p className="text-gray-400 mt-1 text-sm">{c.formSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Full Name <span className="text-red-400">*</span></label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                  <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} onBlur={() => handleBlur('name')} placeholder="John Smith" className={fc('name', 'pl-11')} />
                </div>
                <Err msg={errors.name} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Email <span className="text-red-400">*</span></label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                  <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} onBlur={() => handleBlur('email')} placeholder="your@email.com" className={fc('email', 'pl-11')} />
                </div>
                <Err msg={errors.email} />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Phone Number</label>
              <PhoneInput value={form.phone} onChange={(v) => handleChange('phone', v)} onBlur={() => handleBlur('phone')} error={errors.phone} />
              <Err msg={errors.phone} />
            </div>

            <div>
              <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Fitness Goal</label>
              <select value={form.goal} onChange={(e) => handleChange('goal', e.target.value)} className="input-field">
                <option value="">Select your goal</option>
                <option>Lose Weight</option>
                <option>Build Muscle</option>
                <option>Improve Fitness</option>
                <option>Athletic Training</option>
                <option>General Health</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => handleChange('password', e.target.value)} onBlur={() => handleBlur('password')} placeholder="Min. 6 chars" className={fc('password', 'pl-11 pr-10')} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showPass ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
                <Err msg={errors.password} />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Confirm <span className="text-red-400">*</span></label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                  <input type="password" value={form.confirm} onChange={(e) => handleChange('confirm', e.target.value)} onBlur={() => handleBlur('confirm')} placeholder="Repeat password" className={fc('confirm', 'pl-11')} />
                </div>
                <Err msg={errors.confirm} />
              </div>
            </div>

            {/* Terms checkbox */}
            <div>
              <label className={`flex items-start gap-3 cursor-pointer group ${agreedErr ? 'opacity-100' : ''}`}>
                <div className="relative mt-0.5 flex-shrink-0" onClick={() => { setAgreed(!agreed); setAgreedErr(false) }}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    agreed ? 'bg-primary border-primary' : agreedErr ? 'border-red-400 bg-red-500/10' : 'border-dark-500 bg-dark-300 group-hover:border-primary/50'
                  }`}>
                    {agreed && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  I agree to the{' '}
                  <button type="button" onClick={(e) => { e.stopPropagation(); setLegalModal('terms') }}
                    className="text-primary hover:text-primary-light hover:underline font-medium transition-colors">
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button type="button" onClick={(e) => { e.stopPropagation(); setLegalModal('privacy') }}
                    className="text-primary hover:text-primary-light hover:underline font-medium transition-colors">
                    Privacy Policy
                  </button>
                </p>
              </label>
              {agreedErr && <p className="text-red-400 text-xs mt-1">You must agree to the Terms &amp; Privacy Policy to continue.</p>}
            </div>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full btn-primary py-3.5 text-sm disabled:opacity-60">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : 'Create Account — Free Trial'}
            </motion.button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-gray-500 text-sm">
              Already a member?{' '}
              <Link to="/login" className="text-primary hover:text-primary-light font-semibold transition-colors">Sign In</Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Legal modals */}
      {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}
    </div>
  )
}
