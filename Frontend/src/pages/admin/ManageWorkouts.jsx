import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaDumbbell, FaPlus, FaEdit, FaTrash, FaTimes, FaBars, FaUsers,
  FaUserTie, FaCrown, FaHome, FaSignOutAlt,
  FaMapMarkerAlt, FaImages, FaAppleAlt, FaToggleOn, FaToggleOff, FaEye,
  FaClock, FaFire, FaUserFriends, FaExchangeAlt, FaGlobe, FaLayerGroup, FaChevronDown,
  FaCalendarAlt, FaRunning, FaCheck, FaCopy, FaFileAlt, FaTachometerAlt, FaQuoteLeft, FaLink,
  FaPalette,
  FaDatabase, FaTag,
} from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { validate, required, minLen, positiveNum, nonNegative, fieldClass } from '../../utils/validate'

const Err = ({ msg }) => msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null

function RichTextEditor({ value, onChange, placeholder = 'Write description...' }) {
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = value || ''
  }, [])

  const exec = (cmd, val = null) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    if (onChange) onChange(editorRef.current?.innerHTML || '')
  }

  const insertImportant = () => {
    editorRef.current?.focus()
    const sel = window.getSelection()
    const text = sel && sel.rangeCount > 0 && !sel.isCollapsed ? sel.toString() : 'important'
    document.execCommand('insertHTML', false,
      `<mark style="background:rgba(244,162,97,0.2);color:#f4a261;padding:0 3px;border-radius:3px;font-weight:600">${text}</mark>`)
    if (onChange) onChange(editorRef.current?.innerHTML || '')
  }

  const Btn = ({ onAction, title, children }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onAction() }}
      className="w-7 h-7 flex items-center justify-center rounded text-gray-300 hover:bg-dark-200 hover:text-white transition-colors text-xs"
    >
      {children}
    </button>
  )

  return (
    <div className="border border-dark-500 rounded-xl overflow-hidden focus-within:border-primary/40 transition-colors">
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-dark-400/60 border-b border-dark-500 flex-wrap">
        <Btn onAction={() => exec('bold')} title="Bold"><strong className="font-black">B</strong></Btn>
        <Btn onAction={() => exec('italic')} title="Italic"><em>I</em></Btn>
        <div className="w-px h-4 bg-dark-500 mx-0.5" />
        <Btn onAction={() => exec('insertUnorderedList')} title="Bullet list">
          <svg viewBox="0 0 16 16" width="13" fill="currentColor"><circle cx="2" cy="4" r="1.5"/><rect x="5" y="3" width="10" height="2" rx="1"/><circle cx="2" cy="8" r="1.5"/><rect x="5" y="7" width="10" height="2" rx="1"/><circle cx="2" cy="12" r="1.5"/><rect x="5" y="11" width="10" height="2" rx="1"/></svg>
        </Btn>
        <Btn onAction={() => exec('insertOrderedList')} title="Numbered list">
          <svg viewBox="0 0 16 16" width="13" fill="currentColor"><text x="0" y="5" fontSize="5" fontFamily="monospace">1.</text><rect x="5" y="3" width="10" height="2" rx="1"/><text x="0" y="9" fontSize="5" fontFamily="monospace">2.</text><rect x="5" y="7" width="10" height="2" rx="1"/><text x="0" y="13" fontSize="5" fontFamily="monospace">3.</text><rect x="5" y="11" width="10" height="2" rx="1"/></svg>
        </Btn>
        <div className="w-px h-4 bg-dark-500 mx-0.5" />
        <Btn onAction={insertImportant} title="Highlight important text">
          <span style={{ color: '#f4a261' }} className="font-black text-sm">★</span>
        </Btn>
        <Btn onAction={() => exec('removeFormat')} title="Clear formatting">
          <span className="text-gray-500 text-base leading-none">⊘</span>
        </Btn>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange && onChange(e.currentTarget.innerHTML)}
        data-placeholder={placeholder}
        className="min-h-[110px] p-3 text-sm text-gray-300 outline-none bg-dark-300 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-0.5 [&_strong]:font-bold [&_strong]:text-white [&_em]:italic [&_mark]:rounded empty:before:content-[attr(data-placeholder)] empty:before:text-gray-600 empty:before:pointer-events-none"
      />
    </div>
  )
}

const RULES = {
  title: [required('Title'), minLen(2, 'Title')],
  category: [required('Category')],
  description: [required('Description'), minLen(5, 'Description')],
  level: [required('Level')],
  duration: [nonNegative('Duration')],
  caloriesBurn: [nonNegative('Calories burn')],
}

const ACTIVITY_TYPES = ['Yoga', 'HIIT', 'Zumba', 'Strength', 'Cardio', 'Dance', 'Combat', 'Pilates', 'CrossFit', 'General']
const ACTIVITY_STATUSES = ['upcoming', 'completed', 'cancelled']
const EMPTY_ACTIVITY = { title: '', description: '', activityType: 'General', date: '', time: '', trainerIds: [], branchId: '', status: 'upcoming' }

const CATEGORIES = ['Strength', 'Cardio', 'HIIT', 'Flexibility', 'Combat', 'Dance']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels']
const PACKAGES = ['monthly', 'quarterly', 'half-yearly', 'annual']
const PACKAGE_LABELS = { monthly: 'M', quarterly: 'Q', 'half-yearly': 'H', annual: 'A' }

const EMPTY_MEMBER_PLAN = {
  title: '',
  levelNumber: '',
  completionWeeks: '',
  promotionNote: '',
  days: [],
}

const EMPTY_DAY = { dayName: '', coachGuided: false, exercises: [] }
const EMPTY_EXERCISE = { name: '', sets: '', reps: '' }

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

const EMPTY = { title: '', category: '', description: '', level: '', duration: '', caloriesBurn: '', maxParticipants: '', image: '', showOnSite: true }

const levelColors = { Beginner: 'text-green-400 bg-green-500/10', Intermediate: 'text-yellow-400 bg-yellow-500/10', Advanced: 'text-red-400 bg-red-500/10', 'All Levels': 'text-blue-400 bg-blue-500/10' }

