import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaFileAlt, FaShieldAlt, FaPlus, FaTrash, FaSave, FaEdit,
  FaChevronUp, FaChevronDown, FaTimes, FaBars, FaUsers,
  FaUserTie, FaCrown, FaHome, FaSignOutAlt, FaMapMarkerAlt,
  FaAppleAlt, FaDumbbell, FaImages, FaExchangeAlt, FaGlobe, FaTachometerAlt, FaQuoteLeft, FaRunning, FaLink,
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

const TABS = [
  { key: 'terms', label: 'Terms of Service', icon: FaFileAlt, color: '#e63946' },
  { key: 'privacy', label: 'Privacy Policy', icon: FaShieldAlt, color: '#4361ee' },
]

const DEFAULT_SECTION = { heading: '', body: '' }

export default function ManageLegal() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('terms')
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const fetchContent = async (type) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/legal/${type}`)
      const legal = data.legal || data
      setSections(legal.sections?.length ? legal.sections : [{ heading: '', body: '' }])
      setLastUpdated(legal.lastUpdated)
    } catch {
      setSections([{ heading: '', body: '' }])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchContent(activeTab) }, [activeTab])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/legal/${activeTab}`, { sections })
      toast.success('Content saved successfully!')
      fetchContent(activeTab)
    } catch {
      toast.error('Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const addSection = () => setSections([...sections, { ...DEFAULT_SECTION }])
  const removeSection = (i) => setSections(sections.filter((_, idx) => idx !== i))
  const updateSection = (i, field, value) => setSections(sections.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  const moveSection = (i, dir) => {
    const next = [...sections]
    const to = i + dir
    if (to < 0 || to >= next.length) return
    ;[next[i], next[to]] = [next[to], next[i]]
    setSections(next)
  }

  const activeInfo = TABS.find((t) => t.key === activeTab)
  const ActiveIcon = activeInfo.icon

  return (
    <div className="h-screen bg-dark flex overflow-hidden">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-dark-100 border-r border-dark-400 transition-all duration-300 flex-shrink-0 flex flex-col`}>
        <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-6' : 'justify-center px-3'} py-5 border-b border-dark-400`}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <FaDumbbell className="text-white text-sm" />
          </div>
          {sidebarOpen && <span className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>ADMIN PANEL</span>}
        </div>
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl mb-1 text-sm font-medium transition-all ${
                pathname === item.to ? 'bg-primary/15 text-primary border border-primary/20' : 'text-gray-400 hover:bg-dark-300 hover:text-white'
              }`}
            >
              <item.icon className="text-base flex-shrink-0" />
              {sidebarOpen && item.label}
            </Link>
          ))}
        </nav>
        <div className="px-2 pb-4">
          <button
            onClick={() => { dispatch(logout()); navigate('/') }}
            className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm`}
          >
            <FaSignOutAlt className="flex-shrink-0" />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-dark-100 border-b border-dark-400 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl">
            <div className="mb-6">
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>Manage Legal Content</h1>
              <p className="text-gray-400 text-sm mt-1">Edit Terms of Service and Privacy Policy content displayed to users.</p>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-2 mb-6">
              {TABS.map(({ key, label, icon: Icon, color }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === key ? 'text-white shadow-lg' : 'bg-dark-300 text-gray-400 hover:text-white border border-dark-500'
                  }`}
                  style={activeTab === key ? { backgroundColor: color, boxShadow: `0 4px 15px ${color}30` } : {}}>
                  <Icon className="text-xs" /> {label}
                </button>
              ))}
            </div>

            {/* Info bar */}
            <div className="flex items-center justify-between mb-6 p-4 bg-dark-200 border border-dark-400 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${activeInfo.color}18`, border: `1px solid ${activeInfo.color}28` }}>
                  <ActiveIcon style={{ color: activeInfo.color }} className="text-sm" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{activeInfo.label}</div>
                  <div className="text-gray-500 text-xs">
                    {lastUpdated ? `Last updated: ${new Date(lastUpdated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : 'Never published'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">{sections.length} section{sections.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[0,1,2].map((i) => (
                  <div key={i} className="bg-dark-200 border border-dark-400 rounded-2xl p-5 animate-pulse">
                    <div className="h-4 bg-dark-400 rounded w-1/3 mb-3" />
                    <div className="h-20 bg-dark-400 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((sec, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-dark-200 border border-dark-400 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-dark-400 bg-dark-300/50">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-primary/15 rounded-lg flex items-center justify-center text-primary text-[10px] font-black">{i + 1}</span>
                        <FaEdit className="text-gray-500 text-xs" />
                        <span className="text-gray-400 text-xs">Section {i + 1}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveSection(i, -1)} disabled={i === 0}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white disabled:opacity-30 bg-dark-400 hover:bg-dark-500 rounded-lg transition-colors">
                          <FaChevronUp className="text-[10px]" />
                        </button>
                        <button onClick={() => moveSection(i, 1)} disabled={i === sections.length - 1}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white disabled:opacity-30 bg-dark-400 hover:bg-dark-500 rounded-lg transition-colors">
                          <FaChevronDown className="text-[10px]" />
                        </button>
                        <button onClick={() => removeSection(i)} disabled={sections.length === 1}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-red-400 disabled:opacity-30 bg-dark-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1">
                          <FaTrash className="text-[10px]" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Heading</label>
                        <input value={sec.heading} onChange={(e) => updateSection(i, 'heading', e.target.value)}
                          placeholder="e.g. Acceptance of Terms" className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Content</label>
                        <textarea value={sec.body} onChange={(e) => updateSection(i, 'body', e.target.value)}
                          rows={4} placeholder="Write the content for this section..." className="input-field text-sm resize-y" />
                      </div>
                    </div>
                  </motion.div>
                ))}

                <div className="flex items-center justify-between pt-2">
                  <button onClick={addSection}
                    className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-dark-500 hover:border-primary/40 text-gray-400 hover:text-primary rounded-xl text-sm transition-all duration-200">
                    <FaPlus className="text-xs" /> Add Section
                  </button>
                  <motion.button onClick={handleSave} disabled={saving} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-primary/25 disabled:opacity-60 transition-all">
                    {saving ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                    ) : (
                      <><FaSave className="text-xs" /> Save Changes</>
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
