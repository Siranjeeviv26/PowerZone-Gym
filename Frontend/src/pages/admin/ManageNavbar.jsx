import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaEdit, FaSave, FaUpload, FaTimes, FaBars, FaUsers,
  FaUserTie, FaCrown, FaHome, FaSignOutAlt, FaMapMarkerAlt,
  FaDumbbell, FaImages, FaAppleAlt, FaExchangeAlt, FaGlobe,
  FaFileAlt, FaTachometerAlt, FaQuoteLeft, FaRunning,
  FaChevronUp, FaChevronDown, FaEye, FaEyeSlash, FaLink,
  FaImage, FaFont, FaMobileAlt,
  FaPalette,
  FaDatabase, FaTag,
} from 'react-icons/fa'
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

const DEFAULT_LINKS = [
  { to: '/', label: 'Home', visible: true },
  { to: '/about', label: 'About', visible: true },
  { to: '/trainers', label: 'Trainers', visible: true },
  { to: '/membership', label: 'Membership', visible: true },
  { to: '/workouts', label: 'Workouts', visible: true },
  { to: '/diet-plans', label: 'Diet Plans', visible: true },
  { to: '/gallery', label: 'Gallery', visible: true },
  { to: '/branches', label: 'Branches', visible: true },
  { to: '/contact', label: 'Contact', visible: true },
]

const DEFAULTS = {
  logoImage: '',
  brandName1: 'POWER',
  brandName2: 'ZONE',
  loginBtnText: 'Login',
  joinBtnText: 'Join Now',
  links: DEFAULT_LINKS,
}

