import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaDatabase, FaTimes, FaBars, FaUsers, FaUserTie, FaCrown,
  FaHome, FaSignOutAlt, FaMapMarkerAlt, FaDumbbell, FaImages,
  FaAppleAlt, FaExchangeAlt, FaGlobe, FaFileAlt, FaTachometerAlt,
  FaQuoteLeft, FaRunning, FaEdit, FaLink, FaPalette,
  FaPlus, FaTrash, FaToggleOn, FaToggleOff, FaSave, FaSearch, FaTag,
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

const TYPE_TABS = [
  { id: 'plan', label: 'Plan', description: 'Plan duration & package types (Monthly, Quarterly…)' },
  { id: 'workout', label: 'Workout', description: 'Workout categories (Strength, Cardio, HIIT…)' },
  { id: 'diet', label: 'Diet Plan', description: 'Diet plan categories (Weight Loss, Keto…)' },
]

const EMPTY_FORM = { code: '', labelEn: '', description: '', isActive: true }

export default function ManageMasterData() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024)
  const [activeType, setActiveType] = useState('plan')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)   // null | 'create' | 'edit'
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => { fetchItems() }, [activeType])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/v1/admin/master?type=${activeType}`)
      setItems(data.data || [])
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setFormErrors({})
    setEditItem(null)
    setModal('create')
  }

  const openEdit = (item) => {
    setForm({
      code: item.code,
      labelEn: item.label?.en || '',
      description: item.description || '',
      isActive: item.isActive,
    })
    setFormErrors({})
    setEditItem(item)
    setModal('edit')
  }

  const closeModal = () => { setModal(null); setEditItem(null) }

  const validate = () => {
    const e = {}
    if (!form.code.trim()) e.code = 'Code is required'
    else if (!/^[A-Za-z0-9_-]+$/.test(form.code.trim())) e.code = 'Only letters, numbers, _ and - allowed'
    if (!form.labelEn.trim()) e.labelEn = 'Label is required'
    return e
  }

  const handleSave = async () => {
    const errs = validate()
    setFormErrors(errs)
    if (Object.keys(errs).length) return

    setSaving(true)
    try {
      const payload = {
        type: activeType,
        code: form.code.trim().toUpperCase(),
        label: { en: form.labelEn.trim() },
        description: form.description.trim(),
        isActive: form.isActive,
      }

      if (modal === 'create') {
        const { data } = await api.post('/v1/admin/master', payload)
        setItems(prev => [...prev, data.data].sort((a, b) => a.code.localeCompare(b.code)))
        toast.success('Item created successfully')
      } else {
        const { data } = await api.put(`/v1/admin/master/${editItem._id}`, payload)
        setItems(prev => prev.map(i => i._id === editItem._id ? data.data : i))
        toast.success('Item updated successfully')
      }
      closeModal()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (item) => {
    try {
      const { data } = await api.put(`/v1/admin/master/${item._id}`, {
        ...item, label: item.label, isActive: !item.isActive,
      })
      setItems(prev => prev.map(i => i._id === item._id ? data.data : i))
      toast.success(`${data.data.isActive ? 'Activated' : 'Deactivated'} successfully`)
    } catch {
      toast.error('Update failed')
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/v1/admin/master/${deleteConfirm._id}`)
      setItems(prev => prev.filter(i => i._id !== deleteConfirm._id))
      toast.success('Deleted successfully')
      setDeleteConfirm(null)
    } catch {
      toast.error('Delete failed')
    }
  }

  const filtered = items.filter(item => {
    const q = search.toLowerCase()
    return !q || item.code.toLowerCase().includes(q) || (item.label?.en || '').toLowerCase().includes(q)
  })

  const currentTab = TYPE_TABS.find(t => t.id === activeType)

  return (
    <div className="h-screen bg-dark flex overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto flex-shrink-0 flex flex-col bg-dark-100 border-r border-dark-400 transition-all duration-300 ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64 lg:translate-x-0 lg:w-16'}`}>
        <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-6' : 'justify-center px-3'} py-5 border-b border-dark-400`}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <FaDatabase className="text-white text-sm" />
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

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-dark-100 border-b border-dark-400 px-4 md:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors">
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {/* Title row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>MASTER DATA</h1>
              <p className="text-gray-400 text-sm">Manage dropdown options used across the entire application</p>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={openCreate}
              className="btn-primary text-sm py-2.5 flex items-center gap-2 flex-shrink-0">
              <FaPlus className="text-xs" /> Add New
            </motion.button>
          </div>

          {/* Type tabs */}
          <div className="flex gap-1 bg-dark-200 border border-dark-400 rounded-xl p-1 w-fit flex-wrap">
            {TYPE_TABS.map(tab => (
              <button key={tab.id} onClick={() => { setActiveType(tab.id); setSearch('') }}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeType === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab description + search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-gray-500 text-xs">{currentTab?.description}</p>
            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by code or label…"
                className="w-full bg-dark-200 border border-dark-400 rounded-xl pl-8 pr-3 py-2 text-white text-xs focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 bg-dark-200 border border-dark-400 rounded-2xl flex items-center justify-center mx-auto">
                <FaDatabase className="text-gray-600 text-2xl" />
              </div>
              <p className="text-gray-400 font-medium">No items found</p>
              <p className="text-gray-600 text-sm">
                {search ? 'Try a different search term' : `Click "Add New" to create the first ${currentTab?.label} item`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {filtered.map((item, idx) => (
                  <motion.div key={item._id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.03 }}
                    className={`bg-dark-200 border rounded-2xl overflow-hidden transition-all duration-200 ${item.isActive ? 'border-dark-400 hover:border-primary/30' : 'border-dark-400 opacity-60'}`}>
                    {/* Card header */}
                    <div className="px-4 py-3 border-b border-dark-400 flex items-center justify-between gap-2">
                      <span className="text-xs font-black font-mono bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-lg tracking-wider">
                        {item.code}
                      </span>
                      <button onClick={() => handleToggle(item)}
                        className={`text-lg transition-colors flex-shrink-0 ${item.isActive ? 'text-green-400 hover:text-green-300' : 'text-gray-600 hover:text-gray-400'}`}
                        title={item.isActive ? 'Deactivate' : 'Activate'}>
                        {item.isActive ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>

                    {/* Card body */}
                    <div className="p-4 space-y-2">
                      <div>
                        <div className="text-white font-semibold text-sm">{item.label?.en || '—'}</div>
                        {item.description && (
                          <p className="text-gray-500 text-xs mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.isActive ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-500'}`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* Card actions */}
                    <div className="px-4 pb-4 flex gap-2">
                      <button onClick={() => openEdit(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-dark-300 hover:bg-primary/15 hover:text-primary text-gray-400 text-xs font-medium transition-all border border-dark-500 hover:border-primary/30">
                        <FaEdit className="text-[10px]" /> Edit
                      </button>
                      <button onClick={() => setDeleteConfirm(item)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-dark-300 hover:bg-red-500/10 hover:text-red-400 text-gray-500 text-xs transition-all border border-dark-500 hover:border-red-500/30">
                        <FaTrash className="text-[10px]" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Count footer */}
          {!loading && items.length > 0 && (
            <p className="text-gray-600 text-xs text-right">
              {filtered.length} of {items.length} items · {items.filter(i => i.isActive).length} active
            </p>
          )}
        </main>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-dark-200 border border-dark-400 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-dark-400">
                <div>
                  <h2 className="text-white font-black text-base" style={{ fontFamily: 'Oswald' }}>
                    {modal === 'create' ? 'ADD NEW ITEM' : 'EDIT ITEM'}
                  </h2>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Type: <span className="text-primary font-semibold capitalize">{activeType}</span>
                  </p>
                </div>
                <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-dark-300 transition-all">
                  <FaTimes className="text-sm" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6 space-y-4">
                {/* Code */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
                    Code <span className="text-red-400">*</span>
                  </label>
                  <input value={form.code}
                    onChange={e => { setForm(f => ({ ...f, code: e.target.value })); setFormErrors(er => ({ ...er, code: '' })) }}
                    placeholder="e.g. MONTHLY"
                    className={`input-field text-sm font-mono uppercase ${formErrors.code ? 'border-red-500' : ''}`} />
                  {formErrors.code && <p className="text-red-400 text-xs mt-1">{formErrors.code}</p>}
                  <p className="text-gray-600 text-xs mt-1">Used as the dropdown value. Auto-converted to uppercase.</p>
                </div>

                {/* Label */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
                    Label (Display Name) <span className="text-red-400">*</span>
                  </label>
                  <input value={form.labelEn}
                    onChange={e => { setForm(f => ({ ...f, labelEn: e.target.value })); setFormErrors(er => ({ ...er, labelEn: '' })) }}
                    placeholder="e.g. Monthly"
                    className={`input-field text-sm ${formErrors.labelEn ? 'border-red-500' : ''}`} />
                  {formErrors.labelEn && <p className="text-red-400 text-xs mt-1">{formErrors.labelEn}</p>}
                  <p className="text-gray-600 text-xs mt-1">Shown to users in dropdowns and forms.</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Description</label>
                  <textarea value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Optional short description…"
                    rows={2}
                    className="w-full bg-dark-300 border border-dark-400 focus:border-primary/50 rounded-xl px-3 py-2 text-white text-sm resize-none outline-none transition-colors" />
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between py-2 px-3 bg-dark-300 rounded-xl">
                  <div>
                    <div className="text-white text-sm font-medium">Active</div>
                    <div className="text-gray-500 text-xs">Inactive items won't appear in dropdowns</div>
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                    className={`text-2xl transition-colors ${form.isActive ? 'text-green-400' : 'text-gray-600'}`}>
                    {form.isActive ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>
              </div>

              {/* Modal footer */}
              <div className="px-6 pb-6 flex gap-3">
                <button onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl border border-dark-500 text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-sm font-medium">
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSave} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 btn-primary text-sm py-2.5 disabled:opacity-60">
                  {saving
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <FaSave className="text-xs" />}
                  {saving ? 'Saving…' : modal === 'create' ? 'Create Item' : 'Save Changes'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-dark-200 border border-dark-400 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto">
                <FaTrash className="text-red-400 text-xl" />
              </div>
              <div>
                <h3 className="text-white font-black text-lg" style={{ fontFamily: 'Oswald' }}>DELETE ITEM</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Are you sure you want to delete{' '}
                  <span className="text-white font-semibold">{deleteConfirm.label?.en || deleteConfirm.code}</span>?
                </p>
                <p className="text-gray-600 text-xs mt-1">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-dark-500 text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  Cancel
                </button>
                <button onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors">
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
