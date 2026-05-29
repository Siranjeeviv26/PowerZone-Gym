import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaDumbbell, FaPlus, FaEdit, FaTrash, FaTimes, FaBars, FaUsers,
  FaUserTie, FaCrown, FaHome, FaSignOutAlt, FaMapMarkerAlt, FaImages,
  FaAppleAlt, FaExchangeAlt, FaGlobe, FaFileAlt, FaTachometerAlt,
  FaQuoteLeft, FaRunning, FaCalendarAlt, FaClock, FaSearch, FaUserPlus,
  FaUserMinus, FaToggleOn, FaToggleOff, FaCheck, FaLink, FaUpload,
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
  { to: '/admin/workouts', label: 'Workouts', icon: FaDumbbell },
  { to: '/admin/diet-plans', label: 'Diet Plans', icon: FaAppleAlt },
  { to: '/admin/gallery', label: 'Gallery', icon: FaImages },
  { to: '/admin/testimonials', label: 'Testimonials', icon: FaQuoteLeft },
  { to: '/admin/footer', label: 'Footer', icon: FaGlobe },
  { to: '/admin/theme', label: 'Theme', icon: FaPalette },
  { to: '/admin/master-data', label: 'Master Data', icon: FaDatabase },
  { to: '/admin/legal', label: 'Legal', icon: FaFileAlt },
  { to: '/', label: 'View Site', icon: FaHome },
]

const INITIAL_FORM = {
  title: '', activityType: 'General', description: '',
  date: '', time: '', registrationDeadline: '',
  maxParticipants: '', branch: '', trainers: [],
  status: 'upcoming', isActive: true, image: '',
}

// Convert ISO/UTC string → local datetime-local string for <input type="datetime-local">
function toLocalDatetimeInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function RichTextEditor({ value, onChange, placeholder = 'Write description...' }) {
  const editorRef = useRef(null)
  useEffect(() => { if (editorRef.current) editorRef.current.innerHTML = value || '' }, [])
  const exec = (cmd, val = null) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    if (onChange) onChange(editorRef.current?.innerHTML || '')
  }
  const Btn = ({ onAction, title, children }) => (
    <button type="button" title={title} onMouseDown={(e) => { e.preventDefault(); onAction() }}
      className="w-7 h-7 flex items-center justify-center rounded text-gray-300 hover:bg-dark-200 hover:text-white transition-colors text-xs">
      {children}
    </button>
  )
  return (
    <div className="border border-dark-500 rounded-xl overflow-hidden focus-within:border-primary/40 transition-colors">
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-dark-400/60 border-b border-dark-500">
        <Btn onAction={() => exec('bold')} title="Bold"><strong className="font-black">B</strong></Btn>
        <Btn onAction={() => exec('italic')} title="Italic"><em>I</em></Btn>
        <div className="w-px h-4 bg-dark-500 mx-0.5" />
        <Btn onAction={() => exec('insertUnorderedList')} title="Bullet list">
          <svg viewBox="0 0 16 16" width="13" fill="currentColor"><circle cx="2" cy="4" r="1.5"/><rect x="5" y="3" width="10" height="2" rx="1"/><circle cx="2" cy="8" r="1.5"/><rect x="5" y="7" width="10" height="2" rx="1"/><circle cx="2" cy="12" r="1.5"/><rect x="5" y="11" width="10" height="2" rx="1"/></svg>
        </Btn>
      </div>
      <div ref={editorRef} contentEditable suppressContentEditableWarning
        onInput={(e) => onChange && onChange(e.currentTarget.innerHTML)}
        data-placeholder={placeholder}
        className="min-h-[90px] p-3 text-sm text-gray-300 outline-none bg-dark-300 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-bold [&_strong]:text-white [&_em]:italic empty:before:content-[attr(data-placeholder)] empty:before:text-gray-600 empty:before:pointer-events-none"
      />
    </div>
  )
}

