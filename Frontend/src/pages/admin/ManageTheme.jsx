import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FaPalette, FaTimes, FaBars, FaUsers, FaUserTie, FaCrown,
  FaHome, FaSignOutAlt, FaMapMarkerAlt, FaDumbbell, FaImages, FaAppleAlt,
  FaExchangeAlt, FaSave, FaFileAlt, FaTachometerAlt, FaQuoteLeft,
  FaRunning, FaEdit, FaLink, FaGlobe, FaCheck, FaRedo,
  FaDatabase, FaTag,
} from 'react-icons/fa'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { useTheme } from '../../context/ThemeContext'
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

const PRESETS = [
  { name: 'Red (Default)', primary: '#e63946', primaryDark: '#c1121f', primaryLight: '#ff6b6b', secondary: '#f4a261' },
  { name: 'Blue', primary: '#3b82f6', primaryDark: '#1d4ed8', primaryLight: '#60a5fa', secondary: '#f59e0b' },
  { name: 'Green', primary: '#10b981', primaryDark: '#059669', primaryLight: '#34d399', secondary: '#f59e0b' },
  { name: 'Purple', primary: '#8b5cf6', primaryDark: '#6d28d9', primaryLight: '#a78bfa', secondary: '#f4a261' },
  { name: 'Orange', primary: '#f97316', primaryDark: '#ea580c', primaryLight: '#fb923c', secondary: '#06b6d4' },
  { name: 'Pink', primary: '#ec4899', primaryDark: '#be185d', primaryLight: '#f472b6', secondary: '#a78bfa' },
  { name: 'Cyan', primary: '#06b6d4', primaryDark: '#0891b2', primaryLight: '#22d3ee', secondary: '#f97316' },
  { name: 'Gold', primary: '#f59e0b', primaryDark: '#d97706', primaryLight: '#fbbf24', secondary: '#e63946' },
]

const DEFAULT_THEME = {
  primary: '#e63946',
  primaryDark: '#c1121f',
  primaryLight: '#ff6b6b',
  secondary: '#f4a261',
}

