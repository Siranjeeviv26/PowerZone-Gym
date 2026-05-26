import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FaGlobe, FaTimes, FaBars, FaUsers, FaUserTie, FaCrown,
  FaHome, FaSignOutAlt, FaMapMarkerAlt, FaDumbbell, FaImages, FaAppleAlt,
  FaExchangeAlt, FaSave, FaEnvelope, FaFacebook, FaInstagram, FaTwitter,
  FaYoutube, FaClock, FaFileAlt, FaTachometerAlt, FaQuoteLeft, FaRunning, FaEdit, FaLink,
  FaPalette,
  FaDatabase, FaTag,
} from 'react-icons/fa'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PhoneInput from '../../components/shared/PhoneInput'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FaTachometerAlt },
  { to: '/admin/users', label: 'Members', icon: FaUsers },
  { to: '/admin/trainers', label: 'Trainers', icon: FaUserTie },
  { to: '/admin/plans', label: 'Plans', icon: FaCrown },
  { to: '/admin/branches', label: 'Branches', icon: FaMapMarkerAlt },
  { to: '/admin/transfer', label: 'Transfer', icon: FaExchangeAlt },
  { to: '/admin/activities', label: 'Activities', icon: FaRunning },
  { to: '/admin/content', label: 'Site Content', icon: FaEdit },
  { to: '/admin/navbar', label: 'Navbar', icon: FaLink },
  { to: '/admin/footer', label: 'Footer', icon: FaGlobe },
  { to: '/admin/theme', label: 'Theme', icon: FaPalette },
  { to: '/admin/master-data', label: 'Master Data', icon: FaDatabase },
  { to: '/admin/workouts', label: 'Workouts', icon: FaDumbbell },
  { to: '/admin/diet-plans', label: 'Diet Plans', icon: FaAppleAlt },
  { to: '/admin/gallery', label: 'Gallery', icon: FaImages },
  { to: '/admin/testimonials', label: 'Testimonials', icon: FaQuoteLeft },
  { to: '/admin/legal', label: 'Legal', icon: FaFileAlt },
  { to: '/', label: 'View Site', icon: FaHome },
]

const DEFAULTS = {
  address: '', phone: '', email: '',
  weekdayHours: 'Mon – Fri: 5:00 AM – 11:00 PM',
  weekendHours: 'Sat – Sun: 6:00 AM – 10:00 PM',
  facebook: '', instagram: '', twitter: '', youtube: '',
}

export default function ManageFooter() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [form, setForm] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings/footer')
      const s = data.settings
      setForm({
        address: s.address || '',
        phone: s.phone || '',
        email: s.email || '',
        weekdayHours: s.weekdayHours || DEFAULTS.weekdayHours,
        weekendHours: s.weekendHours || DEFAULTS.weekendHours,
        facebook: s.facebook || '',
        instagram: s.instagram || '',
        twitter: s.twitter || '',
        youtube: s.youtube || '',
      })
    } catch {
      // keep defaults
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/settings/footer', form)
      toast.success('Footer settings saved! The site footer is now updated.')
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const f = (field, val) => setForm((prev) => ({ ...prev, [field]: val }))

  return (
    <div className="h-screen bg-dark flex overflow-hidden">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-dark-100 border-r border-dark-400 transition-all duration-300 flex-shrink-0 flex flex-col`}>
        <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-6' : 'justify-center px-3'} py-5 border-b border-dark-400`}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <FaGlobe className="text-white text-sm" />
          </div>
          {sidebarOpen && <span className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>ADMIN PANEL</span>}
        </div>
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className={`flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl mb-1 text-sm font-medium transition-all ${pathname === item.to ? 'bg-primary/15 text-primary border border-primary/20' : 'text-gray-400 hover:bg-dark-300 hover:text-white'}`}>
              <item.icon className="text-base flex-shrink-0" />{sidebarOpen && item.label}
            </Link>
          ))}
        </nav>
        <div className="px-2 pb-4">
          <button onClick={() => { dispatch(logout()); navigate('/') }} className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm`}>
            <FaSignOutAlt className="flex-shrink-0" />{sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-dark-100 border-b border-dark-400 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors">
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6 max-w-2xl">
            <div>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>FOOTER SETTINGS</h1>
              <p className="text-gray-400 text-sm">Update contact info, hours and social links shown in the site footer</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="space-y-5">
                {/* Contact */}
                <div className="glass-card p-5">
                  <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                    <FaEnvelope className="text-primary" /> Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-xs mb-1.5 block">Address</label>
                      <input value={form.address} onChange={(e) => f('address', e.target.value)} placeholder="123 Street, City, State" className="input-field text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400 text-xs mb-1.5 block">Phone</label>
                        <PhoneInput value={form.phone} onChange={(v) => f('phone', v)} />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs mb-1.5 block">Email</label>
                        <input type="email" value={form.email} onChange={(e) => f('email', e.target.value)} placeholder="info@powerzone.com" className="input-field text-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="glass-card p-5">
                  <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                    <FaClock className="text-primary" /> Opening Hours
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-xs mb-1.5 block">Weekdays</label>
                      <input value={form.weekdayHours} onChange={(e) => f('weekdayHours', e.target.value)} placeholder="Mon – Fri: 5:00 AM – 11:00 PM" className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1.5 block">Weekends</label>
                      <input value={form.weekendHours} onChange={(e) => f('weekendHours', e.target.value)} placeholder="Sat – Sun: 6:00 AM – 10:00 PM" className="input-field text-sm" />
                    </div>
                  </div>
                </div>

                {/* Social */}
                <div className="glass-card p-5">
                  <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                    <FaGlobe className="text-primary" /> Social Media Links
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-xs mb-1.5 flex items-center gap-1.5 block"><FaFacebook className="text-blue-400" /> Facebook</label>
                      <input value={form.facebook} onChange={(e) => f('facebook', e.target.value)} placeholder="https://facebook.com/..." className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1.5 flex items-center gap-1.5 block"><FaInstagram className="text-pink-400" /> Instagram</label>
                      <input value={form.instagram} onChange={(e) => f('instagram', e.target.value)} placeholder="https://instagram.com/..." className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1.5 flex items-center gap-1.5 block"><FaTwitter className="text-sky-400" /> Twitter / X</label>
                      <input value={form.twitter} onChange={(e) => f('twitter', e.target.value)} placeholder="https://twitter.com/..." className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1.5 flex items-center gap-1.5 block"><FaYoutube className="text-red-400" /> YouTube</label>
                      <input value={form.youtube} onChange={(e) => f('youtube', e.target.value)} placeholder="https://youtube.com/..." className="input-field text-sm" />
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary py-3 px-8 flex items-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><FaSave /> Save Footer Settings</>
                  )}
                </motion.button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
