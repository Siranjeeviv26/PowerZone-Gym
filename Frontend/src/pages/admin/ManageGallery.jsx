import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaImages, FaPlus, FaTrash, FaTimes, FaBars, FaUsers,
  FaUserTie, FaCrown, FaHome, FaSignOutAlt,
  FaMapMarkerAlt, FaAppleAlt, FaDumbbell, FaToggleOn, FaToggleOff, FaEye, FaTag,
  FaExchangeAlt, FaGlobe, FaFileAlt, FaTachometerAlt, FaQuoteLeft, FaRunning, FaEdit, FaLink,
  FaPalette,
  FaDatabase,
} from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { validate, required, minLen, fieldClass } from '../../utils/validate'

const Err = ({ msg }) => msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null

const RULES = {
  title: [required('Title'), minLen(2, 'Title')],
  category: [required('Category')],
  imageUrl: [required('Image URL')],
}

const CATEGORIES = ['Gym Floor', 'Classes', 'Trainers', 'Members', 'Events']

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

const EMPTY = { title: '', category: '', imageUrl: '', showOnSite: true }

export default function ManageGallery() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024)
  const [images, setImages] = useState([])
  const [imgErr, setImgErr] = useState({})
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [viewImg, setViewImg] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const fetchImages = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/gallery?admin=true')
      setImages(data.images || [])
    } catch {
      toast.error('Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchImages() }, [])

  const openAdd = () => { setForm(EMPTY); setFormErrors({}); setModal(true) }
  const closeModal = () => { setModal(false); setFormErrors({}) }

  const handleSave = async () => {
    const errs = validate(form, RULES)
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    try {
      setSaving(true)
      const { data } = await api.post('/gallery', {
        title: form.title.trim(),
        category: form.category,
        imageUrl: form.imageUrl.trim(),
        showOnSite: form.showOnSite,
      })
      setImages((prev) => [data.image, ...prev])
      toast.success('Image added')
      closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const toggleShowOnSite = async (img) => {
    try {
      const { data } = await api.put(`/gallery/${img._id}`, { showOnSite: !img.showOnSite })
      setImages((prev) => prev.map((item) => (item._id === img._id ? data.image : item)))
      toast.success(data.image.showOnSite ? 'Now visible on site' : 'Hidden from site')
    } catch {
      toast.error('Toggle failed')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/gallery/${id}`)
      setImages((prev) => prev.filter((img) => img._id !== id))
      toast.success('Image removed')
      setDeleteId(null)
    } catch {
      toast.error('Delete failed')
    }
  }

  const fc = (field) => fieldClass(formErrors, field, 'input-field text-sm')

  return (
    <div className="h-screen bg-dark flex overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto flex-shrink-0 flex flex-col bg-dark-100 border-r border-dark-400 transition-all duration-300 ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64 lg:translate-x-0 lg:w-16'}`}>
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
              onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
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
        <header className="bg-dark-100 border-b border-dark-400 px-4 md:px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>GALLERY</h1>
                <p className="text-gray-400 text-sm">Manage images shown on the site gallery</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} onClick={openAdd} className="btn-primary text-sm py-2.5 flex items-center gap-2">
                <FaPlus className="text-xs" /> Add Image
              </motion.button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : images.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <FaImages className="text-4xl text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No images yet. Add your first gallery image.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {images.map((img, i) => (
                  <motion.div
                    key={img._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className={`rounded-xl overflow-hidden bg-dark-200 border border-dark-400 hover:border-primary/30 transition-all duration-200 ${!img.showOnSite ? 'opacity-60' : ''}`}
                  >
                    <div className="aspect-square relative">
                      {imgErr[img._id] ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-dark-400 gap-2">
                          <FaImages className="text-gray-600 text-3xl" />
                          <span className="text-gray-600 text-xs">No Preview</span>
                        </div>
                      ) : (
                        <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" onError={() => setImgErr((p) => ({ ...p, [img._id]: true }))} />
                      )}
                      <span className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-semibold ${img.showOnSite ? 'bg-green-500/80 text-white' : 'bg-black/60 text-gray-400'}`}>
                        {img.showOnSite ? 'Live' : 'Hidden'}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-white font-semibold text-sm line-clamp-1 mb-0.5">{img.title}</p>
                      <p className="text-gray-500 text-xs mb-3">{img.category}</p>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleShowOnSite(img)}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-colors ${
                            img.showOnSite ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25' : 'bg-dark-400 text-gray-400 hover:bg-dark-300'
                          }`}
                        >
                          {img.showOnSite ? <FaToggleOn /> : <FaToggleOff />}
                          {img.showOnSite ? 'Visible' : 'Hidden'}
                        </button>
                        <button onClick={() => setViewImg(img)} className="ml-auto bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 p-1.5 rounded-full transition-colors">
                          <FaEye className="text-xs" />
                        </button>
                        <button onClick={() => setDeleteId(img._id)} className="bg-red-500/15 hover:bg-red-500/25 text-red-400 p-1.5 rounded-full transition-colors">
                          <FaTrash className="text-xs" />
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

      {/* View Image Modal */}
      <AnimatePresence>
        {viewImg && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setViewImg(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-dark-200 border border-dark-400 rounded-2xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {imgErr[viewImg._id] ? (
                  <div className="w-full h-48 flex flex-col items-center justify-center bg-dark-400 gap-2">
                    <FaImages className="text-gray-600 text-4xl" />
                    <span className="text-gray-600 text-sm">No Preview Available</span>
                  </div>
                ) : (
                  <img
                    src={viewImg.imageUrl}
                    alt={viewImg.title}
                    className="w-full max-h-72 object-cover"
                    onError={() => setImgErr((p) => ({ ...p, [viewImg._id]: true }))}
                  />
                )}
                <button
                  onClick={() => setViewImg(null)}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-1">{viewImg.title}</h3>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-400 bg-dark-400 px-2 py-1 rounded">
                    <FaTag className="text-primary text-xs" /> {viewImg.category}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${viewImg.showOnSite ? 'bg-green-500/15 text-green-400' : 'bg-dark-400 text-gray-500'}`}>
                    {viewImg.showOnSite ? 'Visible on Site' : 'Hidden from Site'}
                  </span>
                  {viewImg.createdAt && (
                    <span className="text-xs text-gray-500">Added {new Date(viewImg.createdAt).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { toggleShowOnSite(viewImg); setViewImg(prev => ({ ...prev, showOnSite: !prev.showOnSite })) }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm transition-colors ${
                      viewImg.showOnSite ? 'bg-green-500/15 hover:bg-green-500/25 text-green-400' : 'bg-dark-400 hover:bg-dark-300 text-gray-400'
                    }`}
                  >
                    {viewImg.showOnSite ? <FaToggleOn /> : <FaToggleOff />}
                    {viewImg.showOnSite ? 'Visible' : 'Hidden'}
                  </button>
                  <button
                    onClick={() => setViewImg(null)}
                    className="px-6 bg-dark-300 hover:bg-dark-400 text-gray-300 py-2.5 rounded-full transition-colors text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-dark-200 border border-dark-400 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>ADD GALLERY IMAGE</h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-white"><FaTimes /></button>
              </div>

              <form className="space-y-4" noValidate onSubmit={(e) => { e.preventDefault(); handleSave() }}>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Title <span className="text-red-400">*</span></label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Main Workout Area" className={fc('title')} />
                  <Err msg={formErrors.title} />
                </div>

                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Category <span className="text-red-400">*</span></label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={fc('category')}>
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <Err msg={formErrors.category} />
                </div>

                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Image URL <span className="text-red-400">*</span></label>
                  <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://images.unsplash.com/..." className={fc('imageUrl')} />
                  <Err msg={formErrors.imageUrl} />
                  {form.imageUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden h-28">
                      <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="gShowOnSite"
                    checked={form.showOnSite}
                    onChange={(e) => setForm({ ...form, showOnSite: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <label htmlFor="gShowOnSite" className="text-gray-400 text-sm cursor-pointer">Show on public site</label>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="submit"
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 btn-primary py-3 disabled:opacity-60"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Adding...
                      </span>
                    ) : 'Add Image'}
                  </motion.button>
                  <button type="button" onClick={closeModal} className="px-6 bg-dark-300 hover:bg-dark-400 text-gray-300 rounded-full transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-dark-200 border border-dark-400 rounded-2xl p-6 w-full max-w-sm text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <FaTrash className="text-red-400 text-3xl mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Remove Image?</h3>
              <p className="text-gray-400 text-sm mb-6">This image will be removed from the gallery.</p>
              <div className="flex gap-3">
                <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-full font-semibold transition-colors text-sm">Remove</button>
                <button onClick={() => setDeleteId(null)} className="flex-1 bg-dark-300 hover:bg-dark-400 text-gray-300 py-2.5 rounded-full transition-colors text-sm">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
