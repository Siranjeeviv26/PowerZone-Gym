import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaQuoteLeft, FaPlus, FaEdit, FaTrash, FaTimes, FaBars, FaUsers,
  FaUserTie, FaCrown, FaHome, FaSignOutAlt, FaMapMarkerAlt,
  FaDumbbell, FaImages, FaAppleAlt, FaExchangeAlt, FaGlobe,
  FaFileAlt, FaStar, FaTrophy, FaTachometerAlt, FaToggleOn, FaToggleOff, FaRunning, FaLink,
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

const EMPTY = { name: '', role: '', image: '', rating: 5, text: '', result: '', featured: false, isActive: true }

export default function ManageTestimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => { fetchTestimonials() }, [])

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/testimonials/admin/all')
      setTestimonials(data.testimonials || [])
    } catch {
      toast.error('Failed to load testimonials')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setSelected(null)
    setForm(EMPTY)
    setImageFile(null)
    setImagePreview('')
    setModal('form')
  }

  const openEdit = (t) => {
    setSelected(t)
    setForm({
      name: t.name || '',
      role: t.role || '',
      image: t.image || '',
      rating: t.rating || 5,
      text: t.text || '',
      result: t.result || '',
      featured: t.featured || false,
      isActive: t.isActive !== false,
    })
    setImageFile(null)
    setImagePreview(t.image || '')
    setModal('form')
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required')
    if (!form.text.trim()) return toast.error('Testimonial text is required')

    setSaving(true)
    try {
      const payload = new FormData()
      payload.append('name', form.name)
      payload.append('role', form.role)
      payload.append('rating', form.rating)
      payload.append('text', form.text)
      payload.append('result', form.result)
      payload.append('featured', form.featured)
      payload.append('isActive', form.isActive)
      if (imageFile) {
        payload.append('image', imageFile)
      } else if (form.image) {
        payload.append('image', form.image)
      }

      if (selected) {
        await api.put(`/testimonials/${selected._id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Testimonial updated')
      } else {
        await api.post('/testimonials', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Testimonial added')
      }
      setModal(null)
      fetchTestimonials()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/testimonials/${deleteTarget._id}`)
      toast.success('Deleted')
      setDeleteTarget(null)
      fetchTestimonials()
    } catch {
      toast.error('Delete failed')
    }
  }

  const toggleActive = async (t) => {
    try {
      await api.put(`/testimonials/${t._id}`, { ...t, isActive: !t.isActive })
      setTestimonials((prev) => prev.map((x) => x._id === t._id ? { ...x, isActive: !x.isActive } : x))
    } catch {
      toast.error('Failed to update')
    }
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

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
              className={`flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl mb-1 text-sm font-medium transition-all ${
                pathname === item.to ? 'bg-primary/15 text-primary border border-primary/20' : 'text-gray-400 hover:bg-dark-300 hover:text-white'
              }`}>
              <item.icon className="text-base flex-shrink-0" />
              {sidebarOpen && item.label}
            </Link>
          ))}
        </nav>
        <div className="px-2 pb-4">
          <button onClick={() => { dispatch(logout()); navigate('/') }}
            className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm`}>
            <FaSignOutAlt className="flex-shrink-0" />
            {sidebarOpen && 'Logout'}
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
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
            <span className="text-gray-300 text-sm hidden sm:block">Admin</span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>TESTIMONIALS</h1>
                <p className="text-gray-400 text-sm mt-0.5">Manage member reviews shown on the home page</p>
              </div>
              <button onClick={openAdd}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
                <FaPlus className="text-xs" /> Add Testimonial
              </button>
            </div>

            {/* Cards */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="glass-card p-5 animate-pulse">
                    <div className="h-4 bg-dark-400 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-dark-400 rounded mb-2" />
                    <div className="h-3 bg-dark-400 rounded w-5/6 mb-4" />
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-dark-400 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-dark-400 rounded w-24" />
                        <div className="h-2 bg-dark-400 rounded w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : testimonials.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <FaQuoteLeft className="text-4xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No testimonials yet. Add one to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {testimonials.map((t, i) => (
                  <motion.div key={t._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className={`glass-card p-5 relative ${!t.isActive ? 'opacity-50' : ''}`}>
                    {t.featured && (
                      <span className="absolute top-3 right-3 text-[10px] bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">FEATURED</span>
                    )}

                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <FaStar key={j} className={`text-xs ${j < t.rating ? 'text-yellow-400' : 'text-gray-600'}`} />
                      ))}
                    </div>

                    <FaQuoteLeft className="text-primary/15 text-2xl absolute top-4 left-4 pointer-events-none" />

                    <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">"{t.text}"</p>

                    {t.result && (
                      <div className="flex items-center gap-1.5 mb-4 text-xs text-primary">
                        <FaTrophy className="text-[10px]" />
                        <span className="font-medium">{t.result}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-dark-400">
                      <div className="flex items-center gap-2">
                        {t.image ? (
                          <img src={t.image} alt={t.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                            {t.name?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="text-white text-sm font-semibold">{t.name}</div>
                          {t.role && <div className="text-gray-500 text-xs">{t.role}</div>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleActive(t)} className="text-gray-400 hover:text-white transition-colors">
                          {t.isActive ? <FaToggleOn className="text-green-400 text-lg" /> : <FaToggleOff className="text-gray-600 text-lg" />}
                        </button>
                        <button onClick={() => openEdit(t)} className="text-blue-400 hover:text-blue-300 transition-colors">
                          <FaEdit className="text-sm" />
                        </button>
                        <button onClick={() => setDeleteTarget(t)} className="text-red-400 hover:text-red-300 transition-colors">
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal === 'form' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-100 border border-dark-400 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>
                  {selected ? 'EDIT TESTIMONIAL' : 'ADD TESTIMONIAL'}
                </h2>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>

              <div className="space-y-4">
                {/* Image upload */}
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-dark-300 flex items-center justify-center flex-shrink-0">
                      {imagePreview ? (
                        <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-500 text-lg font-bold">{form.name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input type="file" accept="image/*" onChange={handleImageChange}
                        className="block w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:text-xs file:font-medium hover:file:bg-primary/20 cursor-pointer" />
                      <p className="text-gray-600 text-[10px] mt-1">Or paste URL below</p>
                      <input value={form.image} onChange={(e) => { set('image', e.target.value); if (!imageFile) setImagePreview(e.target.value) }}
                        placeholder="https://..."
                        className="mt-1.5 w-full bg-dark-300 border border-dark-500 text-white text-xs rounded-lg px-3 py-1.5 placeholder-gray-600 focus:outline-none focus:border-primary/50" />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Name *</label>
                  <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Member name"
                    className="w-full bg-dark-300 border border-dark-500 text-white text-sm rounded-xl px-4 py-2.5 placeholder-gray-600 focus:outline-none focus:border-primary/50" />
                </div>

                {/* Role */}
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Occupation / Role</label>
                  <input value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="e.g. Software Engineer"
                    className="w-full bg-dark-300 border border-dark-500 text-white text-sm rounded-xl px-4 py-2.5 placeholder-gray-600 focus:outline-none focus:border-primary/50" />
                </div>

                {/* Rating */}
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => set('rating', n)}>
                        <FaStar className={`text-xl transition-colors ${n <= form.rating ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400/50'}`} />
                      </button>
                    ))}
                    <span className="text-gray-400 text-sm ml-2">{form.rating}/5</span>
                  </div>
                </div>

                {/* Text */}
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Testimonial Text *</label>
                  <textarea value={form.text} onChange={(e) => set('text', e.target.value)} rows={4}
                    placeholder="What did the member say about PowerZone?"
                    className="w-full bg-dark-300 border border-dark-500 text-white text-sm rounded-xl px-4 py-2.5 placeholder-gray-600 focus:outline-none focus:border-primary/50 resize-none" />
                </div>

                {/* Result */}
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Result / Achievement</label>
                  <input value={form.result} onChange={(e) => set('result', e.target.value)} placeholder="e.g. Lost 25kg in 6 months"
                    className="w-full bg-dark-300 border border-dark-500 text-white text-sm rounded-xl px-4 py-2.5 placeholder-gray-600 focus:outline-none focus:border-primary/50" />
                </div>

                {/* Featured & Active toggles */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)}
                      className="w-4 h-4 rounded accent-primary" />
                    <span className="text-gray-300 text-sm">Featured (large card)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)}
                      className="w-4 h-4 rounded accent-primary" />
                    <span className="text-gray-300 text-sm">Show on site</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-dark-400 text-gray-400 hover:text-white text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : selected ? 'Update' : 'Add'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteTarget(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-dark-100 border border-dark-400 rounded-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}>
              <h3 className="text-white font-black text-lg mb-2" style={{ fontFamily: 'Oswald' }}>DELETE TESTIMONIAL</h3>
              <p className="text-gray-400 text-sm mb-6">Remove "{deleteTarget.name}"'s testimonial? This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-dark-400 text-gray-400 hover:text-white text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