export default function ManageNavbar() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [form, setForm] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/site-content/navbar')
      .then(({ data }) => {
        if (data.data && Object.keys(data.data).length) {
          const d = data.data
          setForm({
            logoImage: d.logoImage || '',
            brandName1: d.brandName1 || DEFAULTS.brandName1,
            brandName2: d.brandName2 || DEFAULTS.brandName2,
            loginBtnText: d.loginBtnText || DEFAULTS.loginBtnText,
            joinBtnText: d.joinBtnText || DEFAULTS.joinBtnText,
            links: d.links?.length ? d.links : DEFAULT_LINKS,
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/site-content/navbar', form)
      toast.success('Navbar settings saved! Refresh the site to see changes.')
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const { data } = await api.post('/site-content/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setForm(f => ({ ...f, logoImage: data.url }))
      toast.success('Logo uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const setLink = (i, field, val) =>
    setForm(f => ({ ...f, links: f.links.map((l, idx) => idx === i ? { ...l, [field]: val } : l) }))

  const moveLink = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= form.links.length) return
    const links = [...form.links]
    ;[links[i], links[j]] = [links[j], links[i]]
    setForm(f => ({ ...f, links }))
  }

  const resetLinks = () => setForm(f => ({ ...f, links: DEFAULT_LINKS }))

  const f = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  return (
    <div className="h-screen bg-dark flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-dark-100 border-r border-dark-400 transition-all duration-300 flex-shrink-0 flex flex-col`}>
        <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-6' : 'justify-center px-3'} py-5 border-b border-dark-400`}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <FaDumbbell className="text-white text-sm" />
          </div>
          {sidebarOpen && <span className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>ADMIN PANEL</span>}
        </div>
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}
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

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-dark-100 border-b border-dark-400 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors">
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="flex items-center gap-3">
            <Link to="/" target="_blank" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors">
              <FaEye className="text-xs" /> Preview Site
            </Link>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>NAVBAR SETTINGS</h1>
              <p className="text-gray-400 text-sm">Manage the site navigation bar — logo, links and buttons.</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Logo */}
                <div className="bg-dark-200 border border-dark-400 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-dark-400 flex items-center gap-2">
                    <FaImage className="text-primary text-sm" />
                    <h3 className="text-white font-semibold text-sm">Logo</h3>
                  </div>
                  <div className="p-5 space-y-4">
                    {/* Preview */}
                    <div className="flex items-center gap-4 p-4 bg-dark-300 rounded-xl border border-dark-400">
                      <span className="text-gray-500 text-xs">Preview:</span>
                      {form.logoImage ? (
                        <img src={form.logoImage} alt="Logo preview" className="h-10 w-auto object-contain" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                            <FaDumbbell className="text-white text-sm" />
                          </div>
                          <span className="text-white font-black text-lg" style={{ fontFamily: 'Oswald' }}>
                            {form.brandName1}<span className="text-primary">{form.brandName2}</span>
                          </span>
                        </div>
                      )}
                      {form.logoImage && (
                        <button onClick={() => f('logoImage', '')}
                          className="ml-auto text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
                          <FaTimes /> Remove
                        </button>
                      )}
                    </div>

                    {/* Upload / URL */}
                    <div>
                      <label className="block text-gray-400 text-xs mb-1.5">Custom Logo Image <span className="text-gray-600">(replaces icon + text)</span></label>
                      <div className="flex gap-2">
                        <input value={form.logoImage} onChange={e => f('logoImage', e.target.value)}
                          placeholder="https://... or upload →"
                          className="flex-1 bg-dark-300 border border-dark-400 focus:border-primary/50 rounded-lg px-3 py-2 text-white text-sm outline-none transition-colors" />
                        <label className={`flex items-center gap-1.5 px-4 rounded-lg cursor-pointer text-sm font-medium transition-colors flex-shrink-0 ${uploading ? 'bg-dark-300 text-gray-500 cursor-wait' : 'bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25'}`}>
                          <FaUpload className="text-xs" />
                          {uploading ? 'Uploading…' : 'Upload'}
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploading} />
                        </label>
                      </div>
                      <p className="text-gray-600 text-xs mt-1.5">Recommended: PNG with transparent background, height ~40px</p>
                    </div>

                    {/* Brand text (shown when no custom image) */}
                    <div className={`space-y-3 ${form.logoImage ? 'opacity-40 pointer-events-none' : ''}`}>
                      <label className="block text-gray-400 text-xs">Brand Name <span className="text-gray-600">(used when no custom logo)</span></label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-500 text-xs mb-1">Part 1 (white)</label>
                          <input value={form.brandName1} onChange={e => f('brandName1', e.target.value)}
                            className="w-full bg-dark-300 border border-dark-400 focus:border-primary/50 rounded-lg px-3 py-2 text-white text-sm outline-none transition-colors"
                            placeholder="POWER" />
                        </div>
                        <div>
                          <label className="block text-gray-500 text-xs mb-1">Part 2 (red)</label>
                          <input value={form.brandName2} onChange={e => f('brandName2', e.target.value)}
                            className="w-full bg-dark-300 border border-dark-400 focus:border-primary/50 rounded-lg px-3 py-2 text-primary text-sm outline-none transition-colors font-bold"
                            placeholder="ZONE" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nav Links */}
                <div className="bg-dark-200 border border-dark-400 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-dark-400 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaLink className="text-primary text-sm" />
                      <h3 className="text-white font-semibold text-sm">Navigation Links</h3>
                    </div>
                    <button onClick={resetLinks} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                      Reset to default
                    </button>
                  </div>
                  <div className="p-5 space-y-2">
                    <p className="text-gray-500 text-xs mb-3">Toggle visibility, rename labels, or reorder links.</p>
                    {form.links.map((link, i) => (
                      <motion.div key={link.to} layout
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all ${link.visible !== false ? 'bg-dark-300 border-dark-400' : 'bg-dark-100 border-dark-500 opacity-60'}`}>
                        {/* Reorder */}
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => moveLink(i, -1)} disabled={i === 0}
                            className="text-gray-600 hover:text-gray-300 disabled:opacity-20 transition-colors">
                            <FaChevronUp className="text-[9px]" />
                          </button>
                          <button onClick={() => moveLink(i, 1)} disabled={i === form.links.length - 1}
                            className="text-gray-600 hover:text-gray-300 disabled:opacity-20 transition-colors">
                            <FaChevronDown className="text-[9px]" />
                          </button>
                        </div>

                        {/* Visibility toggle */}
                        <button onClick={() => setLink(i, 'visible', link.visible === false ? true : false)}
                          className={`flex-shrink-0 transition-colors ${link.visible !== false ? 'text-primary' : 'text-gray-600'}`}
                          title={link.visible !== false ? 'Visible — click to hide' : 'Hidden — click to show'}>
                          {link.visible !== false ? <FaEye className="text-sm" /> : <FaEyeSlash className="text-sm" />}
                        </button>

                        {/* Route (non-editable) */}
                        <span className="text-gray-600 text-xs font-mono w-24 flex-shrink-0">{link.to}</span>

                        {/* Label */}
                        <input value={link.label} onChange={e => setLink(i, 'label', e.target.value)}
                          className="flex-1 bg-dark-200 border border-dark-500 focus:border-primary/50 rounded-lg px-3 py-1.5 text-white text-sm outline-none transition-colors"
                          placeholder="Link text" />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="bg-dark-200 border border-dark-400 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-dark-400 flex items-center gap-2">
                    <FaFont className="text-primary text-sm" />
                    <h3 className="text-white font-semibold text-sm">Button Labels</h3>
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-xs mb-1.5">Login Button</label>
                      <input value={form.loginBtnText} onChange={e => f('loginBtnText', e.target.value)}
                        className="w-full bg-dark-300 border border-dark-400 focus:border-primary/50 rounded-lg px-3 py-2 text-white text-sm outline-none transition-colors"
                        placeholder="Login" />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs mb-1.5">Join Button</label>
                      <input value={form.joinBtnText} onChange={e => f('joinBtnText', e.target.value)}
                        className="w-full bg-dark-300 border border-dark-400 focus:border-primary/50 rounded-lg px-3 py-2 text-white text-sm outline-none transition-colors"
                        placeholder="Join Now" />
                      <div className="mt-1.5 inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1 text-xs text-primary font-medium">
                        {form.joinBtnText || 'Join Now'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile preview hint */}
                <div className="flex items-start gap-3 bg-dark-200 border border-dark-400 rounded-xl p-4">
                  <FaMobileAlt className="text-gray-500 text-sm flex-shrink-0 mt-0.5" />
                  <p className="text-gray-500 text-xs leading-relaxed">
                    All changes apply to both desktop and mobile menus. Hidden links disappear from both. Brand name and logo are shown only on desktop; mobile shows the icon version.
                  </p>
                </div>

                {/* Save */}
                <div className="flex justify-end">
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-primary/20">
                    <FaSave />
                    {saving ? 'Saving…' : 'Save Navbar Settings'}
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
