import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FaGlobe, FaTimes, FaBars, FaUsers, FaUserTie, FaCrown,
  FaHome, FaSignOutAlt, FaMapMarkerAlt, FaDumbbell, FaImages, FaAppleAlt,
  FaExchangeAlt, FaSave, FaEnvelope, FaFacebook, FaInstagram, FaTwitter,
  FaYoutube, FaClock, FaFileAlt, FaTachometerAlt, FaQuoteLeft, FaRunning, FaEdit, FaLink,
  FaPalette, FaEye, FaEyeSlash,
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
  showFacebook: true, showInstagram: true, showTwitter: true, showYoutube: true,
}

export default function ManageFooter() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024)
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
        showFacebook: s.showFacebook !== false,
        showInstagram: s.showInstagram !== false,
        showTwitter: s.showTwitter !== false,
        showYoutube: s.showYoutube !== false,
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
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto flex-shrink-0 flex flex-col bg-dark-100 border-r border-dark-400 transition-all duration-300 ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64 lg:translate-x-0 lg:w-16'}`}>
        <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-6' : 'justify-center px-3'} py-5 border-b border-dark-400`}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <FaGlobe className="text-white text-sm" />
          </div>
          {sidebarOpen && <span className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>ADMIN PANEL</span>}
        </div>
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} className={`flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl mb-1 text-sm font-medium transition-all ${pathname === item.to ? 'bg-primary/15 text-primary border border-primary/20' : 'text-gray-400 hover:bg-dark-300 hover:text-white'}`}>
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
        <header className="bg-dark-100 border-b border-dark-400 px-4 md:px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors">
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
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
                  <h3 className="text-white font-semibold text-sm mb-1 flex items-center gap-2">
                    <FaGlobe className="text-primary" /> Social Media Links
                  </h3>
                  <p className="text-gray-500 text-xs mb-4">Toggle the eye icon to show or hide each platform on the site footer.</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'facebook', showKey: 'showFacebook', icon: FaFacebook, color: 'text-blue-400', label: 'Facebook', placeholder: 'https://facebook.com/...' },
                      { key: 'instagram', showKey: 'showInstagram', icon: FaInstagram, color: 'text-pink-400', label: 'Instagram', placeholder: 'https://instagram.com/...' },
                      { key: 'twitter', showKey: 'showTwitter', icon: FaTwitter, color: 'text-sky-400', label: 'Twitter / X', placeholder: 'https://twitter.com/...' },
                      { key: 'youtube', showKey: 'showYoutube', icon: FaYoutube, color: 'text-red-400', label: 'YouTube', placeholder: 'https://youtube.com/...' },
                    ].map(({ key, showKey, icon: Icon, color, label, placeholder }) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={`text-gray-400 text-xs flex items-center gap-1.5 ${!form[showKey] ? 'opacity-40' : ''}`}>
                            <Icon className={color} /> {label}
                          </label>
                          <button
                            type="button"
                            onClick={() => f(showKey, !form[showKey])}
                            title={form[showKey] ? 'Visible on site — click to hide' : 'Hidden from site — click to show'}
                            className={`flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5 transition-all ${
                              form[showKey]
                                ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                                : 'bg-dark-400 text-gray-500 border border-dark-500'
                            }`}
                          >
                            {form[showKey] ? <FaEye className="text-[9px]" /> : <FaEyeSlash className="text-[9px]" />}
                            {form[showKey] ? 'Visible' : 'Hidden'}
                          </button>
                        </div>
                        <input
                          value={form[key]}
                          onChange={(e) => f(key, e.target.value)}
                          placeholder={placeholder}
                          className={`input-field text-sm transition-opacity ${!form[showKey] ? 'opacity-40' : ''}`}
                        />
                      </div>
                    ))}
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