export default function ManageTheme() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024)
  const [form, setForm] = useState(DEFAULT_THEME)
  const [saving, setSaving] = useState(false)
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { theme, updateTheme } = useTheme()

  useEffect(() => {
    if (theme) setForm({ ...DEFAULT_THEME, ...theme })
  }, [theme])

  const f = (key, val) => {
    const next = { ...form, [key]: val }
    setForm(next)
    updateTheme(next)
  }

  const applyPreset = (preset) => {
    const next = { ...DEFAULT_THEME, ...preset }
    setForm(next)
    updateTheme(next)
  }

  const resetDefaults = () => {
    setForm(DEFAULT_THEME)
    updateTheme(DEFAULT_THEME)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/site-content/theme', form)
      toast.success('Theme saved! Colors are now applied site-wide.')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-screen bg-dark flex overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto flex-shrink-0 flex flex-col bg-dark-100 border-r border-dark-400 transition-all duration-300 ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64 lg:translate-x-0 lg:w-16'}`}>
        <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-6' : 'justify-center px-3'} py-5 border-b border-dark-400`}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <FaPalette className="text-white text-sm" />
          </div>
          {sidebarOpen && <span className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>ADMIN PANEL</span>}
        </div>
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}
              onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
              className={`flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl mb-1 text-sm font-medium transition-all ${pathname === item.to ? 'bg-primary/15 text-primary border border-primary/20' : 'text-gray-400 hover:bg-dark-300 hover:text-white'}`}>
              <item.icon className="text-base flex-shrink-0" />{sidebarOpen && item.label}
            </Link>
          ))}
        </nav>
        <div className="px-2 pb-4">
          <button onClick={() => { dispatch(logout()); navigate('/') }}
            className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm`}>
            <FaSignOutAlt className="flex-shrink-0" />{sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-dark-100 border-b border-dark-400 px-4 md:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors">
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Title row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>THEME & COLORS</h1>
              <p className="text-gray-400 text-sm">Choose colors that reflect across the entire site — public, user, trainer and admin panels</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={resetDefaults}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-dark-400 text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-sm font-medium">
                <FaRedo className="text-xs" /> Reset
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSave} disabled={saving}
                className="btn-primary text-sm py-2.5 flex items-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaSave className="text-xs" />}
                {saving ? 'Saving…' : 'Save Theme'}
              </motion.button>
            </div>
          </div>

          {/* Live preview strip — full width */}
          <div className="glass-card p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <FaPalette className="text-primary" /> Live Preview
            </h3>
            <div className="flex flex-wrap gap-3 items-center">
              <button className="btn-primary text-sm py-2">Primary Button</button>
              <button className="btn-secondary text-sm py-2">Secondary Button</button>
              <span className="text-primary font-bold text-sm">Primary Text</span>
              <span className="text-secondary font-bold text-sm">Secondary Text</span>
              <div className="w-8 h-8 rounded-full bg-primary" title="Primary" />
              <div className="w-8 h-8 rounded-full bg-primary-dark" title="Primary Dark" />
              <div className="w-8 h-8 rounded-full bg-primary-light" title="Primary Light" />
              <div className="w-8 h-8 rounded-full bg-secondary" title="Secondary" />
              <div className="h-1.5 flex-1 min-w-[120px] rounded-full bg-gradient-to-r from-primary to-secondary" />
            </div>
          </div>

          {/* Two-column: Presets + Custom Colors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Presets */}
            <div className="glass-card p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Color Presets</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                {PRESETS.map((preset) => {
                  const isActive = form.primary === preset.primary && form.secondary === preset.secondary
                  return (
                    <motion.button key={preset.name} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => applyPreset(preset)}
                      className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-xs font-medium ${isActive ? 'border-white/30 bg-white/5 text-white' : 'border-dark-400 text-gray-400 hover:border-dark-300 hover:text-white'}`}>
                      {isActive && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                          <FaCheck className="text-[8px] text-white" />
                        </div>
                      )}
                      <div className="flex gap-1">
                        <div className="w-6 h-6 rounded-full border border-white/10" style={{ backgroundColor: preset.primary }} />
                        <div className="w-6 h-6 rounded-full border border-white/10" style={{ backgroundColor: preset.secondary }} />
                      </div>
                      {preset.name}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Custom color pickers */}
            <div className="glass-card p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Custom Colors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ColorPicker label="Primary Color" desc="Main accent — buttons, highlights, borders" value={form.primary} onChange={(v) => f('primary', v)} />
                <ColorPicker label="Primary Dark" desc="Hover state of primary (button hover, etc.)" value={form.primaryDark} onChange={(v) => f('primaryDark', v)} />
                <ColorPicker label="Primary Light" desc="Lighter variant for subtle accents" value={form.primaryLight} onChange={(v) => f('primaryLight', v)} />
                <ColorPicker label="Secondary Color" desc="Gradient end color — badges, highlights" value={form.secondary} onChange={(v) => f('secondary', v)} />
              </div>
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm">
            <FaCheck className="text-primary mt-0.5 flex-shrink-0" />
            <div className="text-gray-300 leading-relaxed">
              Color changes are applied instantly as a live preview. Click <strong className="text-white">Save Theme</strong> to persist them across all pages, dashboards, and the public site — even after a page refresh.
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function ColorPicker({ label, desc, value, onChange }) {
  return (
    <div className="flex items-center gap-4">
      <label className="relative cursor-pointer flex-shrink-0">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="sr-only" />
        <div className="w-14 h-14 rounded-2xl border-2 border-dark-400 hover:border-gray-500 transition-colors shadow-lg overflow-hidden"
          style={{ backgroundColor: value }}>
          <div className="w-full h-full hover:bg-white/10 transition-colors" />
        </div>
      </label>
      <div>
        <div className="text-white text-sm font-semibold">{label}</div>
        <div className="text-gray-500 text-xs mb-1">{desc}</div>
        <input type="text" value={value}
          onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange(e.target.value) }}
          className="bg-dark-300 border border-dark-500 text-gray-300 rounded-lg px-3 py-1.5 text-xs font-mono w-28 focus:outline-none focus:border-primary transition-colors" />
      </div>
    </div>
  )
}
