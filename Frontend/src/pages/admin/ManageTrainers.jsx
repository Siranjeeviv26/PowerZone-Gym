import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPlus, FaEdit, FaTrash, FaStar, FaUsers, FaDumbbell, FaUserTie, FaCrown, FaHome, FaSignOutAlt, FaTimes, FaBars, FaMapMarkerAlt, FaImages, FaAppleAlt, FaEye, FaEnvelope, FaPhone, FaInstagram, FaLinkedin, FaTwitter, FaExchangeAlt, FaGlobe, FaFileAlt, FaTachometerAlt, FaQuoteLeft, FaSearch, FaRunning, FaLink, FaPalette, FaDatabase, FaTag } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { validate, required, email, minLen, maxLen, phone, nonNegative, fieldClass } from '../../utils/validate'
import PhoneInput from '../../components/shared/PhoneInput'

const Err = ({ msg }) => msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null

const TRAINER_RULES = (isEdit) => ({
  name: [required('Name'), minLen(2, 'Name'), maxLen(50, 'Name')],
  email: [required('Email'), email()],
  speciality: [required('Speciality'), minLen(2, 'Speciality')],
  phone: [phone()],
  experience: [nonNegative('Experience')],
  ...(isEdit ? {} : { password: [minLen(6, 'Password')] }),
})

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

const EMPTY = { name: '', email: '', password: '', phone: '', speciality: '', bio: '', experience: '', branch: '' }

