import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaTimes, FaUsers, FaUserTie, FaCrown,
  FaHome, FaSignOutAlt, FaBars, FaDumbbell, FaImages, FaAppleAlt,
  FaEye, FaPhone, FaUser, FaExchangeAlt, FaGlobe, FaFileAlt, FaTachometerAlt, FaQuoteLeft, FaRunning, FaLink,
  FaPalette,
  FaDatabase, FaTag,
} from 'react-icons/fa'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { validate, required, minLen, maxLen, phone, fieldClass } from '../../utils/validate'
import PhoneInput from '../../components/shared/PhoneInput'

const Err = ({ msg }) => msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null

const BRANCH_RULES = {
  name: [required('Branch name'), minLen(2, 'Branch name'), maxLen(50, 'Branch name')],
  location: [required('Location'), minLen(2, 'Location')],
  phone: [phone()],
}

const EMPTY = { name: '', location: '', address: '', phone: '', manager: '' }

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

export default function ManageBranches() {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => { fetchBranches() }, [])

  const fetchBranches = async () => {
    try {
      const { data } = await api.get('/branches')
      setBranches(data.branches || [])
    } catch {
      toast.error('Failed to load branches')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => { setForm(EMPTY); setSelected(null); setFormErrors({}); setModal('add') }
  const openEdit = (b) => {
    setSelected(b)
    setForm({ name: b.name, location: b.location, address: b.address || '', phone: b.phone || '', manager: b.manager || '' })
    setFormErrors({})
    setModal('edit')
  }
  const closeModal = () => { setModal(null); setSelected(null); setFormErrors({}) }

  const handleSave = async (e) => {
    e.preventDefault()
    const errs = validate(form, BRANCH_RULES)
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setSaving(true)
    try {
      if (modal === 'add') {
        const { data } = await api.post('/branches', form)
        setBranches((prev) => [...prev, data.branch])
        toast.success('Branch created!')
      } else {
        const { data } = await api.put(`/branches/${selected._id}`, form)
        setBranches((prev) => prev.map((b) => (b._id === selected._id ? data.branch : b)))
        toast.success('Branch updated!')
      }
      closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/branches/${deleteTarget._id}`)
      setBranches((prev) => prev.filter((b) => b._id !== deleteTarget._id))
      toast.success('Branch removed')
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to remove branch')
    }
  }

  const f = (field, val) => setForm((prev) => ({ ...prev, [field]: val }))

  return (
    <div className="h-screen bg-dark flex overflow-hidden">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-dark-100 border-r border-dark-400 transition-all duration-300 flex-shrink-0 flex flex-col`}>
        <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-6' : 'justify-center px-3'} py-5 border-b border-dark-400`}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <FaMapMarkerAlt className="text-white text-sm" />
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>MANAGE BRANCHES</h1>
                <p className="text-gray-400 text-sm">{branches.length} branches active</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} onClick={openAdd} className="btn-primary text-sm py-2.5 flex items-center gap-2">
                <FaPlus className="text-xs" /> Add Branch
              </motion.button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : branches.length === 0 ? (
              <div className="glass-card p-12 text-center text-gray-500">
                <FaMapMarkerAlt className="text-4xl mx-auto mb-3 opacity-30" />
                <p>No branches created yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {branches.map((branch, i) => (
                  <motion.div key={branch._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card p-5 hover:border-primary/30 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaMapMarkerAlt className="text-primary" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setSelected(branch); setModal('view') }} className="w-7 h-7 bg-green-500/10 hover:bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 transition-colors" title="View"><FaEye className="text-xs" /></button>
                        <button onClick={() => openEdit(branch)} className="w-7 h-7 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 transition-colors" title="Edit"><FaEdit className="text-xs" /></button>
                        <button onClick={() => setDeleteTarget(branch)} className="w-7 h-7 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 transition-colors" title="Delete"><FaTrash className="text-xs" /></button>
                      </div>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{branch.name}</h3>
                    <p className="text-primary text-sm mb-3">{branch.location}</p>
                    <div className="space-y-1.5 text-xs text-gray-400">
                      {branch.address && <div className="flex items-start gap-2"><FaMapMarkerAlt className="text-primary mt-0.5 flex-shrink-0" />{branch.address}</div>}
                      {branch.phone && <div className="flex items-center gap-2"><FaPhone className="text-primary flex-shrink-0" />{branch.phone}</div>}
                      {branch.manager && <div className="flex items-center gap-2"><FaUser className="text-primary flex-shrink-0" />Manager: {branch.manager}</div>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {(modal === 'add' || modal === 'edit') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>{modal === 'add' ? 'ADD BRANCH' : 'EDIT BRANCH'}</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Branch Name *</label>
                    <input value={form.name} onChange={(e) => f('name', e.target.value)} placeholder="e.g. PowerZone North" className={fieldClass(formErrors, 'name', 'input-field text-sm')} />
                    <Err msg={formErrors.name} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Location *</label>
                    <input value={form.location} onChange={(e) => f('location', e.target.value)} placeholder="e.g. Andheri, Mumbai" className={fieldClass(formErrors, 'location', 'input-field text-sm')} />
                    <Err msg={formErrors.location} />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Full Address</label>
                  <input value={form.address} onChange={(e) => f('address', e.target.value)} placeholder="Street, City, State" className="input-field text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Phone</label>
                    <PhoneInput
                      value={form.phone}
                      onChange={(v) => f('phone', v)}
                      onBlur={() => {
                        const errs = validate(form, BRANCH_RULES)
                        setFormErrors((p) => ({ ...p, phone: errs.phone }))
                      }}
                      error={formErrors.phone}
                    />
                    <Err msg={formErrors.phone} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Manager Name</label>
                    <input value={form.manager} onChange={(e) => f('manager', e.target.value)} placeholder="Branch manager" className="input-field text-sm" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-dark-500 text-gray-400 text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">{saving ? 'Saving...' : modal === 'add' ? 'Add Branch' : 'Save Changes'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {modal === 'view' && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>BRANCH DETAILS</h2>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <div className="flex items-center gap-4 mb-6 p-4 bg-dark-300 rounded-xl">
                <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="text-primary text-2xl" />
                </div>
                <div>
                  <h3 className="text-white font-black text-xl" style={{ fontFamily: 'Oswald' }}>{selected.name}</h3>
                  <p className="text-primary text-sm">{selected.location}</p>
                </div>
              </div>
              <div className="space-y-3">
                {selected.address && (
                  <div className="flex items-start gap-3 p-3 bg-dark-300 rounded-xl">
                    <FaMapMarkerAlt className="text-primary mt-0.5 flex-shrink-0" />
                    <div><p className="text-gray-500 text-xs mb-0.5">Full Address</p><p className="text-gray-200 text-sm">{selected.address}</p></div>
                  </div>
                )}
                {selected.phone && (
                  <div className="flex items-center gap-3 p-3 bg-dark-300 rounded-xl">
                    <FaPhone className="text-primary flex-shrink-0" />
                    <div><p className="text-gray-500 text-xs mb-0.5">Phone</p><p className="text-gray-200 text-sm">{selected.phone}</p></div>
                  </div>
                )}
                {selected.manager && (
                  <div className="flex items-center gap-3 p-3 bg-dark-300 rounded-xl">
                    <FaUser className="text-primary flex-shrink-0" />
                    <div><p className="text-gray-500 text-xs mb-0.5">Branch Manager</p><p className="text-gray-200 text-sm">{selected.manager}</p></div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-dark-300 rounded-xl">
                  <FaExchangeAlt className="text-yellow-400 flex-shrink-0" />
                  <div><p className="text-gray-500 text-xs mb-0.5">Transfer Fee</p><p className="text-yellow-400 text-sm font-bold">₹{(selected.transferFee || 0).toLocaleString()}</p></div>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => { setModal(null); openEdit(selected) }} className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2"><FaEdit className="text-xs" /> Edit Branch</button>
                <button onClick={() => setModal(null)} className="px-6 bg-dark-300 hover:bg-dark-400 text-gray-300 rounded-full transition-colors text-sm">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-sm p-6 text-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><FaTrash className="text-red-400" /></div>
              <h3 className="text-white font-bold mb-2">Remove Branch</h3>
              <p className="text-gray-400 text-sm mb-6">Remove <span className="text-white font-medium">{deleteTarget.name}</span>? Members assigned here will lose their branch assignment.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-dark-500 text-gray-400 text-sm">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all">Remove</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