export default function ManageActivities() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024)
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [activities, setActivities] = useState([])
  const [branches, setBranches] = useState([])
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)

  // Modal state
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [modalTab, setModalTab] = useState('details') // 'details' | 'users'

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null)

  // Registered users management
  const [userSearch, setUserSearch] = useState('')
  const [userResults, setUserResults] = useState([])
  const [userSearching, setUserSearching] = useState(false)
  const [addingUser, setAddingUser] = useState(null)
  const [removingUser, setRemovingUser] = useState(null)
  const [registeredUsers, setRegisteredUsers] = useState([])

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [actRes, brRes, trRes] = await Promise.allSettled([
        api.get('/activities?admin=true'),
        api.get('/branches'),
        api.get('/trainers'),
      ])
      if (actRes.status === 'fulfilled') setActivities(actRes.value.data.activities || [])
      if (brRes.status === 'fulfilled') setBranches(brRes.value.data.branches || [])
      if (trRes.status === 'fulfilled') setTrainers(trRes.value.data.trainers || [])
    } catch {}
    setLoading(false)
  }

  const openCreate = () => {
    setEditing(null)
    setForm(INITIAL_FORM)
    setModalTab('details')
    setRegisteredUsers([])
    setUserSearch('')
    setUserResults([])
    setModal(true)
  }

  const openEdit = (a) => {
    setEditing(a)
    setForm({
      title: a.title || '',
      activityType: a.activityType || 'General',
      description: a.description || '',
      date: a.date ? toLocalDatetimeInput(a.date) : '',
      time: a.time || '',
      registrationDeadline: a.registrationDeadline ? toLocalDatetimeInput(a.registrationDeadline) : '',
      maxParticipants: a.maxParticipants || '',
      branch: a.branch?._id || a.branch || '',
      trainers: a.trainers?.map((t) => t._id || t) || [],
      status: a.status || 'upcoming',
      isActive: a.isActive !== false,
      image: a.image || '',
    })
    setRegisteredUsers(a.registeredUsers || [])
    setModalTab('details')
    setUserSearch('')
    setUserResults([])
    setModal(true)
  }

  const closeModal = () => {
    setModal(false)
    setEditing(null)
    setForm(INITIAL_FORM)
    setUserSearch('')
    setUserResults([])
    setRegisteredUsers([])
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.date) return toast.error('Activity date is required')
    setSaving(true)
    try {
      const payload = {
        ...form,
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
        branch: form.branch || undefined,
        trainers: form.trainers.filter(Boolean),
        registrationDeadline: form.registrationDeadline || undefined,
      }
      if (editing) {
        const { data } = await api.put(`/activities/${editing._id}`, payload)
        setActivities((prev) => prev.map((a) => a._id === editing._id ? data.activity : a))
        toast.success('Activity updated')
      } else {
        const { data } = await api.post('/activities', payload)
        setActivities((prev) => [data.activity, ...prev])
        toast.success('Activity created')
      }
      closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/activities/${deleteId}`)
      setActivities((prev) => prev.filter((a) => a._id !== deleteId))
      toast.success('Activity deleted')
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleteId(null)
    }
  }

  const toggleTrainer = (id) => {
    setForm((f) => ({
      ...f,
      trainers: f.trainers.includes(id) ? f.trainers.filter((t) => t !== id) : [...f.trainers, id],
    }))
  }

  // User search for add-user
  useEffect(() => {
    if (!userSearch.trim()) { setUserResults([]); return }
    const timer = setTimeout(async () => {
      setUserSearching(true)
      try {
        const { data } = await api.get(`/users?search=${encodeURIComponent(userSearch)}&limit=10`)
        setUserResults(data.users || [])
      } catch {}
      setUserSearching(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [userSearch])

  const handleAddUser = async (userId) => {
    if (!editing) return
    setAddingUser(userId)
    try {
      const { data } = await api.post(`/activities/${editing._id}/add-user`, { userId })
      setRegisteredUsers(data.registeredUsers)
      setActivities((prev) => prev.map((a) => a._id === editing._id ? { ...a, registeredUsers: data.registeredUsers } : a))
      setUserSearch('')
      setUserResults([])
      toast.success('User added')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add user')
    } finally {
      setAddingUser(null)
    }
  }

  const handleRemoveUser = async (userId) => {
    if (!editing) return
    setRemovingUser(userId)
    try {
      const { data } = await api.post(`/activities/${editing._id}/remove-user`, { userId })
      setRegisteredUsers(data.registeredUsers)
      setActivities((prev) => prev.map((a) => a._id === editing._id ? { ...a, registeredUsers: data.registeredUsers } : a))
      toast.success('User removed')
    } catch {
      toast.error('Failed to remove user')
    } finally {
      setRemovingUser(null)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const { data } = await api.post('/site-content/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setForm((f) => ({ ...f, image: data.url }))
      toast.success('Image uploaded')
    } catch {
      toast.error('Image upload failed')
    } finally {
      setImageUploading(false)
    }
  }

  const isDeadlinePassed = (a) => a.registrationDeadline && new Date() > new Date(a.registrationDeadline)
  const stripHtml = (html) => html ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : ''

  const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  const fmtDateTime = (iso) => iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div className="h-screen bg-dark flex overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto flex-shrink-0 flex flex-col bg-dark-100 border-r border-dark-400 transition-all duration-300 ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64 lg:translate-x-0 lg:w-16'}`}>
        <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-6' : 'justify-center px-3'} py-5 border-b border-dark-400`}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <FaDumbbell className="text-white text-sm" />
          </div>
          {sidebarOpen && <span className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>ADMIN PANEL</span>}
        </div>
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}
              onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
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
        <header className="bg-dark-100 border-b border-dark-400 px-4 md:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors">
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>ACTIVITIES</h1>
              <p className="text-gray-400 text-sm">Manage gym activities and member registrations</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={openCreate}
              className="btn-primary text-sm py-2.5 flex items-center gap-2">
              <FaPlus className="text-xs" /> Add Activity
            </motion.button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center text-gray-500 py-20">
              <FaRunning className="text-5xl mx-auto mb-4 opacity-20" />
              <p>No activities yet. Create the first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {activities.map((a) => {
                const deadlinePassed = isDeadlinePassed(a)
                return (
                  <motion.div key={a._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-dark-200 border border-dark-400 rounded-2xl overflow-hidden flex flex-col">
                    {a.image && (
                      <div className="h-36 overflow-hidden flex-shrink-0">
                        <img src={a.image} alt={a.title} className="w-full h-full object-cover"
                          onError={(e) => { e.target.parentElement.style.display = 'none' }} />
                      </div>
                    )}
                    <div className="p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            a.status === 'upcoming' ? 'bg-green-500/10 text-green-400' :
                            a.status === 'completed' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>{a.status}</span>
                          {!a.isActive && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-500">Inactive</span>}
                          {deadlinePassed && <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">Deadline Passed</span>}
                        </div>
                        <h3 className="text-white font-bold truncate">{a.title}</h3>
                        <p className="text-primary text-xs">{a.activityType}</p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => openEdit(a)} className="w-8 h-8 bg-dark-300 hover:bg-primary/20 hover:text-primary text-gray-400 rounded-lg flex items-center justify-center transition-colors text-sm">
                          <FaEdit />
                        </button>
                        <button onClick={() => setDeleteId(a._id)} className="w-8 h-8 bg-dark-300 hover:bg-red-500/20 hover:text-red-400 text-gray-400 rounded-lg flex items-center justify-center transition-colors text-sm">
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    {a.description && (
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                        {stripHtml(a.description).slice(0, 120)}{stripHtml(a.description).length > 120 ? '…' : ''}
                      </p>
                    )}

                    <div className="space-y-1.5 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-600 flex-shrink-0" />
                        <span>{fmtDate(a.date)}{a.time ? ` · ${a.time}` : ''}</span>
                      </div>
                      {a.registrationDeadline && (
                        <div className={`flex items-center gap-2 ${deadlinePassed ? 'text-orange-400' : 'text-gray-400'}`}>
                          <FaClock className="flex-shrink-0" />
                          <span>Deadline: {fmtDateTime(a.registrationDeadline)}</span>
                        </div>
                      )}
                      {a.branch && (
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-gray-600 flex-shrink-0" />
                          <span>{a.branch.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-dark-500">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <FaUsers className="text-gray-600" />
                        <span>{a.registeredUsers?.length || 0}{a.maxParticipants ? ` / ${a.maxParticipants}` : ''} registered</span>
                      </div>
                      {a.trainers?.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <FaUserTie className="text-gray-600" />
                          {a.trainers.map((t) => t.name).join(', ')}
                        </div>
                      )}
                    </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
            <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-dark-400 flex-shrink-0">
                <h2 className="text-white font-black text-lg" style={{ fontFamily: 'Oswald' }}>
                  {editing ? 'EDIT ACTIVITY' : 'ADD ACTIVITY'}
                </h2>
                <div className="flex items-center gap-3">
                  {editing && (
                    <div className="flex bg-dark-300 rounded-lg p-0.5">
                      {[{ id: 'details', label: 'Details' }, { id: 'users', label: `Members (${registeredUsers.length})` }].map((t) => (
                        <button key={t.id} onClick={() => setModalTab(t.id)}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${modalTab === t.id ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <button onClick={closeModal} className="text-gray-400 hover:text-white"><FaTimes /></button>
                </div>
              </div>

              {/* Details tab */}
              {modalTab === 'details' && (
                <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-gray-400 text-xs mb-1 block">Title *</label>
                      <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Morning Yoga Session" className="input-field" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Activity Type</label>
                      <input value={form.activityType} onChange={(e) => setForm({ ...form, activityType: e.target.value })}
                        placeholder="e.g. Yoga, HIIT, Zumba" className="input-field" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Status</label>
                      <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Activity Date *</label>
                      <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="input-field" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Display Time (optional)</label>
                      <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                        placeholder="e.g. 7:00 AM - 8:00 AM" className="input-field" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block flex items-center gap-1.5">
                        <FaClock className="text-orange-400" /> Registration Deadline
                      </label>
                      <input type="datetime-local" value={form.registrationDeadline}
                        onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                        className="input-field" />
                      <p className="text-gray-600 text-[10px] mt-1">After this time users can't self-register. Admin can still add them manually.</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Max Participants</label>
                      <input type="number" min="1" value={form.maxParticipants}
                        onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                        placeholder="Leave empty for unlimited" className="input-field" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Branch</label>
                      <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} className="input-field">
                        <option value="">All Branches</option>
                        {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Active</label>
                      <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${form.isActive ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-dark-500 bg-dark-300 text-gray-500'}`}>
                        {form.isActive ? <FaToggleOn className="text-lg" /> : <FaToggleOff className="text-lg" />}
                        {form.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Activity Image</label>
                    <div className="flex gap-2">
                      <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                        placeholder="Paste image URL or upload..." className="input-field text-sm flex-1" />
                      <label className={`flex items-center gap-1.5 px-3 rounded-xl cursor-pointer text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0 border ${imageUploading ? 'bg-dark-300 border-dark-500 text-gray-500' : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'}`}>
                        <FaUpload className="text-xs" />
                        {imageUploading ? 'Uploading…' : 'Upload'}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={imageUploading} />
                      </label>
                    </div>
                    {form.image && (
                      <div className="mt-2 relative">
                        <img src={form.image} alt="Preview" className="w-full h-32 object-cover rounded-xl border border-dark-400" onError={(e) => { e.target.style.display = 'none' }} />
                        <button type="button" onClick={() => setForm({ ...form, image: '' })}
                          className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-500/80 transition-colors">
                          <FaTimes className="text-[9px]" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Description</label>
                    <RichTextEditor key={editing?._id || 'new'} value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
                  </div>

                  {trainers.length > 0 && (
                    <div>
                      <label className="text-gray-400 text-xs mb-2 block">Assign Trainers</label>
                      <div className="flex flex-wrap gap-2">
                        {trainers.map((t) => {
                          const selected = form.trainers.includes(t._id)
                          return (
                            <button key={t._id} type="button" onClick={() => toggleTrainer(t._id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                selected ? 'bg-primary/10 text-primary border-primary/30' : 'bg-dark-300 text-gray-400 border-dark-500 hover:border-dark-400'
                              }`}>
                              {selected && <FaCheck className="text-[9px]" />}
                              {t.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2 pb-1">
                    <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-dark-500 text-gray-400 hover:text-white transition-all text-sm">Cancel</button>
                    <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">
                      {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Activity'}
                    </button>
                  </div>
                </form>
              )}

              {/* Registered Users tab */}
              {modalTab === 'users' && editing && (
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                  {/* Add user search */}
                  <div>
                    <label className="text-gray-400 text-xs mb-2 block flex items-center gap-1.5">
                      <FaUserPlus className="text-primary" /> Add Member (bypasses deadline)
                    </label>
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                      <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by name, email, or phone..."
                        className="input-field pl-8 text-sm" />
                    </div>
                    {userSearching && <p className="text-gray-500 text-xs mt-1">Searching...</p>}
                    {userResults.length > 0 && (
                      <div className="mt-2 bg-dark-300 border border-dark-500 rounded-xl overflow-hidden">
                        {userResults.map((u) => {
                          const alreadyIn = registeredUsers.some((r) => (r._id || r).toString() === u._id)
                          return (
                            <div key={u._id} className="flex items-center justify-between px-4 py-2.5 border-b border-dark-500 last:border-0">
                              <div className="min-w-0">
                                <div className="text-white text-sm font-medium truncate">{u.name}</div>
                                <div className="text-gray-500 text-xs">{u.email} {u.phone ? `· ${u.phone}` : ''}</div>
                              </div>
                              {alreadyIn ? (
                                <span className="text-xs text-green-400 flex items-center gap-1 flex-shrink-0"><FaCheck className="text-[9px]" /> Added</span>
                              ) : (
                                <button onClick={() => handleAddUser(u._id)} disabled={addingUser === u._id}
                                  className="flex-shrink-0 text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full transition-colors disabled:opacity-50">
                                  {addingUser === u._id ? '...' : 'Add'}
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Registered users list */}
                  <div>
                    <h4 className="text-gray-400 text-xs mb-2 flex items-center gap-1.5">
                      <FaUsers className="text-gray-600" /> Registered Members ({registeredUsers.length})
                    </h4>
                    {registeredUsers.length === 0 ? (
                      <div className="text-center py-8 text-gray-600 text-sm">No members registered yet</div>
                    ) : (
                      <div className="space-y-2">
                        {registeredUsers.map((u) => {
                          const id = u._id || u
                          const name = u.name || 'Unknown'
                          return (
                            <div key={id} className="flex items-center justify-between px-4 py-3 bg-dark-300 rounded-xl border border-dark-500">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                                  {name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-white text-sm font-medium truncate">{name}</div>
                                  {u.email && <div className="text-gray-500 text-xs truncate">{u.email}</div>}
                                  {u.phone && <div className="text-gray-600 text-xs">{u.phone}</div>}
                                </div>
                              </div>
                              <button onClick={() => handleRemoveUser(id.toString())} disabled={removingUser === id.toString()}
                                className="flex-shrink-0 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50 ml-3">
                                {removingUser === id.toString() ? '...' : <FaUserMinus />}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.93 }} animate={{ scale: 1 }} exit={{ scale: 0.93 }}
              className="bg-dark-100 border border-dark-400 rounded-2xl p-6 w-full max-w-sm text-center">
              <FaTrash className="text-3xl text-red-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-2">Delete Activity?</h3>
              <p className="text-gray-500 text-sm mb-5">This will permanently remove the activity and all registrations.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-dark-500 text-gray-400 hover:text-white transition-all text-sm">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-all text-sm font-semibold">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
