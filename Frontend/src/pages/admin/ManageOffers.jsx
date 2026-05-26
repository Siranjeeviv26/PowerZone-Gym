import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaTag, FaUpload, FaTrash, FaDumbbell, FaUsers, FaUserTie, FaCrown,
  FaHome, FaSignOutAlt, FaTimes, FaBars, FaMapMarkerAlt, FaImages,
  FaAppleAlt, FaExchangeAlt, FaGlobe, FaFileAlt, FaTachometerAlt,
  FaQuoteLeft, FaRunning, FaEdit, FaLink, FaPalette, FaDatabase, FaCheck,
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

function OfferCard({ plan, onSaved }) {
  const [form, setForm] = useState({
    title: plan.offer?.title || '',
    startDate: plan.offer?.startDate ? plan.offer.startDate.slice(0, 10) : '',
    endDate: plan.offer?.endDate ? plan.offer.endDate.slice(0, 10) : '',
    isActive: plan.offer?.isActive !== false,
    file: null,
    preview: plan.offer?.image || '',
  })
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const hasOffer = !!plan.offer?.image

  const handleSave = async () => {
    if (!form.preview && !form.file) return toast.error('Please upload an offer image')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('startDate', form.startDate)
      fd.append('endDate', form.endDate)
      fd.append('isActive', String(form.isActive))
      if (form.file) fd.append('image', form.file)
      const { data } = await api.put(`/plans/${plan._id}/offer`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onSaved(data.plan)
      toast.success('Offer saved!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save offer')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    setRemoving(true)
    try {
      const { data } = await api.delete(`/plans/${plan._id}/offer`)
      onSaved(data.plan)
      setForm({ title: '', startDate: '', endDate: '', isActive: true, file: null, preview: '' })
      toast.success('Offer removed!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove offer')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      {/* Plan header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: plan.color || '#e63946' }} />
          <span className="text-white font-black text-lg" style={{ fontFamily: 'Oswald' }}>{plan.name}</span>
          <span className="text-xs text-gray-500">₹{plan.monthlyPrice?.toLocaleString()}/mo</span>
        </div>
        {hasOffer && form.isActive ? (
          <span className="flex items-center gap-1.5 text-[10px] bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full font-bold border border-orange-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-400" />
            </span>
            LIVE
          </span>
        ) : (
          <span className="text-[10px] text-gray-600 border border-dark-500 px-2.5 py-1 rounded-full">No Offer</span>
        )}
      </div>

      {/* Image upload */}
      <div className="mb-4">
        <label className="text-gray-400 text-xs mb-2 block">Offer Image</label>
        <label className="block cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0]
              if (!file) return
              setForm((f) => ({ ...f, file, preview: URL.createObjectURL(file) }))
            }}
          />
          {form.preview ? (
            <div className="relative group rounded-xl overflow-hidden border border-dark-400">
              <img src={form.preview} alt="Offer" className="w-full h-40 object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <FaUpload className="text-white text-lg" />
                <span className="text-white text-sm font-semibold">Change Image</span>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-dark-400 hover:border-orange-500/40 rounded-xl h-32 flex flex-col items-center justify-center gap-2 transition-colors">
              <FaUpload className="text-2xl text-gray-600" />
              <span className="text-gray-500 text-sm">Click to upload offer image</span>
              <span className="text-gray-600 text-xs">JPG, PNG, WebP recommended</span>
            </div>
          )}
        </label>
      </div>

      {/* Title */}
      <div className="mb-3">
        <label className="text-gray-400 text-xs mb-1 block">Offer Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="e.g. 50% OFF on Annual Plan"
          className="input-field text-sm w-full"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            className="input-field text-sm w-full"
          />
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">End Date</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            className="input-field text-sm w-full"
          />
        </div>
      </div>

      {/* Active toggle */}
      <label className="flex items-center gap-3 cursor-pointer mb-5">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
          className="w-4 h-4 accent-orange-500"
        />
        <span className="text-gray-300 text-sm">Show offer badge on site</span>
      </label>

      {/* Actions */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving || removing}
          className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-full font-semibold text-sm transition-colors disabled:opacity-60"
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
          ) : (
            <><FaTag className="text-xs" /> Save Offer</>
          )}
        </motion.button>
        {hasOffer && (
          <button
            onClick={handleRemove}
            disabled={saving || removing}
            className="flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2.5 rounded-full text-sm transition-colors disabled:opacity-60"
          >
            {removing ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : <FaTrash className="text-xs" />}
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default function ManageOffers() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/plans').then(({ data }) => setPlans(data.plans || [])).catch(() => toast.error('Failed to load plans')).finally(() => setLoading(false))
  }, [])

  const handleSaved = (updated) => {
    setPlans((prev) => prev.map((p) => p._id === updated._id ? updated : p))
  }

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
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>OFFERS</h1>
              <p className="text-gray-400 text-sm">Manage promotional offers for each membership plan</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : plans.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <FaTag className="text-4xl text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No plans found. Create a plan first from the Plans page.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {plans.map((plan, i) => (
                  <OfferCard key={plan._id} plan={plan} onSaved={handleSaved} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
