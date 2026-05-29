import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSearch, FaEdit, FaTrash, FaUsers, FaTimes, FaPlus, FaUserTie, FaCrown, FaHome, FaSignOutAlt, FaBars, FaMapMarkerAlt, FaExchangeAlt, FaDumbbell, FaImages, FaAppleAlt, FaEye, FaPhone, FaEnvelope, FaBullseye, FaCalendar, FaGlobe, FaFileAlt, FaTachometerAlt, FaQuoteLeft, FaRunning, FaLink, FaPalette, FaDatabase, FaTag } from 'react-icons/fa'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { validate, required, email, minLen, maxLen, phone, passwordStrength, fieldClass } from '../../utils/validate'
import PhoneInput from '../../components/shared/PhoneInput'

const Err = ({ msg }) => msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null

const USER_RULES = (isEdit) => ({
  name: [required('Name'), minLen(2, 'Name'), maxLen(50, 'Name')],
  email: [required('Email'), email()],
  phone: isEdit ? [phone()] : [required('Phone'), phone()],
  ...(isEdit ? {} : { password: [required('Password'), minLen(6, 'Password'), passwordStrength()] }),
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

const statusColors = {
  active: 'bg-green-500/10 text-green-400',
  expired: 'bg-red-500/10 text-red-400',
  pending: 'bg-yellow-500/10 text-yellow-400',
  frozen: 'bg-blue-500/10 text-blue-400',
}

const DURATION_MONTHS = { monthly: 1, quarterly: 3, 'half-yearly': 6, annual: 12 }

const calcNextPayment = (paymentDate, duration) => {
  if (!paymentDate || !duration) return ''
  const d = new Date(paymentDate)
  if (isNaN(d)) return ''
  d.setMonth(d.getMonth() + (DURATION_MONTHS[duration] || 1))
  return d.toISOString().split('T')[0]
}

const EMPTY_FORM = {
  name: '', email: '', password: '', phone: '', goal: '',
  branch: '', referredBy: '',
  membershipPlan: '', membershipPackage: '', membershipStatus: 'pending',
  joiningDate: '', paymentDate: '', nextPaymentDate: '',
  workoutPlanId: '',
  dietPlanId: '',
}

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [plans, setPlans] = useState([])
  const [trainers, setTrainers] = useState([])
  const [branches, setBranches] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 15
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024)
  const [modal, setModal] = useState(null) // null | 'add' | 'edit' | 'trainer' | 'transfer'
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [trainerAssign, setTrainerAssign] = useState('')
  const [trainerType, setTrainerType] = useState('personal') // 'personal' | 'class'
  const [transferBranch, setTransferBranch] = useState('')
  const [transferNotes, setTransferNotes] = useState('')
  const [referredBySearch, setReferredBySearch] = useState('')
  const [referredBySuggestions, setReferredBySuggestions] = useState([])
  const [referredByUser, setReferredByUser] = useState(null)
  const [memberWorkoutPlans, setMemberWorkoutPlans] = useState([])
  const [memberDietPlans, setMemberDietPlans] = useState([])
  const searchTimerRef = useRef(null)

  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = {}
      if (search) params.search = search
      if (filter !== 'all') params.status = filter
      const { data } = await api.get('/users', { params })
      setUsers(data.users)
      setTotal(data.total)
    } catch {
      toast.error('Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/plans')
      setPlans(data.plans || data)
    } catch {}
  }

  const fetchTrainers = async () => {
    try {
      const { data } = await api.get('/trainers')
      setTrainers(data.trainers || [])
    } catch {}
  }

  const fetchBranches = async () => {
    try {
      const { data } = await api.get('/branches')
      setBranches(data.branches || [])
    } catch {}
  }

  const fetchMemberWorkoutPlans = async () => {
    try {
      const { data } = await api.get('/workouts?admin=true')
      setMemberWorkoutPlans((data.workouts || []).filter((w) => w.planType === 'member'))
    } catch {}
  }

  const fetchMemberDietPlans = async () => {
    try {
      const { data } = await api.get('/diet?admin=true')
      setMemberDietPlans((data.plans || []).filter((p) => p.planType === 'member'))
    } catch {}
  }

  const handleAssignTrainer = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/admin/assign-trainer', { userId: selected._id, trainerId: trainerAssign || null, type: trainerType })
      const label = trainerType === 'personal' ? 'Personal trainer' : 'Class trainer'
      toast.success(`${label} assigned!`)
      setModal(null)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign trainer')
    } finally {
      setSaving(false)
    }
  }

  const handleBranchTransfer = async (e) => {
    e.preventDefault()
    if (!transferBranch) return toast.error('Select a branch')
    setSaving(true)
    try {
      const { data } = await api.post('/admin/branch-transfer', { userId: selected._id, toBranchId: transferBranch, notes: transferNotes })
      toast.success(data.message)
      setModal(null)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Branch transfer failed')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => { fetchPlans(); fetchTrainers(); fetchBranches(); fetchMemberWorkoutPlans(); fetchMemberDietPlans() }, [])
  useEffect(() => { setPage(1); fetchUsers() }, [search, filter])

  // Auto-calculate nextPaymentDate when package or paymentDate changes
  useEffect(() => {
    if (!form.paymentDate || !form.membershipPackage) return
    const next = calcNextPayment(form.paymentDate, form.membershipPackage)
    if (next) setForm((prev) => ({ ...prev, nextPaymentDate: next }))
  }, [form.paymentDate, form.membershipPackage])

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setSelected(null)
    setFormErrors({})
    setReferredBySearch('')
    setReferredBySuggestions([])
    setReferredByUser(null)
    setModal('add')
  }

  const openEdit = (user) => {
    setSelected(user)
    const toDate = (v) => v ? new Date(v).toISOString().split('T')[0] : ''
    const resolveId = (id) => (typeof id === 'object' ? id?._id : id) || ''
    const currentWorkout = memberWorkoutPlans.find((p) =>
      p.assignedTo?.some((id) => String(resolveId(id)) === String(user._id))
    )
    const currentDiet = memberDietPlans.find((p) =>
      p.assignedTo?.some((id) => String(resolveId(id)) === String(user._id))
    )
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      phone: user.phone || '',
      goal: user.goal || '',
      branch: user.branch?._id || user.branch || '',
      referredBy: user.referredBy?._id || user.referredBy || '',
      membershipPlan: user.membership?.plan?._id || user.membership?.plan || '',
      membershipPackage: user.membership?.package || '',
      membershipStatus: user.membership?.status || 'pending',
      joiningDate: toDate(user.membership?.joiningDate),
      paymentDate: toDate(user.membership?.paymentDate),
      nextPaymentDate: toDate(user.membership?.nextPaymentDate),
      workoutPlanId: currentWorkout?._id || '',
      dietPlanId: currentDiet?._id || '',
    })
    setReferredBySearch('')
    setReferredBySuggestions([])
    setReferredByUser(user.referredBy ? { _id: user.referredBy._id, name: user.referredBy.name, phone: user.referredBy.phone } : null)
    setFormErrors({})
    setModal('edit')
  }

  const closeModal = () => {
    setModal(null)
    setSelected(null)
    setFormErrors({})
    setReferredBySearch('')
    setReferredBySuggestions([])
    setReferredByUser(null)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const isEdit = modal === 'edit'
    const errs = validate(form, USER_RULES(isEdit))
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setFormErrors({})
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        goal: form.goal,
        branch: form.branch || undefined,
        referredBy: form.referredBy || undefined,
        membership: {
          plan: form.membershipPlan || undefined,
          package: form.membershipPackage || undefined,
          status: form.membershipStatus,
          joiningDate: form.joiningDate || undefined,
          paymentDate: form.paymentDate || undefined,
          nextPaymentDate: form.nextPaymentDate || undefined,
        },
      }
      if (modal === 'add') {
        payload.password = form.password || 'changeme123'
        const { data: created } = await api.post('/users', payload)
        if (form.workoutPlanId && created.user?._id) {
          await api.post('/admin/assign-workout', { userId: created.user._id, workoutPlanId: form.workoutPlanId })
            .catch((e) => toast.error('Workout plan assignment failed: ' + (e.response?.data?.message || e.message)))
        }
        if (form.dietPlanId && created.user?._id) {
          await api.post('/admin/assign-diet', { userId: created.user._id, dietPlanId: form.dietPlanId })
            .catch((e) => toast.error('Diet plan assignment failed: ' + (e.response?.data?.message || e.message)))
        }
        toast.success('Member added successfully')
      } else {
        if (form.password) payload.password = form.password
        await api.put(`/users/${selected._id}`, payload)
        if (form.workoutPlanId) {
          await api.post('/admin/assign-workout', { userId: selected._id, workoutPlanId: form.workoutPlanId })
            .catch((e) => toast.error('Workout plan assignment failed: ' + (e.response?.data?.message || e.message)))
        }
        if (form.dietPlanId) {
          await api.post('/admin/assign-diet', { userId: selected._id, dietPlanId: form.dietPlanId })
            .catch((e) => toast.error('Diet plan assignment failed: ' + (e.response?.data?.message || e.message)))
        }
        toast.success('Member updated successfully')
      }
      closeModal()
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteTarget._id}`)
      toast.success('Member deleted')
      setDeleteTarget(null)
      fetchUsers()
    } catch {
      toast.error('Failed to delete member')
    }
  }

  // Validate a single field and update formErrors in real-time
  const validateField = (field, value) => {
    const rules = USER_RULES(modal === 'edit')
    if (!rules[field]) return
    for (const rule of rules[field]) {
      const err = rule(value)
      if (err) { setFormErrors((p) => ({ ...p, [field]: err })); return }
    }
    setFormErrors((p) => { const n = { ...p }; delete n[field]; return n })
  }

  const handleReferredBySearch = (value) => {
    setReferredBySearch(value)
    setReferredBySuggestions([])
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (value.trim().length < 3) return
    searchTimerRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/users', { params: { phone: value.trim(), limit: 5 } })
        setReferredBySuggestions(data.users || [])
      } catch {}
    }, 350)
  }

  const selectReferredBy = (u) => {
    setReferredByUser(u)
    setForm((prev) => ({ ...prev, referredBy: u._id }))
    setReferredBySearch('')
    setReferredBySuggestions([])
  }

  const clearReferredBy = () => {
    setReferredByUser(null)
    setForm((prev) => ({ ...prev, referredBy: '' }))
    setReferredBySearch('')
    setReferredBySuggestions([])
  }

  const f = (field, val) => setForm((prev) => ({ ...prev, [field]: val }))

  return (
    <div className="h-screen bg-dark flex overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto flex-shrink-0 flex flex-col bg-dark-100 border-r border-dark-400 transition-all duration-300 ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64 lg:translate-x-0 lg:w-16'}`}>
        <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-6' : 'justify-center px-3'} py-5 border-b border-dark-400`}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <FaUsers className="text-white text-sm" />
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

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-dark-100 border-b border-dark-400 px-4 md:px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors">
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>MANAGE MEMBERS</h1>
                <p className="text-gray-400 text-sm">{total} total members</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={openAdd}
                className="btn-primary text-sm py-2.5 flex items-center gap-2"
              >
                <FaPlus className="text-xs" /> Add Member
              </motion.button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="input-field pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['all', 'active', 'expired', 'pending', 'frozen'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                      filter === f ? 'bg-primary text-white' : 'bg-dark-300 text-gray-400 border border-dark-500 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-gray-400">Loading members...</div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <FaUsers className="text-4xl mb-3 opacity-30" />
                  <p>No members found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="text-left text-gray-500 text-xs bg-dark-200 border-b border-dark-400">
                        {['Reg No', 'Member', 'Plan', 'Personal Trainer', 'Class Trainer', 'Status', 'Actions'].map((h) => (
                          <th key={h} className="py-3 px-4 font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((user, i) => (
                        <motion.tr
                          key={user._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => { setSelected(user); setModal('view') }}
                          className="border-b border-dark-400/50 hover:bg-dark-300/50 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-4">
                            {user.regNo ? (
                              <span className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary font-mono font-semibold">{user.regNo}</span>
                            ) : <span className="text-gray-600 text-xs">—</span>}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                                  {user.name?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="text-white text-sm font-medium">{user.name}</div>
                                <div className="text-gray-500 text-xs">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-dark-400 text-gray-300">
                              {user.membership?.plan?.name || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {user.personalTrainer ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-300">{user.personalTrainer.name}</span>
                            ) : <span className="text-gray-600 text-xs">—</span>}
                          </td>
                          <td className="py-3 px-4">
                            {user.classTrainer ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-300">{user.classTrainer.name}</span>
                            ) : <span className="text-gray-600 text-xs">—</span>}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[user.membership?.status] || 'bg-gray-500/10 text-gray-400'}`}>
                              {user.membership?.status || 'none'}
                            </span>
                          </td>
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-1.5">
                              <button onClick={() => { setSelected(user); setModal('view') }} className="w-7 h-7 bg-green-500/10 hover:bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 transition-colors" title="View"><FaEye className="text-xs" /></button>
                              <button onClick={() => openEdit(user)} className="w-7 h-7 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 transition-colors" title="Edit"><FaEdit className="text-xs" /></button>
                              <button onClick={() => { setSelected(user); setTrainerAssign(user.personalTrainer?._id || ''); setTrainerType('personal'); setModal('trainer') }} className="w-7 h-7 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 transition-colors" title="Assign Personal Trainer"><FaUserTie className="text-xs" /></button>
                              <button onClick={() => { setSelected(user); setTrainerAssign(user.classTrainer?._id || ''); setTrainerType('class'); setModal('trainer') }} className="w-7 h-7 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 transition-colors" title="Assign Class Trainer"><FaDumbbell className="text-xs" /></button>
                              <button onClick={() => { setSelected(user); setTransferBranch(''); setTransferNotes(''); setModal('transfer') }} className="w-7 h-7 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg flex items-center justify-center text-yellow-400 transition-colors" title="Branch Transfer"><FaMapMarkerAlt className="text-xs" /></button>
                              <button onClick={() => setDeleteTarget(user)} className="w-7 h-7 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 transition-colors" title="Delete"><FaTrash className="text-xs" /></button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && users.length > PAGE_SIZE && (() => {
              const totalPages = Math.ceil(users.length / PAGE_SIZE)
              const getPages = () => {
                const pages = []
                for (let n = 1; n <= totalPages; n++) {
                  if (n === 1 || n === totalPages || (n >= page - 2 && n <= page + 2)) {
                    pages.push(n)
                  } else if (pages[pages.length - 1] !== '...') {
                    pages.push('...')
                  }
                }
                return pages
              }
              return (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-500 text-sm">
                    Showing <span className="text-white font-medium">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, users.length)}</span> of <span className="text-white font-medium">{users.length}</span> members
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg bg-dark-300 border border-dark-500 text-gray-400 hover:text-white disabled:opacity-40 text-sm transition-colors"
                    >← Prev</button>
                    {getPages().map((n, i) =>
                      n === '...' ? (
                        <span key={`e${i}`} className="text-gray-600 px-1">…</span>
                      ) : (
                        <button
                          key={n}
                          onClick={() => setPage(n)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            n === page ? 'bg-primary text-white' : 'bg-dark-300 border border-dark-500 text-gray-400 hover:text-white'
                          }`}
                        >{n}</button>
                      )
                    )}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 rounded-lg bg-dark-300 border border-dark-500 text-gray-400 hover:text-white disabled:opacity-40 text-sm transition-colors"
                    >Next →</button>
                  </div>
                </div>
              )
            })()}
          </div>
        </main>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {(modal === 'add' || modal === 'edit') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-dark-400">
                <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>
                  {modal === 'add' ? 'ADD NEW MEMBER' : 'EDIT MEMBER'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Full Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => f('name', e.target.value)}
                      placeholder="John Smith"
                      className={fieldClass(formErrors, 'name', 'input-field text-sm')}
                    />
                    <Err msg={formErrors.name} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => f('email', e.target.value)}
                      onBlur={(e) => validateField('email', e.target.value)}
                      placeholder="john@email.com"
                      className={fieldClass(formErrors, 'email', 'input-field text-sm')}
                      disabled={modal === 'edit'}
                    />
                    <Err msg={formErrors.email} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">
                      {modal === 'add' ? 'Password *' : 'New Password (leave blank to keep)'}
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => f('password', e.target.value)}
                      placeholder={modal === 'add' ? 'Min 6 characters' : 'Leave blank'}
                      className={fieldClass(formErrors, 'password', 'input-field text-sm')}
                    />
                    <Err msg={formErrors.password} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">
                      Phone {modal === 'add' && <span className="text-red-400">*</span>}
                    </label>
                    <PhoneInput
                      value={form.phone}
                      onChange={(v) => f('phone', v)}
                      onBlur={() => validateField('phone', form.phone)}
                      error={formErrors.phone}
                    />
                    <Err msg={formErrors.phone} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Fitness Goal</label>
                    <select value={form.goal} onChange={(e) => f('goal', e.target.value)} className="input-field text-sm">
                      <option value="">No goal</option>
                      <option>Lose Weight</option>
                      <option>Build Muscle</option>
                      <option>Improve Fitness</option>
                      <option>Athletic Training</option>
                      <option>General Health</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Branch</label>
                    <select value={form.branch} onChange={(e) => f('branch', e.target.value)} className="input-field text-sm">
                      <option value="">No branch</option>
                      {branches.map((b) => (
                        <option key={b._id} value={b._id}>{b.name} — {b.location}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Referred By */}
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Referred By <span className="text-gray-600">(search by phone number)</span></label>
                  {referredByUser ? (
                    <div className="flex items-center gap-3 p-3 bg-dark-300 border border-dark-500 rounded-xl">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                        {referredByUser.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{referredByUser.name}</div>
                        <div className="text-gray-500 text-xs">{referredByUser.phone}</div>
                      </div>
                      <button type="button" onClick={clearReferredBy} className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0">
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                      <input
                        value={referredBySearch}
                        onChange={(e) => handleReferredBySearch(e.target.value)}
                        placeholder="Type phone number to search..."
                        className="input-field pl-9 text-sm"
                        autoComplete="off"
                      />
                      {referredBySuggestions.length > 0 && (
                        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-dark-200 border border-dark-400 rounded-xl overflow-hidden shadow-xl">
                          {referredBySuggestions.map((u) => (
                            <button
                              key={u._id}
                              type="button"
                              onClick={() => selectReferredBy(u)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-300 transition-colors text-left border-b border-dark-400/50 last:border-0"
                            >
                              <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                                {u.name?.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="text-white text-sm font-medium truncate">{u.name}</div>
                                <div className="text-gray-500 text-xs">{u.phone} · {u.email}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Membership Plan</label>
                    <select value={form.membershipPlan} onChange={(e) => f('membershipPlan', e.target.value)} className="input-field text-sm">
                      <option value="">No plan</option>
                      {plans.map((p) => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Membership Package</label>
                    <select value={form.membershipPackage} onChange={(e) => f('membershipPackage', e.target.value)} className="input-field text-sm">
                      <option value="">Select cycle</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="half-yearly">Half-Yearly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Membership Status</label>
                    <select value={form.membershipStatus} onChange={(e) => f('membershipStatus', e.target.value)} className="input-field text-sm">
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="frozen">Frozen</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Joining Date</label>
                    <input type="date" value={form.joiningDate} onChange={(e) => f('joiningDate', e.target.value)} className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">Payment Date</label>
                    <input type="date" value={form.paymentDate} onChange={(e) => f('paymentDate', e.target.value)} className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block">
                      Next Payment
                      {form.nextPaymentDate && form.membershipPackage && (
                        <span className="ml-1.5 text-green-500 text-xs">(auto)</span>
                      )}
                    </label>
                    <input type="date" value={form.nextPaymentDate} onChange={(e) => f('nextPaymentDate', e.target.value)} className="input-field text-sm" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block flex items-center gap-1.5">
                      <FaDumbbell className="text-primary text-xs" /> Assign Workout Plan
                      <span className="text-gray-600 font-normal">(optional)</span>
                    </label>
                    {memberWorkoutPlans.length === 0 ? (
                      <p className="text-gray-600 text-xs py-2 bg-dark-300 rounded-xl px-3 border border-dark-500">
                        No member plans yet. Create one in Workouts → Member Plans.
                      </p>
                    ) : (
                      <select value={form.workoutPlanId} onChange={(e) => f('workoutPlanId', e.target.value)} className="input-field text-sm">
                        <option value="">No workout plan</option>
                        {memberWorkoutPlans.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.title}{p.levelNumber ? ` — Level ${p.levelNumber}` : ''}{p.days?.length ? ` (${p.days.length} days)` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1.5 block flex items-center gap-1.5">
                      <FaAppleAlt className="text-green-400 text-xs" /> Assign Diet Plan
                      <span className="text-gray-600 font-normal">(optional)</span>
                    </label>
                    {memberDietPlans.length === 0 ? (
                      <p className="text-gray-600 text-xs py-2 bg-dark-300 rounded-xl px-3 border border-dark-500">
                        No diet plans yet. Create one in Diet Plans.
                      </p>
                    ) : (
                      <select value={form.dietPlanId} onChange={(e) => f('dietPlanId', e.target.value)} className="input-field text-sm">
                        <option value="">No diet plan</option>
                        {memberDietPlans.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.title} — {p.goal}{p.totalCalories ? ` (${p.totalCalories} kcal)` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-dark-500 text-gray-400 hover:text-white hover:border-gray-500 transition-all text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">
                    {saving ? 'Saving...' : modal === 'add' ? 'Add Member' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Trainer Modal */}
      <AnimatePresence>
        {modal === 'trainer' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>
                  {trainerType === 'personal' ? 'ASSIGN PERSONAL TRAINER' : 'ASSIGN CLASS TRAINER'}
                </h2>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>

              {/* Type explanation */}
              <div className={`rounded-xl p-3 mb-4 text-xs ${trainerType === 'personal' ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300' : 'bg-orange-500/10 border border-orange-500/20 text-orange-300'}`}>
                {trainerType === 'personal'
                  ? '🏋️ Personal Trainer — 1-on-1 dedicated trainer who manages the client\'s individual diet, workouts, and progress.'
                  : '👥 Class Trainer — Trainer who runs group classes and general sessions for this member.'}
              </div>

              <p className="text-gray-400 text-sm mb-4">
                Member: <span className="text-white font-medium">{selected?.name}</span>
                {trainerType === 'personal' && selected?.personalTrainer && (
                  <span className="text-gray-500 text-xs block mt-0.5">Current PT: {selected.personalTrainer?.name || '—'}</span>
                )}
                {trainerType === 'class' && selected?.classTrainer && (
                  <span className="text-gray-500 text-xs block mt-0.5">Current Class Trainer: {selected.classTrainer?.name || '—'}</span>
                )}
              </p>

              <form onSubmit={handleAssignTrainer} className="space-y-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">
                    Select {trainerType === 'personal' ? 'Personal' : 'Class'} Trainer
                  </label>
                  <select value={trainerAssign} onChange={(e) => setTrainerAssign(e.target.value)} className="input-field text-sm">
                    <option value="">— Remove assignment —</option>
                    {trainers.map((t) => (
                      <option key={t._id} value={t._id}>{t.name} — {t.speciality}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-dark-500 text-gray-400 text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all disabled:opacity-60 ${trainerType === 'personal' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                    {saving ? 'Saving...' : 'Assign'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Branch Transfer Modal */}
      <AnimatePresence>
        {modal === 'transfer' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>BRANCH TRANSFER</h2>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <p className="text-gray-400 text-sm mb-1">Transferring <span className="text-white font-medium">{selected?.name}</span></p>
              {selected?.branch && <p className="text-gray-500 text-xs mb-4">Current branch: <span className="text-gray-300">{selected.branch?.name || '—'}</span></p>}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-4">
                <p className="text-yellow-400 text-xs">⚠ A transfer fee applies based on the destination branch's fee setting.</p>
              </div>
              <form onSubmit={handleBranchTransfer} className="space-y-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Transfer to Branch *</label>
                  <select required value={transferBranch} onChange={(e) => setTransferBranch(e.target.value)} className="input-field text-sm">
                    <option value="">Select branch</option>
                    {branches.filter((b) => b._id !== selected?.branch?._id).map((b) => (
                      <option key={b._id} value={b._id}>{b.name} — {b.location} (Fee: ₹{b.transferFee})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Notes</label>
                  <input value={transferNotes} onChange={(e) => setTransferNotes(e.target.value)} placeholder="Reason for transfer..." className="input-field text-sm" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-dark-500 text-gray-400 text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">{saving ? 'Transferring...' : 'Transfer'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Member Modal */}
      <AnimatePresence>
        {modal === 'view' && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-7 py-5 border-b border-dark-400">
                <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>MEMBER DETAILS</h2>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>

              <div className="flex gap-0 divide-x divide-dark-400">
                {/* Left column — identity */}
                <div className="w-72 flex-shrink-0 p-6 flex flex-col items-center text-center">
                  {selected.avatar ? (
                    <img src={selected.avatar} alt={selected.name} className="w-28 h-28 rounded-2xl object-cover mb-4 border-2 border-dark-400" />
                  ) : (
                    <div className="w-28 h-28 bg-primary/20 rounded-2xl flex items-center justify-center text-primary text-5xl font-black mb-4 border-2 border-dark-400">{selected.name?.charAt(0)}</div>
                  )}
                  <h3 className="text-white font-black text-xl mb-1" style={{ fontFamily: 'Oswald' }}>{selected.name}</h3>
                  {selected.regNo && <span className="text-xs px-3 py-1 rounded-lg bg-primary/10 text-primary font-mono font-semibold mb-2">{selected.regNo}</span>}
                  <span className={`text-xs px-3 py-1.5 rounded-full font-semibold capitalize mb-4 ${statusColors[selected.membership?.status] || 'bg-gray-500/10 text-gray-400'}`}>{selected.membership?.status || 'no plan'}</span>

                  <div className="w-full space-y-2 text-left">
                    {[
                      { label: 'Email', value: selected.email, icon: FaEnvelope },
                      { label: 'Phone', value: selected.phone || '—', icon: FaPhone },
                      { label: 'Goal', value: selected.goal || '—', icon: FaBullseye },
                      { label: 'Referred By', value: selected.referredBy?.name || '—', icon: FaPhone },
                      { label: 'Joined', value: selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—', icon: FaCalendar },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="p-2.5 bg-dark-300 rounded-xl">
                        <div className="flex items-center gap-1.5 mb-0.5"><Icon className="text-primary text-[10px]" /><span className="text-gray-500 text-[10px] uppercase tracking-wide">{label}</span></div>
                        <p className="text-gray-200 text-sm font-medium truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right column — membership & assignment */}
                <div className="flex-1 p-6">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-3 font-semibold">Membership</p>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { label: 'Plan', value: selected.membership?.plan?.name || 'None', icon: FaCrown },
                      { label: 'Package', value: selected.membership?.package ? selected.membership.package.charAt(0).toUpperCase() + selected.membership.package.slice(1) : '—', icon: FaCalendar },
                      { label: 'Personal Trainer', value: selected.personalTrainer?.name || '—', icon: FaUserTie },
                      { label: 'Class Trainer', value: selected.classTrainer?.name || '—', icon: FaDumbbell },
                      { label: 'Branch', value: selected.branch?.name || '—', icon: FaMapMarkerAlt },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="p-3 bg-dark-300 rounded-xl">
                        <div className="flex items-center gap-2 mb-1"><Icon className="text-primary text-xs" /><span className="text-gray-500 text-xs">{label}</span></div>
                        <p className="text-gray-200 text-sm font-medium truncate">{value}</p>
                      </div>
                    ))}
                    {selected.membership?.startDate && (
                      <div className="p-3 bg-dark-300 rounded-xl col-span-2">
                        <p className="text-gray-500 text-xs mb-1">Membership Period</p>
                        <p className="text-gray-200 text-sm">{new Date(selected.membership.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} → {selected.membership.endDate ? new Date(selected.membership.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Ongoing'}</p>
                      </div>
                    )}
                  </div>

                  {(selected.membership?.joiningDate || selected.membership?.paymentDate || selected.membership?.nextPaymentDate) && (
                    <>
                      <p className="text-gray-500 text-xs uppercase tracking-widest mb-3 font-semibold">Payment Dates</p>
                      <div className="grid grid-cols-3 gap-3 mb-5">
                        {[
                          { label: 'Joining Date', value: selected.membership?.joiningDate, color: 'text-blue-400' },
                          { label: 'Payment Date', value: selected.membership?.paymentDate, color: 'text-green-400' },
                          { label: 'Next Payment', value: selected.membership?.nextPaymentDate, color: 'text-yellow-400' },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="p-3 bg-dark-300 rounded-xl">
                            <p className="text-gray-500 text-xs mb-1">{label}</p>
                            <p className={`text-sm font-semibold ${color}`}>{value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 mt-auto pt-2">
                    <button onClick={() => { setModal(null); openEdit(selected) }} className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2"><FaEdit className="text-xs" /> Edit Member</button>
                    <button onClick={() => setModal(null)} className="px-6 bg-dark-300 hover:bg-dark-400 text-gray-300 rounded-full transition-colors text-sm">Close</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-sm p-6 text-center"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-400" />
              </div>
              <h3 className="text-white font-bold mb-2">Delete Member</h3>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to delete <span className="text-white font-medium">{deleteTarget.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-dark-500 text-gray-400 hover:text-white transition-all text-sm">
                  Cancel
                </button>
                <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all">
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