export default function ManageWorkouts() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Tabs: 'site' | 'member'
  const [planTab, setPlanTab] = useState('site')

  // Member plan state
  const [memberPlanForm, setMemberPlanForm] = useState(EMPTY_MEMBER_PLAN)
  const [memberPlanSaving, setMemberPlanSaving] = useState(false)
  const [editingMemberPlanId, setEditingMemberPlanId] = useState(null)
  const [selectedMemberPlan, setSelectedMemberPlan] = useState(null)
  const [expandedViewDays, setExpandedViewDays] = useState(new Set())
  const [expandedEditDays, setExpandedEditDays] = useState(new Set())

  // Activity state
  const [activities, setActivities] = useState([])
  const [activityModal, setActivityModal] = useState(null) // null | 'add' | {type:'edit',id}
  const [activityForm, setActivityForm] = useState(EMPTY_ACTIVITY)
  const [activitySaving, setActivitySaving] = useState(false)
  const [activityDeleteId, setActivityDeleteId] = useState(null)
  const [viewRegistrations, setViewRegistrations] = useState(null)
  const [viewActivity, setViewActivity] = useState(null)
  const [editorKey, setEditorKey] = useState(0)
  const [trainers, setTrainers] = useState([])
  const [branches, setBranches] = useState([])
  const [activityLoading, setActivityLoading] = useState(false)

  const toggleViewDay = (di) => setExpandedViewDays((prev) => {
    const next = new Set(prev); next.has(di) ? next.delete(di) : next.add(di); return next
  })
  const toggleEditDay = (di) => setExpandedEditDays((prev) => {
    const next = new Set(prev); next.has(di) ? next.delete(di) : next.add(di); return next
  })

  const fetchWorkouts = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/workouts?admin=true')
      setWorkouts(data.workouts || [])
    } catch {
      toast.error('Failed to load workouts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWorkouts() }, [])

  const fetchActivities = async () => {
    setActivityLoading(true)
    try {
      const { data } = await api.get('/activities?admin=true')
      setActivities(data.activities || [])
    } catch {
      toast.error('Failed to load activities')
    } finally {
      setActivityLoading(false)
    }
  }

  const fetchTrainersAndBranches = async () => {
    try {
      const [tRes, bRes] = await Promise.all([
        api.get('/trainers'),
        api.get('/branches'),
      ])
      setTrainers(tRes.data.trainers || [])
      setBranches(bRes.data.branches || [])
    } catch {}
  }

  const openAddActivity = () => {
    setActivityForm(EMPTY_ACTIVITY)
    setEditorKey((k) => k + 1)
    setActivityModal('add')
    fetchTrainersAndBranches()
  }

  const openEditActivity = (a) => {
    setActivityForm({
      title: a.title || '',
      description: a.description || '',
      activityType: a.activityType || 'General',
      date: a.date ? new Date(a.date).toISOString().split('T')[0] : '',
      time: a.time || '',
      trainerIds: (a.trainers || []).map((t) => t._id || t).filter(Boolean),
      branchId: a.branch?._id || '',
      status: a.status || 'upcoming',
    })
    setEditorKey((k) => k + 1)
    setActivityModal({ type: 'edit', id: a._id })
    fetchTrainersAndBranches()
  }

  const handleSaveActivity = async () => {
    if (!activityForm.title.trim()) return toast.error('Title is required')
    if (!activityForm.date) return toast.error('Date is required')
    const payload = {
      title: activityForm.title.trim(),
      description: activityForm.description || undefined,
      activityType: activityForm.activityType,
      date: activityForm.date,
      time: activityForm.time.trim() || undefined,
      trainers: activityForm.trainerIds.length ? activityForm.trainerIds : [],
      branch: activityForm.branchId || undefined,
      status: activityForm.status,
    }
    setActivitySaving(true)
    try {
      if (activityModal === 'add') {
        const { data } = await api.post('/activities', payload)
        setActivities((prev) => [data.activity, ...prev])
        toast.success('Activity created!')
      } else {
        const { data } = await api.put(`/activities/${activityModal.id}`, payload)
        setActivities((prev) => prev.map((a) => (a._id === activityModal.id ? data.activity : a)))
        toast.success('Activity updated!')
      }
      setActivityModal(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setActivitySaving(false)
    }
  }

  const handleDeleteActivity = async (id) => {
    try {
      await api.delete(`/activities/${id}`)
      setActivities((prev) => prev.filter((a) => a._id !== id))
      toast.success('Activity deleted')
      setActivityDeleteId(null)
    } catch {
      toast.error('Delete failed')
    }
  }

  const openMemberPlanModal = () => {
    setEditingMemberPlanId(null)
    setMemberPlanForm(EMPTY_MEMBER_PLAN)
    setExpandedEditDays(new Set())
    setModal('member-add')
  }

  const openMemberPlanEdit = (w) => {
    setExpandedEditDays(new Set())
    setEditingMemberPlanId(w._id)
    setMemberPlanForm({
      title: w.title || '',
      levelNumber: w.levelNumber !== undefined ? String(w.levelNumber) : '',
      completionWeeks: w.completionWeeks !== undefined ? String(w.completionWeeks) : '',
      promotionNote: w.promotionNote || '',
      days: (w.days || []).map((d) => ({
        dayName: d.dayName || '',
        coachGuided: !!d.coachGuided,
        exercises: (d.exercises || []).map((e) => ({
          name: e.name || '',
          sets: e.sets !== undefined ? String(e.sets) : '',
          reps: e.reps || '',
        })),
      })),
    })
    setModal('member-edit')
  }

  const mpf = (field, val) => setMemberPlanForm((p) => ({ ...p, [field]: val }))

  const addDay = () => {
    setMemberPlanForm((p) => {
      const newIndex = p.days.length
      setExpandedEditDays((prev) => { const next = new Set(prev); next.add(newIndex); return next })
      return { ...p, days: [...p.days, { ...EMPTY_DAY, exercises: [] }] }
    })
  }

  const removeDay = (di) => {
    setMemberPlanForm((p) => ({ ...p, days: p.days.filter((_, i) => i !== di) }))
  }

  const updateDay = (di, field, val) => {
    setMemberPlanForm((p) => {
      const days = [...p.days]
      days[di] = { ...days[di], [field]: val }
      return { ...p, days }
    })
  }

  const addExercise = (di) => {
    setMemberPlanForm((p) => {
      const days = [...p.days]
      days[di] = { ...days[di], exercises: [...(days[di].exercises || []), { ...EMPTY_EXERCISE }] }
      return { ...p, days }
    })
  }

  const removeExercise = (di, ei) => {
    setMemberPlanForm((p) => {
      const days = [...p.days]
      days[di] = { ...days[di], exercises: days[di].exercises.filter((_, i) => i !== ei) }
      return { ...p, days }
    })
  }

  const updateExercise = (di, ei, field, val) => {
    setMemberPlanForm((p) => {
      const days = [...p.days]
      const exs = [...days[di].exercises]
      exs[ei] = { ...exs[ei], [field]: val }
      days[di] = { ...days[di], exercises: exs }
      return { ...p, days }
    })
  }

  const handleSaveMemberPlan = async () => {
    if (!memberPlanForm.title.trim()) return toast.error('Title is required')
    const payload = {
      planType: 'member',
      showOnSite: false,
      title: memberPlanForm.title.trim(),
      levelNumber: memberPlanForm.levelNumber ? Number(memberPlanForm.levelNumber) : undefined,
      completionWeeks: memberPlanForm.completionWeeks ? Number(memberPlanForm.completionWeeks) : undefined,
      promotionNote: memberPlanForm.promotionNote.trim() || undefined,
      days: memberPlanForm.days.map((d, i) => ({
        dayNumber: i + 1,
        dayName: d.dayName,
        coachGuided: d.coachGuided,
        exercises: d.exercises.filter((e) => e.name.trim()).map((e) => ({
          name: e.name.trim(),
          sets: e.sets ? Number(e.sets) : undefined,
          reps: e.reps || undefined,
        })),
      })).filter((d) => d.dayName.trim()),
    }
    setMemberPlanSaving(true)
    try {
      if (editingMemberPlanId) {
        const { data } = await api.put(`/workouts/${editingMemberPlanId}`, payload)
        setWorkouts((prev) => prev.map((w) => (w._id === editingMemberPlanId ? data.workout : w)))
        toast.success('Member plan updated!')
      } else {
        const { data } = await api.post('/workouts', payload)
        setWorkouts((prev) => [data.workout, ...prev])
        toast.success('Member plan created!')
      }
      setModal(null)
      setEditingMemberPlanId(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setMemberPlanSaving(false)
    }
  }

  const handleCopyMemberPlan = async (w) => {
    const payload = {
      planType: 'member',
      showOnSite: false,
      title: `${w.title} (Copy)`,
      levelNumber: w.levelNumber,
      completionWeeks: w.completionWeeks,
      promotionNote: w.promotionNote,
      days: (w.days || []).map((d) => ({
        dayNumber: d.dayNumber,
        dayName: d.dayName,
        coachGuided: d.coachGuided,
        exercises: (d.exercises || []).map((e) => ({ name: e.name, sets: e.sets, reps: e.reps })),
      })),
    }
    try {
      const { data } = await api.post('/workouts', payload)
      setWorkouts((prev) => [data.workout, ...prev])
      toast.success('Plan duplicated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Duplicate failed')
    }
  }

  const openAdd = () => { setForm(EMPTY); setFormErrors({}); setModal('add') }
  const openEdit = (w) => {
    setForm({
      title: w.title || '',
      category: w.category || '',
      description: w.description || '',
      level: w.level || '',
      duration: w.duration ?? '',
      caloriesBurn: w.caloriesBurn ?? '',
      maxParticipants: w.maxParticipants ?? '',
      image: w.image || '',
      showOnSite: w.showOnSite !== false,
    })
    setFormErrors({})
    setModal({ type: 'edit', id: w._id })
  }
  const closeModal = () => { setModal(null); setFormErrors({}) }

  const handleSave = async () => {
    const errs = validate(form, RULES)
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    const payload = {
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      level: form.level,
      duration: form.duration ? Number(form.duration) : undefined,
      caloriesBurn: form.caloriesBurn ? Number(form.caloriesBurn) : undefined,
      maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
      image: form.image.trim() || undefined,
      showOnSite: form.showOnSite,
    }

    try {
      setSaving(true)
      if (modal === 'add') {
        const { data } = await api.post('/workouts', payload)
        setWorkouts((prev) => [data.workout, ...prev])
        toast.success('Workout created')
      } else {
        const { data } = await api.put(`/workouts/${modal.id}`, payload)
        setWorkouts((prev) => prev.map((w) => (w._id === modal.id ? data.workout : w)))
        toast.success('Workout updated')
      }
      closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const toggleShowOnSite = async (w) => {
    try {
      const { data } = await api.put(`/workouts/${w._id}`, { showOnSite: !w.showOnSite })
      setWorkouts((prev) => prev.map((item) => (item._id === w._id ? data.workout : item)))
      toast.success(data.workout.showOnSite ? 'Now visible on site' : 'Hidden from site')
    } catch {
      toast.error('Toggle failed')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/workouts/${id}`)
      setWorkouts((prev) => prev.filter((w) => w._id !== id))
      toast.success('Workout removed')
      setDeleteId(null)
    } catch {
      toast.error('Delete failed')
    }
  }

  const fc = (field) => fieldClass(formErrors, field, 'input-field text-sm')

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>WORKOUT PROGRAMS</h1>
                <p className="text-gray-400 text-sm">Manage workout programs and member plans</p>
              </div>
              {planTab === 'site' && (
                <motion.button whileHover={{ scale: 1.05 }} onClick={openAdd} className="btn-primary text-sm py-2.5 flex items-center gap-2">
                  <FaPlus className="text-xs" /> Add Workout
                </motion.button>
              )}
              {planTab === 'member' && (
                <motion.button whileHover={{ scale: 1.05 }} onClick={openMemberPlanModal} className="btn-primary text-sm py-2.5 flex items-center gap-2">
                  <FaPlus className="text-xs" /> Create Member Plan
                </motion.button>
              )}
              {planTab === 'activity' && (
                <motion.button whileHover={{ scale: 1.05 }} onClick={openAddActivity} className="btn-primary text-sm py-2.5 flex items-center gap-2">
                  <FaPlus className="text-xs" /> Add Activity
                </motion.button>
              )}
            </div>

            {/* Plan Type Tabs */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setPlanTab('site')}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${planTab === 'site' ? 'bg-primary text-white' : 'bg-dark-300 text-gray-400 border border-dark-500 hover:text-white'}`}
              >
                <FaDumbbell className="text-xs" /> Site Plans
              </button>
              <button
                onClick={() => setPlanTab('member')}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${planTab === 'member' ? 'bg-primary text-white' : 'bg-dark-300 text-gray-400 border border-dark-500 hover:text-white'}`}
              >
                <FaLayerGroup className="text-xs" /> Member Plans
              </button>
              <button
                onClick={() => { setPlanTab('activity'); if (activities.length === 0) fetchActivities() }}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${planTab === 'activity' ? 'bg-primary text-white' : 'bg-dark-300 text-gray-400 border border-dark-500 hover:text-white'}`}
              >
                <FaCalendarAlt className="text-xs" /> Activities
              </button>
            </div>

            {/* SITE PLANS TAB */}
            {planTab === 'site' && (
              loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : workouts.filter((w) => w.planType !== 'member').length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <FaDumbbell className="text-4xl text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No site workout programs yet. Add your first one.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {workouts.filter((w) => w.planType !== 'member').map((w, i) => (
                    <motion.div
                      key={w._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`glass-card overflow-hidden transition-all ${w.showOnSite ? 'border-dark-400' : 'border-dark-500 opacity-70'}`}
                    >
                      {w.image && (
                        <div className="h-36 overflow-hidden">
                          <img src={w.image} alt={w.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-white font-bold text-sm leading-tight">{w.title}</h3>
                            <span className="text-xs text-primary">{w.category}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${levelColors[w.level] || 'text-gray-400 bg-dark-400'}`}>
                            {w.level}
                          </span>
                        </div>
                        {w.description && <p className="text-gray-500 text-xs mb-3 line-clamp-2">{w.description}</p>}
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                          {w.duration && <span>{w.duration} min</span>}
                          {w.caloriesBurn && <span>{w.caloriesBurn} cal</span>}
                          {w.maxParticipants && <span>{w.maxParticipants} max</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleShowOnSite(w)}
                            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors ${
                              w.showOnSite ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25' : 'bg-dark-400 text-gray-500 hover:bg-dark-300'
                            }`}
                          >
                            {w.showOnSite ? <FaToggleOn className="text-base" /> : <FaToggleOff className="text-base" />}
                            {w.showOnSite ? 'On Site' : 'Hidden'}
                          </button>
                          <button
                            onClick={() => { setSelected(w); setModal('view') }}
                            className="w-7 h-7 bg-green-500/10 hover:bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 transition-colors ml-auto" title="View"
                          >
                            <FaEye className="text-xs" />
                          </button>
                          <button
                            onClick={() => openEdit(w)}
                            className="w-7 h-7 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 transition-colors" title="Edit"
                          >
                            <FaEdit className="text-xs" />
                          </button>
                          <button
                            onClick={() => setDeleteId(w._id)}
                            className="w-7 h-7 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 transition-colors"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            )}

            {/* MEMBER PLANS TAB */}
            {planTab === 'member' && (
              loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : workouts.filter((w) => w.planType === 'member').length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <FaLayerGroup className="text-4xl text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No member plans yet. Create the first one.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {workouts.filter((w) => w.planType === 'member').map((w, i) => (
                    <motion.div
                      key={w._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card p-4"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-white font-bold text-sm">{w.title}</h3>
                          {w.levelNumber && <span className="text-xs text-primary">Level {w.levelNumber}</span>}
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 flex-shrink-0">Member</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                        {w.completionWeeks && <span>{w.completionWeeks} weeks</span>}
                        {w.days?.length > 0 && <span>{w.days.length} days</span>}
                        {w.targetPackages?.length > 0 && (
                          <span className="text-gray-400">{w.targetPackages.map((p) => PACKAGE_LABELS[p] || p).join(', ')}</span>
                        )}
                      </div>
                      {w.promotionNote && <p className="text-gray-500 text-xs mb-3 line-clamp-2">{w.promotionNote}</p>}
                      {w.assignedTo?.length > 0 && (
                        <div className="text-xs text-gray-500 mb-3">Assigned to {w.assignedTo.length} member(s)</div>
                      )}
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => { setSelectedMemberPlan(w); setExpandedViewDays(new Set()); setModal('member-view') }}
                          className="w-7 h-7 bg-green-500/10 hover:bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 transition-colors" title="View"
                        >
                          <FaEye className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleCopyMemberPlan(w)}
                          className="w-7 h-7 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg flex items-center justify-center text-yellow-400 transition-colors" title="Duplicate"
                        >
                          <FaCopy className="text-xs" />
                        </button>
                        <button
                          onClick={() => openMemberPlanEdit(w)}
                          className="w-7 h-7 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 transition-colors" title="Edit"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button
                          onClick={() => setDeleteId(w._id)}
                          className="w-7 h-7 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 transition-colors"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            )}
            {/* ACTIVITY TAB */}
            {planTab === 'activity' && (
              activityLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : activities.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <FaCalendarAlt className="text-4xl text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No activities yet. Create the first one.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {activities.map((a, i) => {
                    const isPast = new Date(a.date) < new Date() && a.status === 'upcoming'
                    const statusColors = { upcoming: 'text-green-400 bg-green-500/10', completed: 'text-blue-400 bg-blue-500/10', cancelled: 'text-red-400 bg-red-500/10' }
                    return (
                      <motion.div
                        key={a._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`glass-card p-4 ${a.status === 'cancelled' ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold text-sm truncate">{a.title}</h3>
                            <span className="text-xs text-primary">{a.activityType}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 capitalize ${statusColors[a.status] || 'text-gray-400 bg-dark-400'}`}>
                            {a.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mb-2">
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt className="text-gray-600" />
                            {new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            {a.time && ` · ${a.time}`}
                          </span>
                          {a.branch && <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-gray-600" />{a.branch.name}</span>}
                        </div>

                        {a.trainers?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {a.trainers.map((t) => (
                              <span key={t._id} className="flex items-center gap-1 text-xs bg-dark-400 text-gray-300 px-2 py-0.5 rounded-full">
                                <FaUserTie className="text-gray-500 text-xs" />{t.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {a.description && (
                          <div
                            className="text-gray-500 text-xs mb-3 line-clamp-3 [&_strong]:font-bold [&_strong]:text-gray-400 [&_mark]:rounded [&_ul]:list-disc [&_ul]:pl-3 [&_ol]:list-decimal [&_ol]:pl-3"
                            dangerouslySetInnerHTML={{ __html: a.description }}
                          />
                        )}

                        <div className="flex items-center gap-2 mt-auto pt-1">
                          <button
                            onClick={() => setViewRegistrations(a)}
                            className="flex items-center gap-1.5 text-xs bg-dark-400 hover:bg-dark-300 text-gray-300 px-2.5 py-1.5 rounded-lg transition-colors mr-auto"
                          >
                            <FaUsers className="text-gray-500" />
                            {a.registeredUsers?.length || 0} joined
                          </button>
                          <button
                            onClick={() => { const live = activities.find((x) => x._id === a._id) || a; setViewActivity(live) }}
                            className="w-7 h-7 bg-green-500/10 hover:bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 transition-colors" title="View"
                          >
                            <FaEye className="text-xs" />
                          </button>
                          <button
                            onClick={() => openEditActivity(a)}
                            className="w-7 h-7 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 transition-colors" title="Edit"
                          >
                            <FaEdit className="text-xs" />
                          </button>
                          <button
                            onClick={() => setActivityDeleteId(a._id)}
                            className="w-7 h-7 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 transition-colors"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )
            )}
          </div>
        </main>
      </div>

      {/* View Workout Modal */}
      <AnimatePresence>
        {modal === 'view' && selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => { setModal(null); setSelected(null) }}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-dark-200 border border-dark-400 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {selected.image && (
                <div className="h-48 overflow-hidden rounded-t-2xl">
                  <img src={selected.image} alt={selected.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>{selected.title}</h3>
                    <span className="text-primary text-sm">{selected.category}</span>
                  </div>
                  <button onClick={() => { setModal(null); setSelected(null) }} className="text-gray-500 hover:text-white flex-shrink-0"><FaTimes /></button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`text-xs px-3 py-1 rounded-full ${levelColors[selected.level] || 'text-gray-400 bg-dark-400'}`}>{selected.level}</span>
                  <span className={`text-xs px-3 py-1 rounded-full ${selected.showOnSite ? 'bg-green-500/15 text-green-400' : 'bg-dark-400 text-gray-500'}`}>
                    {selected.showOnSite ? 'Visible on Site' : 'Hidden from Site'}
                  </span>
                </div>

                {selected.description && (
                  <p className="text-gray-400 text-sm leading-relaxed mb-5">{selected.description}</p>
                )}

                <div className="grid grid-cols-3 gap-3 mb-5">
                  {selected.duration && (
                    <div className="bg-dark-300 rounded-xl p-3 text-center">
                      <FaClock className="text-primary mx-auto mb-1" />
                      <p className="text-white font-bold text-sm">{selected.duration}</p>
                      <p className="text-gray-500 text-xs">min</p>
                    </div>
                  )}
                  {selected.caloriesBurn && (
                    <div className="bg-dark-300 rounded-xl p-3 text-center">
                      <FaFire className="text-orange-400 mx-auto mb-1" />
                      <p className="text-white font-bold text-sm">{selected.caloriesBurn}</p>
                      <p className="text-gray-500 text-xs">calories</p>
                    </div>
                  )}
                  {selected.maxParticipants && (
                    <div className="bg-dark-300 rounded-xl p-3 text-center">
                      <FaUserFriends className="text-blue-400 mx-auto mb-1" />
                      <p className="text-white font-bold text-sm">{selected.maxParticipants}</p>
                      <p className="text-gray-500 text-xs">max</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setModal(null); setSelected(null); setTimeout(() => openEdit(selected), 100) }}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-2.5 rounded-full text-sm transition-colors"
                  >
                    <FaEdit className="text-xs" /> Edit
                  </button>
                  <button
                    onClick={() => { setModal(null); setSelected(null) }}
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

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {(modal === 'add' || modal?.type === 'edit') && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-dark-200 border border-dark-400 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>
                  {modal === 'add' ? 'ADD WORKOUT' : 'EDIT WORKOUT'}
                </h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-white"><FaTimes /></button>
              </div>

              <form className="space-y-4" noValidate onSubmit={(e) => { e.preventDefault(); handleSave() }}>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Title <span className="text-red-400">*</span></label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Power Lifting Fundamentals" className={fc('title')} />
                  <Err msg={formErrors.title} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Category <span className="text-red-400">*</span></label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={fc('category')}>
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <Err msg={formErrors.category} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Level <span className="text-red-400">*</span></label>
                    <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className={fc('level')}>
                      <option value="">Select level</option>
                      {LEVELS.map((l) => <option key={l}>{l}</option>)}
                    </select>
                    <Err msg={formErrors.level} />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Description <span className="text-red-400">*</span></label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${fc('description')} resize-none`} placeholder="Describe the workout program..." />
                  <Err msg={formErrors.description} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Duration (min)</label>
                    <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="60" className={fc('duration')} />
                    <Err msg={formErrors.duration} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Calories Burn</label>
                    <input type="number" value={form.caloriesBurn} onChange={(e) => setForm({ ...form, caloriesBurn: e.target.value })} placeholder="400" className={fc('caloriesBurn')} />
                    <Err msg={formErrors.caloriesBurn} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Max Participants</label>
                    <input type="number" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} placeholder="20" className="input-field text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Image URL</label>
                  <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." className="input-field text-sm" />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="wShowOnSite"
                    checked={form.showOnSite}
                    onChange={(e) => setForm({ ...form, showOnSite: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <label htmlFor="wShowOnSite" className="text-gray-400 text-sm cursor-pointer">Show on public site</label>
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
                        Saving...
                      </span>
                    ) : modal === 'add' ? 'Create Workout' : 'Save Changes'}
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
              <h3 className="text-white font-bold mb-2">Remove Workout?</h3>
              <p className="text-gray-400 text-sm mb-6">This workout will be deactivated.</p>
              <div className="flex gap-3">
                <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-full font-semibold transition-colors text-sm">Remove</button>
                <button onClick={() => setDeleteId(null)} className="flex-1 bg-dark-300 hover:bg-dark-400 text-gray-300 py-2.5 rounded-full transition-colors text-sm">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Member Plan View Modal */}
      <AnimatePresence>
        {modal === 'member-view' && selectedMemberPlan && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => { setModal(null); setSelectedMemberPlan(null) }}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-dark-200 border border-dark-400 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>{selectedMemberPlan.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">Member Plan</span>
                    {selectedMemberPlan.levelNumber && <span className="text-xs text-primary">Level {selectedMemberPlan.levelNumber}</span>}
                    {selectedMemberPlan.completionWeeks && <span className="text-xs text-gray-500">{selectedMemberPlan.completionWeeks} weeks</span>}
                  </div>
                </div>
                <button onClick={() => { setModal(null); setSelectedMemberPlan(null) }} className="text-gray-500 hover:text-white flex-shrink-0"><FaTimes /></button>
              </div>

              {selectedMemberPlan.promotionNote && (
                <p className="text-gray-400 text-sm mb-5 bg-dark-300 rounded-xl px-4 py-3 border-l-4 border-primary">{selectedMemberPlan.promotionNote}</p>
              )}

              {(!selectedMemberPlan.days || selectedMemberPlan.days.length === 0) ? (
                <p className="text-gray-500 text-sm text-center py-8">No days/exercises in this plan.</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-gray-500 text-xs">{selectedMemberPlan.days.length} day{selectedMemberPlan.days.length !== 1 ? 's' : ''}</span>
                    <button
                      type="button"
                      onClick={() => setExpandedViewDays(expandedViewDays.size > 0 ? new Set() : new Set(selectedMemberPlan.days.map((_, i) => i)))}
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      {expandedViewDays.size > 0 ? 'Collapse All' : 'Expand All'}
                    </button>
                  </div>
                  {selectedMemberPlan.days.map((day, di) => {
                    const isExpanded = expandedViewDays.has(di)
                    return (
                      <div key={di} className="bg-dark-300 rounded-xl border border-dark-500 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleViewDay(di)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 bg-dark-400/50 hover:bg-dark-400/80 transition-colors text-left"
                        >
                          <span className="text-xs text-primary font-semibold w-10 flex-shrink-0">Day {day.dayNumber || di + 1}</span>
                          <span className="text-white text-sm font-medium flex-1">{day.dayName}</span>
                          {day.coachGuided && <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full flex-shrink-0">Coach Guided</span>}
                          {day.exercises?.length > 0 && (
                            <span className="text-xs text-gray-500 flex-shrink-0">{day.exercises.length} ex</span>
                          )}
                          <FaChevronDown className={`text-gray-500 text-xs flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        {isExpanded && (
                          day.exercises?.length > 0 ? (
                            <div className="px-4 py-3 border-t border-dark-500">
                              <div className="grid grid-cols-[1fr_56px_72px] gap-2 mb-1.5 px-1">
                                <span className="text-gray-500 text-xs font-medium">Exercise</span>
                                <span className="text-gray-500 text-xs font-medium text-center">Sets</span>
                                <span className="text-gray-500 text-xs font-medium text-center">Reps</span>
                              </div>
                              {day.exercises.map((ex, ei) => (
                                <div key={ei} className="grid grid-cols-[1fr_56px_72px] gap-2 py-1.5 border-b border-dark-500/50 last:border-0">
                                  <span className="text-white text-sm">{ex.name}</span>
                                  <span className="text-gray-400 text-sm text-center">{ex.sets ?? '—'}</span>
                                  <span className="text-gray-400 text-sm text-center">{ex.reps || '—'}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-600 text-xs px-4 py-3 border-t border-dark-500">No exercises — rest day.</p>
                          )
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { const plan = selectedMemberPlan; setModal(null); setSelectedMemberPlan(null); setTimeout(() => openMemberPlanEdit(plan), 100) }}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-2.5 rounded-full text-sm transition-colors"
                >
                  <FaEdit className="text-xs" /> Edit Plan
                </button>
                <button onClick={() => { setModal(null); setSelectedMemberPlan(null) }} className="px-6 bg-dark-300 hover:bg-dark-400 text-gray-300 py-2.5 rounded-full transition-colors text-sm">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Member Plan Create / Edit Modal */}
      <AnimatePresence>
        {(modal === 'member-add' || modal === 'member-edit') && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => { setModal(null); setEditingMemberPlanId(null) }}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-dark-200 border border-dark-400 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>
                  {modal === 'member-edit' ? 'EDIT MEMBER PLAN' : 'CREATE MEMBER PLAN'}
                </h3>
                <button onClick={() => { setModal(null); setEditingMemberPlanId(null) }} className="text-gray-500 hover:text-white"><FaTimes /></button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Plan Title <span className="text-red-400">*</span></label>
                  <input value={memberPlanForm.title} onChange={(e) => mpf('title', e.target.value)} placeholder="e.g. Beginner Strength Plan" className="input-field text-sm" />
                </div>

                {/* Level + Weeks */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Level Number</label>
                    <input type="number" value={memberPlanForm.levelNumber} onChange={(e) => mpf('levelNumber', e.target.value)} placeholder="1" className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Completion Weeks</label>
                    <input type="number" value={memberPlanForm.completionWeeks} onChange={(e) => mpf('completionWeeks', e.target.value)} placeholder="8" className="input-field text-sm" />
                  </div>
                </div>

                {/* Promotion Note */}
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Promotion Note</label>
                  <input value={memberPlanForm.promotionNote} onChange={(e) => mpf('promotionNote', e.target.value)} placeholder="e.g. Complete to unlock Level 2" className="input-field text-sm" />
                </div>

                {/* Days / Exercises */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Days / Exercises</label>
                    <button type="button" onClick={addDay} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">
                      <FaPlus className="text-xs" /> Add Day
                    </button>
                  </div>

                  {memberPlanForm.days.length === 0 && (
                    <p className="text-gray-600 text-xs py-3 text-center">No days added yet. Click "Add Day" to build the workout schedule.</p>
                  )}

                  <div className="space-y-4">
                    {memberPlanForm.days.map((day, di) => {
                      const isEditExpanded = expandedEditDays.has(di)
                      return (
                        <div key={di} className="bg-dark-300 rounded-xl border border-dark-500 overflow-hidden">
                          {/* Day header */}
                          <div className="flex items-center gap-3 px-4 py-3 bg-dark-400/50 border-b border-dark-500">
                            <span className="text-xs text-primary font-semibold w-10 flex-shrink-0">Day {di + 1}</span>
                            <input
                              value={day.dayName}
                              onChange={(e) => updateDay(di, 'dayName', e.target.value)}
                              placeholder="e.g. Chest & Triceps"
                              className="input-field text-sm flex-1 py-1.5"
                            />
                            <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer flex-shrink-0 select-none">
                              <input type="checkbox" checked={day.coachGuided} onChange={(e) => updateDay(di, 'coachGuided', e.target.checked)} className="accent-primary" />
                              Coach
                            </label>
                            <button
                              type="button"
                              onClick={() => toggleEditDay(di)}
                              className="text-gray-400 hover:text-white flex-shrink-0 transition-colors"
                              title={isEditExpanded ? 'Collapse' : 'Expand exercises'}
                            >
                              <FaChevronDown className={`text-xs transition-transform duration-200 ${isEditExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            <button type="button" onClick={() => removeDay(di)} className="text-red-400 hover:text-red-300 flex-shrink-0" title="Remove day"><FaTimes /></button>
                          </div>

                          {/* Exercise table — only when expanded */}
                          {isEditExpanded && (
                            <div className="px-4 py-3">
                              {day.exercises.length > 0 && (
                                <div className="grid grid-cols-[1fr_64px_72px_24px] gap-2 mb-1.5 px-1">
                                  <span className="text-gray-500 text-xs font-medium">Title</span>
                                  <span className="text-gray-500 text-xs font-medium text-center">Sets</span>
                                  <span className="text-gray-500 text-xs font-medium text-center">Reps</span>
                                  <span />
                                </div>
                              )}
                              <div className="space-y-2">
                                {day.exercises.map((ex, ei) => (
                                  <div key={ei} className="grid grid-cols-[1fr_64px_72px_24px] gap-2 items-center">
                                    <input value={ex.name} onChange={(e) => updateExercise(di, ei, 'name', e.target.value)} placeholder="e.g. Bench Press" className="input-field text-xs py-1.5" />
                                    <input type="number" value={ex.sets} onChange={(e) => updateExercise(di, ei, 'sets', e.target.value)} placeholder="3" className="input-field text-xs py-1.5 text-center" />
                                    <input value={ex.reps} onChange={(e) => updateExercise(di, ei, 'reps', e.target.value)} placeholder="12-15" className="input-field text-xs py-1.5 text-center" />
                                    <button type="button" onClick={() => removeExercise(di, ei)} className="text-red-400 hover:text-red-300 text-xs flex items-center justify-center h-full"><FaTimes /></button>
                                  </div>
                                ))}
                              </div>
                              <button type="button" onClick={() => addExercise(di)} className="text-xs text-gray-500 hover:text-primary flex items-center gap-1 mt-3 transition-colors">
                                <FaPlus className="text-xs" /> Add Exercise
                              </button>
                            </div>
                          )}
                          {!isEditExpanded && (
                            <div className="px-4 py-2 text-xs text-gray-600">
                              {day.exercises.length > 0 ? `${day.exercises.length} exercise${day.exercises.length !== 1 ? 's' : ''}` : 'No exercises — click chevron to expand'}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="button"
                    disabled={memberPlanSaving}
                    whileHover={{ scale: 1.02 }}
                    onClick={handleSaveMemberPlan}
                    className="flex-1 btn-primary py-3 disabled:opacity-60 text-sm"
                  >
                    {memberPlanSaving ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : modal === 'member-edit' ? 'Save Changes' : 'Create Member Plan'}
                  </motion.button>
                  <button type="button" onClick={() => { setModal(null); setEditingMemberPlanId(null) }} className="px-6 bg-dark-300 hover:bg-dark-400 text-gray-300 rounded-full transition-colors text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Activity Add / Edit Modal */}
      <AnimatePresence>
        {activityModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setActivityModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-dark-200 border border-dark-400 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>
                  {activityModal === 'add' ? 'ADD ACTIVITY' : 'EDIT ACTIVITY'}
                </h3>
                <button onClick={() => setActivityModal(null)} className="text-gray-500 hover:text-white"><FaTimes /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Title <span className="text-red-400">*</span></label>
                  <input
                    value={activityForm.title}
                    onChange={(e) => setActivityForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Morning Yoga Class"
                    className="input-field text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Activity Type</label>
                    <select
                      value={activityForm.activityType}
                      onChange={(e) => setActivityForm((p) => ({ ...p, activityType: e.target.value }))}
                      className="input-field text-sm"
                    >
                      {ACTIVITY_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Status</label>
                    <select
                      value={activityForm.status}
                      onChange={(e) => setActivityForm((p) => ({ ...p, status: e.target.value }))}
                      className="input-field text-sm"
                    >
                      {ACTIVITY_STATUSES.map((s) => <option key={s} className="capitalize">{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Date <span className="text-red-400">*</span></label>
                    <input
                      type="date"
                      value={activityForm.date}
                      onChange={(e) => setActivityForm((p) => ({ ...p, date: e.target.value }))}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Time</label>
                    <input
                      value={activityForm.time}
                      onChange={(e) => setActivityForm((p) => ({ ...p, time: e.target.value }))}
                      placeholder="e.g. 07:00 AM"
                      className="input-field text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs mb-1 block">
                    Trainers (optional)
                    {activityForm.trainerIds.length > 0 && (
                      <span className="ml-1.5 text-primary">{activityForm.trainerIds.length} selected</span>
                    )}
                  </label>
                  {trainers.length === 0 ? (
                    <p className="text-gray-600 text-xs py-2">No trainers available.</p>
                  ) : (
                    <div className="border border-dark-500 rounded-xl bg-dark-300 max-h-40 overflow-y-auto divide-y divide-dark-500/50">
                      {trainers.map((t) => {
                        const checked = activityForm.trainerIds.includes(t._id)
                        return (
                          <label key={t._id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-dark-400/50 transition-colors select-none">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                setActivityForm((p) => ({
                                  ...p,
                                  trainerIds: e.target.checked
                                    ? [...p.trainerIds, t._id]
                                    : p.trainerIds.filter((id) => id !== t._id),
                                }))
                              }}
                              className="accent-primary w-3.5 h-3.5 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-gray-200">{t.name}</span>
                              {t.speciality && <span className="text-xs text-gray-500 ml-1.5">— {t.speciality}</span>}
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Branch (optional)</label>
                  <select
                    value={activityForm.branchId}
                    onChange={(e) => setActivityForm((p) => ({ ...p, branchId: e.target.value }))}
                    className="input-field text-sm"
                  >
                    <option value="">All branches</option>
                    {branches.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}{b.location ? ` — ${b.location}` : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Description</label>
                  <RichTextEditor
                    key={editorKey}
                    value={activityForm.description}
                    onChange={(v) => setActivityForm((p) => ({ ...p, description: v }))}
                    placeholder="Write a description... select text and use toolbar to format"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="button"
                    disabled={activitySaving}
                    whileHover={{ scale: 1.02 }}
                    onClick={handleSaveActivity}
                    className="flex-1 btn-primary py-3 disabled:opacity-60 text-sm"
                  >
                    {activitySaving ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : activityModal === 'add' ? 'Create Activity' : 'Save Changes'}
                  </motion.button>
                  <button type="button" onClick={() => setActivityModal(null)} className="px-6 bg-dark-300 hover:bg-dark-400 text-gray-300 rounded-full transition-colors text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity View Modal */}
      <AnimatePresence>
        {viewActivity && (() => {
          const a = activities.find((x) => x._id === viewActivity._id) || viewActivity
          const statusColors = { upcoming: 'text-green-400 bg-green-500/10 border-green-500/20', completed: 'text-blue-400 bg-blue-500/10 border-blue-500/20', cancelled: 'text-red-400 bg-red-500/10 border-red-500/20' }
          return (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
              onClick={() => setViewActivity(null)}
            >
              <motion.div
                initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
                className="bg-dark-200 border border-dark-400 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-dark-400 flex-shrink-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{a.activityType}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusColors[a.status] || 'text-gray-400 bg-dark-400'}`}>{a.status}</span>
                    </div>
                    <h3 className="text-xl font-black text-white mt-1" style={{ fontFamily: 'Oswald' }}>{a.title}</h3>
                  </div>
                  <button onClick={() => setViewActivity(null)} className="text-gray-500 hover:text-white flex-shrink-0 mt-1"><FaTimes /></button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

                  {/* Date / Time / Branch */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-dark-300 rounded-xl p-3">
                      <div className="text-gray-500 text-xs mb-0.5">Date</div>
                      <div className="text-white text-sm font-medium">
                        {new Date(a.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="bg-dark-300 rounded-xl p-3">
                      <div className="text-gray-500 text-xs mb-0.5">Time</div>
                      <div className="text-white text-sm font-medium">{a.time || '—'}</div>
                    </div>
                    <div className="bg-dark-300 rounded-xl p-3">
                      <div className="text-gray-500 text-xs mb-0.5">Branch</div>
                      <div className="text-white text-sm font-medium truncate">{a.branch?.name || 'All branches'}</div>
                    </div>
                  </div>

                  {/* Trainers */}
                  {a.trainers?.length > 0 && (
                    <div>
                      <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">Trainers ({a.trainers.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {a.trainers.map((t) => (
                          <div key={t._id} className="flex items-center gap-2 bg-dark-300 border border-dark-500 rounded-xl px-3 py-2">
                            <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                              {t.name?.charAt(0)}
                            </div>
                            <div>
                              <div className="text-white text-xs font-medium">{t.name}</div>
                              {t.speciality && <div className="text-gray-500 text-xs">{t.speciality}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {a.description && (
                    <div>
                      <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">Description</h4>
                      <div
                        className="text-gray-300 text-sm leading-relaxed bg-dark-300 rounded-xl p-4 [&_strong]:font-bold [&_strong]:text-white [&_em]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_mark]:rounded [&_mark]:px-1 [&_li]:leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: a.description }}
                      />
                    </div>
                  )}

                  {/* Registered Users */}
                  <div>
                    <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
                      Registered Participants ({a.registeredUsers?.length || 0})
                    </h4>
                    {!a.registeredUsers?.length ? (
                      <p className="text-gray-600 text-xs bg-dark-300 rounded-xl px-4 py-3">No one has registered yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {a.registeredUsers.map((u, i) => {
                          const name = typeof u === 'object' ? (u.name || '—') : '—'
                          const phone = typeof u === 'object' ? (u.phone || '—') : '—'
                          const email = typeof u === 'object' ? (u.email || '') : ''
                          return (
                            <div key={(u._id || u) + i} className="flex items-center gap-3 bg-dark-300 rounded-xl px-3 py-2">
                              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-white text-sm font-medium">{name}</div>
                                <div className="text-gray-500 text-xs">{phone}{email && ` · ${email}`}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-dark-400 flex-shrink-0">
                  <button
                    onClick={() => { setViewActivity(null); setTimeout(() => openEditActivity(a), 100) }}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-2.5 rounded-full text-sm transition-colors"
                  >
                    <FaEdit className="text-xs" /> Edit Activity
                  </button>
                  <button onClick={() => setViewActivity(null)} className="px-6 bg-dark-300 hover:bg-dark-400 text-gray-300 py-2.5 rounded-full transition-colors text-sm">
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* Activity Registrations Modal */}
      <AnimatePresence>
        {viewRegistrations && (() => {
          // Always read from live activities state so count stays fresh
          const liveActivity = activities.find((a) => a._id === viewRegistrations._id) || viewRegistrations
          return (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setViewRegistrations(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-dark-200 border border-dark-400 rounded-2xl p-6 w-full max-w-md max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <div>
                  <h3 className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>{liveActivity.title}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {new Date(liveActivity.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {liveActivity.time && ` · ${liveActivity.time}`}
                  </p>
                </div>
                <button onClick={() => setViewRegistrations(null)} className="text-gray-500 hover:text-white flex-shrink-0"><FaTimes /></button>
              </div>

              <div className="flex items-center gap-2 mb-4 mt-2">
                <span className="text-sm text-white font-semibold">{liveActivity.registeredUsers?.length || 0} Registered</span>
                {liveActivity.maxParticipants && (
                  <span className="text-xs text-gray-500">/ {liveActivity.maxParticipants} max</span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                {!liveActivity.registeredUsers?.length ? (
                  <div className="text-center py-10">
                    <FaUsers className="text-3xl text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No one has registered yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {liveActivity.registeredUsers.map((u, i) => {
                      const name = typeof u === 'object' ? (u.name || '—') : u
                      const phone = typeof u === 'object' ? (u.phone || '—') : '—'
                      const email = typeof u === 'object' ? (u.email || '') : ''
                      return (
                        <div key={(u._id || u) + i} className="flex items-center gap-3 p-3 bg-dark-300 rounded-xl">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium">{name}</div>
                            <div className="text-gray-500 text-xs">{phone}{email && ` · ${email}`}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => setViewRegistrations(null)}
                className="mt-4 w-full bg-dark-300 hover:bg-dark-400 text-gray-300 py-2.5 rounded-full transition-colors text-sm"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* Activity Delete Confirm */}
      <AnimatePresence>
        {activityDeleteId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setActivityDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-dark-200 border border-dark-400 rounded-2xl p-6 w-full max-w-sm text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <FaTrash className="text-red-400 text-3xl mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Delete Activity?</h3>
              <p className="text-gray-400 text-sm mb-6">This activity will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => handleDeleteActivity(activityDeleteId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-full font-semibold transition-colors text-sm">Delete</button>
                <button onClick={() => setActivityDeleteId(null)} className="flex-1 bg-dark-300 hover:bg-dark-400 text-gray-300 py-2.5 rounded-full transition-colors text-sm">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