export default function ManageTrainers() {
  const [trainers, setTrainers] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 8

  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    fetchTrainers()
    fetchBranches()
  }, [])

  const fetchTrainers = async () => {
    try {
      const { data } = await api.get('/trainers')
      setTrainers(data.trainers)
    } catch {
      toast.error('Failed to load trainers')
    } finally {
      setLoading(false)
    }
  }

  const fetchBranches = async () => {
    try {
      const { data } = await api.get('/branches')
      setBranches(data.branches)
    } catch {}
  }

  const openAdd = () => { setForm(EMPTY); setSelected(null); setFormErrors({}); setModal('add') }
  const openEdit = (t) => {
    setSelected(t)
    setForm({ name: t.name, email: t.email, password: '', phone: t.phone || '', speciality: t.speciality, bio: t.bio || '', experience: t.experience || '', branch: t.branch?._id || '' })
    setFormErrors({})
    setModal('edit')
  }
  const closeModal = () => { setModal(null); setSelected(null); setFormErrors({}) }

  const handleSave = async (e) => {
    e.preventDefault()
    const isEdit = modal === 'edit'
    const errs = validate(form, TRAINER_RULES(isEdit))
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setFormErrors({})
    setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.branch) delete payload.branch
      if (modal === 'add') {
        const { data } = await api.post('/trainers', payload)
        setTrainers((prev) => [data.trainer, ...prev])
        const pwd = form.password || 'trainer123'
        toast.success(`Trainer added! Login: ${form.email} / ${pwd}`, { duration: 6000 })
      } else {
        const { data } = await api.put(`/trainers/${selected._id}`, payload)
        setTrainers((prev) => prev.map((t) => t._id === selected._id ? data.trainer : t))
        toast.success('Trainer updated!')
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
      await api.delete(`/trainers/${deleteTarget._id}`)
      setTrainers((prev) => prev.filter((t) => t._id !== deleteTarget._id))
      toast.success('Trainer removed')
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to remove trainer')
    }
  }

  const f = (field, val) => setForm((prev) => ({ ...prev, [field]: val }))

  return (
    <div className="h-screen bg-dark flex overflow-hidden">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-dark-100 border-r border-dark-400 transition-all duration-300 flex-shrink-0 flex flex-col`}>
        <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-6' : 'justify-center px-3'} py-5 border-b border-dark-400`}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0"><FaDumbbell className="text-white text-sm" /></div>
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
                <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>MANAGE TRAINERS</h1>
                <p className="text-gray-400 text-sm">{trainers.length} trainers on staff</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} onClick={openAdd} className="btn-primary text-sm py-2.5 flex items-center gap-2">
                <FaPlus className="text-xs" /> Add Trainer
              </motion.button>
            </div>

            {/* Search bar */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by name, email or speciality..."
                className="input-field pl-10"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : (() => {
              const filtered = trainers.filter((t) => {
                const q = search.toLowerCase()
                return (
                  t.name?.toLowerCase().includes(q) ||
                  t.email?.toLowerCase().includes(q) ||
                  t.speciality?.toLowerCase().includes(q)
                )
              })
              const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
              const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

              if (filtered.length === 0) {
                return (
                  <div className="glass-card p-12 text-center text-gray-500">
                    <FaUserTie className="text-4xl mx-auto mb-3 opacity-30" />
                    <p>{search ? 'No trainers match your search.' : 'No trainers yet.'}</p>
                  </div>
                )
              }

              return (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {paginated.map((trainer, i) => (
                      <motion.div key={trainer._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} onClick={() => { setSelected(trainer); setModal('view') }} className="glass-card p-5 hover:border-primary/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-3 mb-4">
                          {trainer.image ? (
                            <img src={trainer.image} alt={trainer.name} className="w-12 h-12 rounded-xl object-cover" onError={(e) => { e.target.style.display = 'none' }} />
                          ) : (
                            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary text-lg font-black">{trainer.name?.charAt(0)}</div>
                          )}
                          <div>
                            <div className="text-white font-bold text-sm">{trainer.name}</div>
                            <div className="text-primary text-xs">{trainer.speciality}</div>
                            {trainer.trainerId && (
                              <div className="text-xs font-mono text-gray-500 mt-0.5">{trainer.trainerId}</div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1.5 text-xs text-gray-400 mb-4">
                          {trainer.email && <div>✉ {trainer.email}</div>}
                          {trainer.experience && <div>Experience: <span className="text-gray-300">{trainer.experience} yrs</span></div>}
                          {trainer.branch && <div>📍 <span className="text-gray-300">{trainer.branch.name}</span></div>}
                          <div>Clients: <span className="text-gray-300">{trainer.clients?.length || 0}</span></div>
                          {trainer.averageRating > 0 && (
                            <div className="flex items-center gap-1">
                              <FaStar className="text-yellow-400 text-[9px]" />
                              <span className="text-yellow-400">{trainer.averageRating.toFixed(1)}</span>
                              <span className="text-gray-500 text-[10px]">({trainer.reviews?.length || 0})</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => { setSelected(trainer); setModal('view') }} className="flex-1 flex items-center justify-center gap-1 bg-green-500/10 hover:bg-green-500/20 rounded-lg py-2 text-green-400 transition-colors text-xs"><FaEye className="text-xs" /> View</button>
                          <button onClick={() => openEdit(trainer)} className="flex-1 flex items-center justify-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg py-2 text-blue-400 transition-colors text-xs"><FaEdit className="text-xs" /> Edit</button>
                          <button onClick={() => setDeleteTarget(trainer)} className="w-8 h-8 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 transition-colors"><FaTrash className="text-xs" /></button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-gray-500 text-sm">
                        Showing <span className="text-white font-medium">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="text-white font-medium">{filtered.length}</span> trainers
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="px-3 py-1.5 rounded-lg bg-dark-300 border border-dark-500 text-gray-400 hover:text-white disabled:opacity-40 text-sm transition-colors"
                        >← Prev</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
                          if (n === 1 || n === totalPages || (n >= page - 2 && n <= page + 2)) {
                            return (
                              <button key={n} onClick={() => setPage(n)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${n === page ? 'bg-primary text-white' : 'bg-dark-300 border border-dark-500 text-gray-400 hover:text-white'}`}>
                                {n}
                              </button>
                            )
                          }
                          if (n === page - 3 || n === page + 3) return <span key={n} className="text-gray-600 px-1">…</span>
                          return null
                        })}
                        <button
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="px-3 py-1.5 rounded-lg bg-dark-300 border border-dark-500 text-gray-400 hover:text-white disabled:opacity-40 text-sm transition-colors"
                        >Next →</button>
                      </div>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-200 border border-dark-400 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>{modal === 'add' ? 'ADD TRAINER' : 'EDIT TRAINER'}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Full Name *</label>
                    <input value={form.name} onChange={(e) => f('name', e.target.value)} className={fieldClass(formErrors, 'name', 'input-field text-sm')} placeholder="Alex Johnson" />
                    <Err msg={formErrors.name} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => f('email', e.target.value)} className={fieldClass(formErrors, 'email', 'input-field text-sm')} placeholder="trainer@email.com" />
                    <Err msg={formErrors.email} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Speciality *</label>
                    <input value={form.speciality} onChange={(e) => f('speciality', e.target.value)} className={fieldClass(formErrors, 'speciality', 'input-field text-sm')} placeholder="Powerlifting, HIIT..." />
                    <Err msg={formErrors.speciality} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Phone</label>
                    <PhoneInput
                      value={form.phone}
                      onChange={(v) => f('phone', v)}
                      onBlur={() => {
                        const isEdit = modal === 'edit'
                        const errs = validate(form, TRAINER_RULES(isEdit))
                        setFormErrors((p) => ({ ...p, phone: errs.phone }))
                      }}
                      error={formErrors.phone}
                    />
                    <Err msg={formErrors.phone} />
                  </div>
                </div>
                {modal === 'add' && (
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Login Password</label>
                    <input type="password" value={form.password} onChange={(e) => f('password', e.target.value)} className={fieldClass(formErrors, 'password', 'input-field text-sm')} placeholder="Leave blank for default: trainer123" />
                    <Err msg={formErrors.password} />
                    <p className="text-gray-600 text-xs mt-1">This creates a login account for the trainer at /login</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Experience (years)</label>
                    <input type="number" min="0" value={form.experience} onChange={(e) => f('experience', e.target.value)} className={fieldClass(formErrors, 'experience', 'input-field text-sm')} placeholder="5" />
                    <Err msg={formErrors.experience} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Branch</label>
                    <select value={form.branch} onChange={(e) => f('branch', e.target.value)} className="input-field text-sm">
                      <option value="">No branch</option>
                      {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Bio</label>
                  <textarea value={form.bio} onChange={(e) => f('bio', e.target.value)} className="input-field text-sm h-20 resize-none" placeholder="Short trainer bio..." />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-dark-500 text-gray-400 text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">{saving ? 'Saving...' : modal === 'add' ? 'Add Trainer' : 'Save Changes'}</button>
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
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-7 py-5 border-b border-dark-400 flex-shrink-0">
                <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>TRAINER PROFILE</h2>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>

              <div className="flex divide-x divide-dark-400 overflow-y-auto flex-1">
                {/* Left — profile */}
                <div className="w-72 flex-shrink-0 p-6 flex flex-col items-center text-center">
                  {selected.image ? (
                    <img src={selected.image} alt={selected.name} className="w-32 h-32 rounded-2xl object-cover mb-4 border-2 border-dark-400" />
                  ) : (
                    <div className="w-32 h-32 bg-primary/20 rounded-2xl flex items-center justify-center text-primary text-5xl font-black mb-4 border-2 border-dark-400">{selected.name?.charAt(0)}</div>
                  )}
                  <h3 className="text-white font-black text-xl mb-0.5" style={{ fontFamily: 'Oswald' }}>{selected.name}</h3>
                  <p className="text-primary text-sm mb-1">{selected.speciality}</p>
                  {selected.trainerId && <span className="text-xs font-mono bg-dark-400 text-gray-300 px-2 py-0.5 rounded-full mb-2">{selected.trainerId}</span>}
                  {selected.averageRating > 0 && (
                    <div className="flex items-center gap-1.5 mb-4">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => <FaStar key={s} className={`text-xs ${s <= Math.round(selected.averageRating) ? 'text-yellow-400' : 'text-gray-600'}`} />)}
                      </div>
                      <span className="text-yellow-400 text-xs font-bold">{selected.averageRating.toFixed(1)}</span>
                      <span className="text-gray-500 text-xs">({selected.reviews?.length || 0})</span>
                    </div>
                  )}

                  <div className="w-full space-y-2 text-left">
                    {[
                      { label: 'Email', value: selected.email, icon: FaEnvelope },
                      { label: 'Phone', value: selected.phone || '—', icon: FaPhone },
                      { label: 'Experience', value: selected.experience ? `${selected.experience} years` : '—', icon: FaStar },
                      { label: 'Branch', value: selected.branch?.name || '—', icon: FaMapMarkerAlt },
                      { label: 'Clients', value: selected.clients?.length ?? 0, icon: FaUsers },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="p-2.5 bg-dark-300 rounded-xl">
                        <div className="flex items-center gap-1.5 mb-0.5"><Icon className="text-primary text-[10px]" /><span className="text-gray-500 text-[10px] uppercase tracking-wide">{label}</span></div>
                        <p className="text-gray-200 text-sm font-medium truncate">{String(value)}</p>
                      </div>
                    ))}
                  </div>

                  {selected.certifications?.length > 0 && (
                    <div className="w-full mt-4 text-left">
                      <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-2">Certifications</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.certifications.map((c) => <span key={c} className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full">{c}</span>)}
                      </div>
                    </div>
                  )}

                  {(selected.socialLinks?.instagram || selected.socialLinks?.linkedin || selected.socialLinks?.twitter) && (
                    <div className="w-full mt-4 flex flex-wrap gap-1.5">
                      {selected.socialLinks?.instagram && <a href={selected.socialLinks.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-pink-400 bg-pink-500/10 px-3 py-1.5 rounded-full"><FaInstagram /> Instagram</a>}
                      {selected.socialLinks?.linkedin && <a href={selected.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full"><FaLinkedin /> LinkedIn</a>}
                      {selected.socialLinks?.twitter && <a href={selected.socialLinks.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-full"><FaTwitter /> Twitter</a>}
                    </div>
                  )}
                </div>

                {/* Right — bio + reviews */}
                <div className="flex-1 p-6 flex flex-col gap-5">
                  {selected.bio && (
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-widest mb-2 font-semibold">About</p>
                      <p className="text-gray-300 text-sm leading-relaxed bg-dark-300 p-4 rounded-xl">{selected.bio}</p>
                    </div>
                  )}

                  {selected.reviews?.length > 0 ? (
                    <div className="flex-1">
                      <p className="text-gray-500 text-xs uppercase tracking-widest mb-3 font-semibold flex items-center gap-1.5">
                        <FaStar className="text-yellow-400 text-[10px]" /> Member Reviews ({selected.reviews.length})
                      </p>
                      <div className="space-y-2 overflow-y-auto max-h-72 pr-1">
                        {[...selected.reviews].sort((a, b) => new Date(b.date) - new Date(a.date)).map((r, i) => (
                          <div key={i} className="p-3 bg-dark-300 rounded-xl border border-dark-500">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary text-[9px] font-bold flex-shrink-0">{r.user?.name?.charAt(0) || '?'}</div>
                                <span className="text-white text-xs font-medium">{r.user?.name || 'Member'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="flex gap-0.5">{[1,2,3,4,5].map((s) => <FaStar key={s} className={`text-[9px] ${s <= r.rating ? 'text-yellow-400' : 'text-gray-600'}`} />)}</div>
                                <span className="text-yellow-400 text-[10px] font-bold">{r.rating}/5</span>
                              </div>
                            </div>
                            {r.comment && <p className="text-gray-400 text-xs leading-relaxed mt-1">{r.comment}</p>}
                            {r.date && <p className="text-gray-600 text-[10px] mt-1">{new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-gray-600 text-sm">No reviews yet</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2 border-t border-dark-400">
                    <button onClick={() => { setModal(null); openEdit(selected) }} className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2"><FaEdit className="text-xs" /> Edit Trainer</button>
                    <button onClick={() => setModal(null)} className="px-6 bg-dark-300 hover:bg-dark-400 text-gray-300 rounded-full transition-colors text-sm">Close</button>
                  </div>
                </div>
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
              <h3 className="text-white font-bold mb-2">Remove Trainer</h3>
              <p className="text-gray-400 text-sm mb-6">Remove <span className="text-white font-medium">{deleteTarget.name}</span>? This cannot be undone.</p>
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
