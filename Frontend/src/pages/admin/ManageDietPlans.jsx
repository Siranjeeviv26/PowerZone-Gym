import { useState, useEffect, Fragment } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaAppleAlt, FaPlus, FaEdit, FaTrash, FaTimes, FaBars, FaUsers,
  FaUserTie, FaCrown, FaHome, FaSignOutAlt,
  FaMapMarkerAlt, FaImages, FaDumbbell, FaToggleOn, FaToggleOff, FaEye,
  FaExchangeAlt, FaGlobe, FaFileAlt, FaLayerGroup, FaUserFriends, FaCopy, FaTachometerAlt, FaQuoteLeft, FaRunning, FaLink,
  FaPalette,
  FaDatabase, FaTag,
} from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { validate, required, minLen, nonNegative, fieldClass } from '../../utils/validate'

const Err = ({ msg }) => msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null

const RULES = {
  title: [required('Title'), minLen(2, 'Title')],
  goal: [required('Goal')],
  totalCalories: [nonNegative('Calories')],
  totalProtein: [nonNegative('Protein')],
  totalCarbs: [nonNegative('Carbs')],
  totalFat: [nonNegative('Fat')],
}

const GOALS = ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Vegan']
const MEAL_TYPES = ['Breakfast', 'Mid-Breakfast', 'Lunch', 'Snacks', 'Dinner']

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

const EMPTY = { title: '', goal: '', description: '', totalCalories: '', totalProtein: '', totalCarbs: '', totalFat: '', duration: '', image: '', showOnSite: true }

const newMealItem = () => ({ name: '', quantity: '', fat: '', carbs: '', protein: '', calories: '' })
const newMemberPlanForm = () => ({
  title: '',
  goal: '',
  mealGroups: MEAL_TYPES.map((t) => ({ mealType: t, items: [newMealItem()] })),
})

const goalColors = {
  'Weight Loss': '#ef4444',
  'Muscle Gain': '#3b82f6',
  'Maintenance': '#22c55e',
  'Vegan': '#84cc16',
}

const cellInput = 'w-full bg-dark-400/50 border border-dark-500 focus:border-primary/40 rounded-lg px-2 py-1.5 text-white text-xs outline-none placeholder-gray-600 transition-colors min-w-0'

export default function ManageDietPlans() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [plans, setPlans] = useState([])
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

  const [planTab, setPlanTab] = useState('site')
  const [memberPlanForm, setMemberPlanForm] = useState(newMemberPlanForm())
  const [memberPlanSaving, setMemberPlanSaving] = useState(false)
  const [editingMemberPlanId, setEditingMemberPlanId] = useState(null)
  const [viewMemberPlan, setViewMemberPlan] = useState(null)

  const sitePlans = plans.filter((p) => p.planType !== 'member')
  const memberPlans = plans.filter((p) => p.planType === 'member')

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/diet?admin=true')
      setPlans(data.plans || [])
    } catch {
      toast.error('Failed to load diet plans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPlans() }, [])

  // ── Meal item helpers ─────────────────────────────────────────────────────
  const addMealItem = (gi) => setMemberPlanForm((prev) => ({
    ...prev,
    mealGroups: prev.mealGroups.map((g, i) => i === gi ? { ...g, items: [...g.items, newMealItem()] } : g),
  }))

  const removeMealItem = (gi, ii) => setMemberPlanForm((prev) => ({
    ...prev,
    mealGroups: prev.mealGroups.map((g, i) => {
      if (i !== gi) return g
      const items = g.items.filter((_, idx) => idx !== ii)
      return { ...g, items: items.length ? items : [newMealItem()] }
    }),
  }))

  const updateMealItem = (gi, ii, field, value) => setMemberPlanForm((prev) => ({
    ...prev,
    mealGroups: prev.mealGroups.map((g, i) => {
      if (i !== gi) return g
      return { ...g, items: g.items.map((item, idx) => idx === ii ? { ...item, [field]: value } : item) }
    }),
  }))

  const memberPlanTotals = () => {
    let fat = 0, carbs = 0, protein = 0, calories = 0
    memberPlanForm.mealGroups.forEach((g) => g.items.forEach((item) => {
      fat += Number(item.fat) || 0
      carbs += Number(item.carbs) || 0
      protein += Number(item.protein) || 0
      calories += Number(item.calories) || 0
    }))
    return { fat, carbs, protein, calories }
  }

  // ── Site plan CRUD ────────────────────────────────────────────────────────
  const openAdd = () => { setForm(EMPTY); setFormErrors({}); setModal('add') }
  const openEdit = (p) => {
    setForm({
      title: p.title || '', goal: p.goal || '', description: p.description || '',
      totalCalories: p.totalCalories ?? '', totalProtein: p.totalProtein ?? '',
      totalCarbs: p.totalCarbs ?? '', totalFat: p.totalFat ?? '',
      duration: p.duration || '', image: p.image || '', showOnSite: p.showOnSite !== false,
    })
    setFormErrors({})
    setModal({ type: 'edit', id: p._id })
  }
  const closeModal = () => { setModal(null); setFormErrors({}) }

  const handleSave = async () => {
    const errs = validate(form, RULES)
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    const payload = {
      title: form.title.trim(), goal: form.goal, description: form.description.trim(),
      totalCalories: form.totalCalories ? Number(form.totalCalories) : undefined,
      totalProtein: form.totalProtein ? Number(form.totalProtein) : undefined,
      totalCarbs: form.totalCarbs ? Number(form.totalCarbs) : undefined,
      totalFat: form.totalFat ? Number(form.totalFat) : undefined,
      duration: form.duration.trim() || undefined,
      image: form.image.trim() || undefined, showOnSite: form.showOnSite,
    }
    try {
      setSaving(true)
      if (modal === 'add') {
        const { data } = await api.post('/diet', payload)
        setPlans((prev) => [data.plan, ...prev])
        toast.success('Diet plan created')
      } else {
        const { data } = await api.put(`/diet/${modal.id}`, payload)
        setPlans((prev) => prev.map((p) => (p._id === modal.id ? data.plan : p)))
        toast.success('Diet plan updated')
      }
      closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  // ── Member plan CRUD ──────────────────────────────────────────────────────
  const openMemberPlanModal = () => {
    setEditingMemberPlanId(null)
    setMemberPlanForm(newMemberPlanForm())
    setModal('member-add')
  }

  const openMemberPlanEdit = (p) => {
    setEditingMemberPlanId(p._id)
    const meals = p.meals || []
    const mealGroups = MEAL_TYPES.map((mealType) => {
      const items = meals
        .filter((m) => m.time === mealType)
        .map((m) => ({
          name: m.name || '',
          quantity: m.quantity || '',
          fat: m.fat !== undefined ? String(m.fat) : '',
          carbs: m.carbs !== undefined ? String(m.carbs) : '',
          protein: m.protein !== undefined ? String(m.protein) : '',
          calories: m.calories !== undefined ? String(m.calories) : '',
        }))
      return { mealType, items: items.length ? items : [newMealItem()] }
    })
    setMemberPlanForm({ title: p.title || '', goal: p.goal || '', mealGroups })
    setModal('member-edit')
  }

  const handleSaveMemberPlan = async () => {
    if (!memberPlanForm.title.trim()) return toast.error('Title is required')
    if (!memberPlanForm.goal) return toast.error('Goal is required')
    const meals = memberPlanForm.mealGroups.flatMap((group) =>
      group.items
        .filter((item) => item.name.trim())
        .map((item) => ({
          time: group.mealType,
          name: item.name.trim(),
          quantity: item.quantity.trim() || undefined,
          fat: item.fat ? Number(item.fat) : undefined,
          carbs: item.carbs ? Number(item.carbs) : undefined,
          protein: item.protein ? Number(item.protein) : undefined,
          calories: item.calories ? Number(item.calories) : undefined,
        }))
    )
    const t = memberPlanTotals()
    const payload = {
      planType: 'member', showOnSite: false,
      title: memberPlanForm.title.trim(), goal: memberPlanForm.goal,
      meals,
      totalCalories: t.calories || undefined,
      totalProtein: t.protein || undefined,
      totalCarbs: t.carbs || undefined,
      totalFat: t.fat || undefined,
    }
    setMemberPlanSaving(true)
    try {
      if (editingMemberPlanId) {
        const { data } = await api.put(`/diet/${editingMemberPlanId}`, payload)
        setPlans((prev) => prev.map((p) => (p._id === editingMemberPlanId ? data.plan : p)))
        toast.success('Member plan updated!')
      } else {
        const { data } = await api.post('/diet', payload)
        setPlans((prev) => [data.plan, ...prev])
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

  const handleCopyMemberPlan = async (p) => {
    const payload = {
      planType: 'member', showOnSite: false,
      title: `${p.title} (Copy)`, goal: p.goal,
      meals: (p.meals || []).map((m) => ({
        time: m.time, name: m.name, quantity: m.quantity,
        fat: m.fat, carbs: m.carbs, protein: m.protein, calories: m.calories,
      })),
      totalCalories: p.totalCalories, totalProtein: p.totalProtein,
      totalCarbs: p.totalCarbs, totalFat: p.totalFat,
    }
    try {
      const { data } = await api.post('/diet', payload)
      setPlans((prev) => [data.plan, ...prev])
      toast.success('Plan duplicated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Duplicate failed')
    }
  }

  const toggleShowOnSite = async (p) => {
    try {
      const { data } = await api.put(`/diet/${p._id}`, { showOnSite: !p.showOnSite })
      setPlans((prev) => prev.map((item) => (item._id === p._id ? data.plan : item)))
      toast.success(data.plan.showOnSite ? 'Now visible on site' : 'Hidden from site')
    } catch {
      toast.error('Toggle failed')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/diet/${id}`)
      setPlans((prev) => prev.filter((p) => p._id !== id))
      toast.success('Plan removed')
      setDeleteId(null)
    } catch {
      toast.error('Delete failed')
    }
  }

  const fc = (field) => fieldClass(formErrors, field, 'input-field text-sm')

  const PlanCard = ({ p, i, isMember }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
      className={`glass-card overflow-hidden transition-all ${!isMember && !p.showOnSite ? 'opacity-60' : ''}`}
    >
      {p.image && (
        <div className="h-32 overflow-hidden">
          <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-white font-bold text-sm">{p.title}</h3>
            <span className="text-xs font-medium" style={{ color: goalColors[p.goal] || '#e63946' }}>{p.goal}</span>
          </div>
          {p.duration && <span className="text-xs text-gray-500">{p.duration}</span>}
        </div>
        {p.description && <p className="text-gray-500 text-xs mb-3 line-clamp-2">{p.description}</p>}
        <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-4">
          {p.totalCalories > 0 && <span className="bg-dark-400 px-2 py-0.5 rounded">{p.totalCalories} cal</span>}
          {p.totalProtein > 0 && <span className="bg-dark-400 px-2 py-0.5 rounded">{p.totalProtein}g protein</span>}
          {p.totalCarbs > 0 && <span className="bg-dark-400 px-2 py-0.5 rounded">{p.totalCarbs}g carbs</span>}
          {p.totalFat > 0 && <span className="bg-dark-400 px-2 py-0.5 rounded">{p.totalFat}g fat</span>}
        </div>
        {isMember && (
          <div className="flex items-center gap-1.5 mb-3">
            <FaUsers className="text-gray-500 text-xs" />
            <span className="text-gray-500 text-xs">
              {p.assignedTo?.length ? `${p.assignedTo.length} member${p.assignedTo.length > 1 ? 's' : ''}` : 'Not assigned yet'}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          {!isMember ? (
            <>
              <button onClick={() => toggleShowOnSite(p)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors ${
                  p.showOnSite ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25' : 'bg-dark-400 text-gray-500 hover:bg-dark-300'
                }`}>
                {p.showOnSite ? <FaToggleOn className="text-base" /> : <FaToggleOff className="text-base" />}
                {p.showOnSite ? 'On Site' : 'Hidden'}
              </button>
              <div className="ml-auto flex items-center gap-1.5">
                <button onClick={() => { setSelected(p); setModal('view') }} title="View"
                  className="w-7 h-7 bg-green-500/10 hover:bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 transition-colors">
                  <FaEye className="text-xs" />
                </button>
                <button onClick={() => openEdit(p)} title="Edit"
                  className="w-7 h-7 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 transition-colors">
                  <FaEdit className="text-xs" />
                </button>
                <button onClick={() => setDeleteId(p._id)}
                  className="w-7 h-7 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 transition-colors">
                  <FaTrash className="text-xs" />
                </button>
              </div>
            </>
          ) : (
            <div className="ml-auto flex items-center gap-1.5">
              <button onClick={() => setViewMemberPlan(p)} title="View meals"
                className="w-7 h-7 bg-green-500/10 hover:bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 transition-colors">
                <FaEye className="text-xs" />
              </button>
              <button onClick={() => handleCopyMemberPlan(p)} title="Duplicate plan"
                className="w-7 h-7 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg flex items-center justify-center text-yellow-400 transition-colors">
                <FaCopy className="text-xs" />
              </button>
              <button onClick={() => openMemberPlanEdit(p)} title="Edit"
                className="w-7 h-7 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 transition-colors">
                <FaEdit className="text-xs" />
              </button>
              <button onClick={() => setDeleteId(p._id)}
                className="w-7 h-7 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 transition-colors">
                <FaTrash className="text-xs" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )

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
                <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>DIET PLANS</h1>
                <p className="text-gray-400 text-sm">
                  {planTab === 'site' ? 'Manage diet plans visible on your site' : 'Create plans for individual members'}
                </p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }}
                onClick={planTab === 'site' ? openAdd : openMemberPlanModal}
                className="btn-primary text-sm py-2.5 flex items-center gap-2">
                <FaPlus className="text-xs" /> {planTab === 'site' ? 'Add Plan' : 'New Member Plan'}
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-dark-200 border border-dark-400 rounded-xl p-1 w-fit">
              {[
                { id: 'site', label: 'Site Plans', icon: FaLayerGroup },
                { id: 'member', label: 'Member Plans', icon: FaUserFriends },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setPlanTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    planTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}>
                  <tab.icon className="text-xs" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Site Plans */}
            {planTab === 'site' && (
              loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : sitePlans.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <FaAppleAlt className="text-4xl text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No site diet plans yet. Add your first plan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {sitePlans.map((p, i) => <PlanCard key={p._id} p={p} i={i} isMember={false} />)}
                </div>
              )
            )}

            {/* Member Plans */}
            {planTab === 'member' && (
              loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : memberPlans.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <FaUserFriends className="text-4xl text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-1">No member diet plans yet.</p>
                  <p className="text-gray-500 text-sm">Create a plan here, then assign it to a member from their profile.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {memberPlans.map((p, i) => <PlanCard key={p._id} p={p} i={i} isMember={true} />)}
                </div>
              )
            )}
          </div>
        </main>
      </div>

      {/* ── View Site Plan Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {modal === 'view' && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => { setModal(null); setSelected(null) }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-dark-200 border border-dark-400 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              {selected.image && (
                <div className="h-44 overflow-hidden rounded-t-2xl">
                  <img src={selected.image} alt={selected.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3 className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>{selected.title}</h3>
                  <button onClick={() => { setModal(null); setSelected(null) }} className="text-gray-500 hover:text-white flex-shrink-0"><FaTimes /></button>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-sm font-semibold" style={{ color: goalColors[selected.goal] || '#e63946' }}>{selected.goal}</span>
                  {selected.duration && <span className="text-xs text-gray-500 bg-dark-400 px-2 py-0.5 rounded">{selected.duration}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded ${selected.showOnSite ? 'bg-green-500/15 text-green-400' : 'bg-dark-400 text-gray-500'}`}>
                    {selected.showOnSite ? 'Visible on Site' : 'Hidden'}
                  </span>
                </div>
                {selected.description && <p className="text-gray-400 text-sm leading-relaxed mb-5">{selected.description}</p>}
                {(selected.totalCalories || selected.totalProtein || selected.totalCarbs || selected.totalFat) && (
                  <div className="mb-5">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Macros</p>
                    <div className="grid grid-cols-2 gap-3">
                      {selected.totalCalories && <div className="bg-dark-300 rounded-xl p-3"><p className="text-orange-400 text-lg font-bold">{selected.totalCalories}</p><p className="text-gray-500 text-xs">Total Calories</p></div>}
                      {selected.totalProtein && <div className="bg-dark-300 rounded-xl p-3"><p className="text-blue-400 text-lg font-bold">{selected.totalProtein}g</p><p className="text-gray-500 text-xs">Protein</p></div>}
                      {selected.totalCarbs && <div className="bg-dark-300 rounded-xl p-3"><p className="text-yellow-400 text-lg font-bold">{selected.totalCarbs}g</p><p className="text-gray-500 text-xs">Carbs</p></div>}
                      {selected.totalFat && <div className="bg-dark-300 rounded-xl p-3"><p className="text-red-400 text-lg font-bold">{selected.totalFat}g</p><p className="text-gray-500 text-xs">Fat</p></div>}
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => { setModal(null); setSelected(null); setTimeout(() => openEdit(selected), 100) }}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-2.5 rounded-full text-sm transition-colors">
                    <FaEdit className="text-xs" /> Edit
                  </button>
                  <button onClick={() => { setModal(null); setSelected(null) }}
                    className="px-6 bg-dark-300 hover:bg-dark-400 text-gray-300 py-2.5 rounded-full transition-colors text-sm">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add / Edit Site Plan Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {(modal === 'add' || modal?.type === 'edit') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={closeModal}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-dark-200 border border-dark-400 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>
                  {modal === 'add' ? 'ADD DIET PLAN' : 'EDIT DIET PLAN'}
                </h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-white"><FaTimes /></button>
              </div>
              <form className="space-y-4" noValidate onSubmit={(e) => { e.preventDefault(); handleSave() }}>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Title <span className="text-red-400">*</span></label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Fat Burn Plan" className={fc('title')} />
                  <Err msg={formErrors.title} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Goal <span className="text-red-400">*</span></label>
                    <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className={fc('goal')}>
                      <option value="">Select goal</option>
                      {GOALS.map((g) => <option key={g}>{g}</option>)}
                    </select>
                    <Err msg={formErrors.goal} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Duration</label>
                    <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 12 weeks" className="input-field text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input-field text-sm resize-none" placeholder="Plan description..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Total Calories</label>
                    <input type="number" value={form.totalCalories} onChange={(e) => setForm({ ...form, totalCalories: e.target.value })} placeholder="1800" className={fc('totalCalories')} />
                    <Err msg={formErrors.totalCalories} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Protein (g)</label>
                    <input type="number" value={form.totalProtein} onChange={(e) => setForm({ ...form, totalProtein: e.target.value })} placeholder="150" className={fc('totalProtein')} />
                    <Err msg={formErrors.totalProtein} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Carbs (g)</label>
                    <input type="number" value={form.totalCarbs} onChange={(e) => setForm({ ...form, totalCarbs: e.target.value })} placeholder="200" className={fc('totalCarbs')} />
                    <Err msg={formErrors.totalCarbs} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Fat (g)</label>
                    <input type="number" value={form.totalFat} onChange={(e) => setForm({ ...form, totalFat: e.target.value })} placeholder="60" className={fc('totalFat')} />
                    <Err msg={formErrors.totalFat} />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Image URL</label>
                  <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." className="input-field text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="dShowOnSite" checked={form.showOnSite} onChange={(e) => setForm({ ...form, showOnSite: e.target.checked })} className="w-4 h-4 accent-primary" />
                  <label htmlFor="dShowOnSite" className="text-gray-400 text-sm cursor-pointer">Show on public site</label>
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button type="submit" disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 btn-primary py-3 disabled:opacity-60">
                    {saving ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</span>
                      : modal === 'add' ? 'Create Plan' : 'Save Changes'}
                  </motion.button>
                  <button type="button" onClick={closeModal} className="px-6 bg-dark-300 hover:bg-dark-400 text-gray-300 rounded-full transition-colors">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Member Plan Modal (meal table) ───────────────────────────────────── */}
      <AnimatePresence>
        {(modal === 'member-add' || modal === 'member-edit') && (() => {
          const totals = memberPlanTotals()
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
              onClick={() => setModal(null)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-dark-200 border border-dark-400 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}>

                {/* Modal header */}
                <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-dark-400 flex-shrink-0">
                  <div>
                    <h3 className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>
                      {modal === 'member-add' ? 'NEW MEMBER PLAN' : 'EDIT MEMBER PLAN'}
                    </h3>
                    <p className="text-gray-500 text-xs mt-0.5">Assign this plan to a member from their profile page.</p>
                  </div>
                  <button onClick={() => setModal(null)} className="text-gray-500 hover:text-white mt-0.5 flex-shrink-0"><FaTimes /></button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

                  {/* Title + Goal */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Title <span className="text-red-400">*</span></label>
                      <input
                        value={memberPlanForm.title}
                        onChange={(e) => setMemberPlanForm({ ...memberPlanForm, title: e.target.value })}
                        placeholder="e.g. Diet 1"
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Goal <span className="text-red-400">*</span></label>
                      <select
                        value={memberPlanForm.goal}
                        onChange={(e) => setMemberPlanForm({ ...memberPlanForm, goal: e.target.value })}
                        className="input-field text-sm"
                      >
                        <option value="">Select goal</option>
                        {GOALS.map((g) => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Meal table */}
                  <div className="overflow-x-auto rounded-xl border border-dark-400">
                    <table className="w-full min-w-[760px] border-collapse text-xs">
                      <thead>
                        <tr className="bg-dark-300">
                          <th className="text-left font-semibold text-gray-400 px-3 py-2.5 border-b border-dark-400 w-[115px]">Meal</th>
                          <th className="text-left font-semibold text-gray-400 px-2 py-2.5 border-b border-dark-400">Food Items</th>
                          <th className="text-left font-semibold text-gray-400 px-2 py-2.5 border-b border-dark-400 w-[88px]">Qty (g/ml)</th>
                          <th className="text-left font-semibold text-gray-400 px-2 py-2.5 border-b border-dark-400 w-[68px]">Fats (g)</th>
                          <th className="text-left font-semibold text-gray-400 px-2 py-2.5 border-b border-dark-400 w-[68px]">Carbs (g)</th>
                          <th className="text-left font-semibold text-gray-400 px-2 py-2.5 border-b border-dark-400 w-[78px]">Protein (g)</th>
                          <th className="text-left font-semibold text-gray-400 px-2 py-2.5 border-b border-dark-400 w-[72px]">Calories</th>
                          <th className="w-8 border-b border-dark-400" />
                        </tr>
                      </thead>
                      <tbody>
                        {memberPlanForm.mealGroups.map((group, gi) => (
                          <Fragment key={group.mealType}>
                            {group.items.map((item, ii) => (
                              <tr key={ii} className="border-b border-dark-500/40 hover:bg-dark-300/20 transition-colors">
                                {ii === 0 && (
                                  <td
                                    rowSpan={group.items.length + 1}
                                    className="text-xs font-bold text-primary px-3 py-2 align-middle border-r border-dark-400 bg-dark-300/30 whitespace-nowrap"
                                  >
                                    {group.mealType}
                                  </td>
                                )}
                                <td className="px-2 py-1.5">
                                  <input value={item.name} onChange={(e) => updateMealItem(gi, ii, 'name', e.target.value)}
                                    placeholder="e.g. Idly / Oats" className={cellInput} />
                                </td>
                                <td className="px-2 py-1.5">
                                  <input value={item.quantity} onChange={(e) => updateMealItem(gi, ii, 'quantity', e.target.value)}
                                    placeholder="125" className={cellInput} />
                                </td>
                                <td className="px-2 py-1.5">
                                  <input type="number" value={item.fat} onChange={(e) => updateMealItem(gi, ii, 'fat', e.target.value)}
                                    placeholder="0" className={cellInput} />
                                </td>
                                <td className="px-2 py-1.5">
                                  <input type="number" value={item.carbs} onChange={(e) => updateMealItem(gi, ii, 'carbs', e.target.value)}
                                    placeholder="0" className={cellInput} />
                                </td>
                                <td className="px-2 py-1.5">
                                  <input type="number" value={item.protein} onChange={(e) => updateMealItem(gi, ii, 'protein', e.target.value)}
                                    placeholder="0" className={cellInput} />
                                </td>
                                <td className="px-2 py-1.5">
                                  <input type="number" value={item.calories} onChange={(e) => updateMealItem(gi, ii, 'calories', e.target.value)}
                                    placeholder="0" className={cellInput} />
                                </td>
                                <td className="px-1 py-1.5 text-center">
                                  <button onClick={() => removeMealItem(gi, ii)}
                                    className="w-6 h-6 rounded-md bg-red-500/10 hover:bg-red-500/25 text-red-400 flex items-center justify-center mx-auto transition-colors">
                                    <FaTimes className="text-[10px]" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {/* Add food item row — covered by meal cell rowspan */}
                            <tr className="border-b-2 border-dark-400">
                              <td colSpan={7} className="px-2 py-1">
                                <button onClick={() => addMealItem(gi)}
                                  className="flex items-center gap-1 text-primary/60 hover:text-primary transition-colors text-[11px] py-0.5">
                                  <FaPlus className="text-[9px]" /> Add food item
                                </button>
                              </td>
                            </tr>
                          </Fragment>
                        ))}

                        {/* Totals row */}
                        <tr className="bg-dark-300">
                          <td className="font-bold text-white px-3 py-2.5 border-r border-dark-400">Total</td>
                          <td colSpan={2} className="px-3 py-2.5 text-gray-500 italic">Auto-calculated</td>
                          <td className="px-3 py-2.5 font-bold text-yellow-400">
                            {totals.fat > 0 ? totals.fat.toFixed(1) : '—'}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-green-400">
                            {totals.carbs > 0 ? totals.carbs.toFixed(1) : '—'}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-blue-400">
                            {totals.protein > 0 ? totals.protein.toFixed(1) : '—'}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-orange-400">
                            {totals.calories > 0 ? totals.calories.toFixed(0) : '—'}
                          </td>
                          <td />
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-dark-400 flex-shrink-0">
                  <motion.button
                    type="button"
                    disabled={memberPlanSaving}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleSaveMemberPlan}
                    className="flex-1 btn-primary py-3 disabled:opacity-60"
                  >
                    {memberPlanSaving
                      ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</span>
                      : modal === 'member-add' ? 'Create Plan' : 'Save Changes'}
                  </motion.button>
                  <button type="button" onClick={() => setModal(null)} className="px-8 bg-dark-300 hover:bg-dark-400 text-gray-300 rounded-full transition-colors text-sm">
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* ── Member Plan View Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {viewMemberPlan && (() => {
          const grouped = MEAL_TYPES.map((mt) => ({
            mealType: mt,
            items: (viewMemberPlan.meals || []).filter((m) => m.time === mt),
          })).filter((g) => g.items.length > 0)
          const totals = { fat: 0, carbs: 0, protein: 0, calories: 0 }
          ;(viewMemberPlan.meals || []).forEach((m) => {
            totals.fat += m.fat || 0
            totals.carbs += m.carbs || 0
            totals.protein += m.protein || 0
            totals.calories += m.calories || 0
          })
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
              onClick={() => setViewMemberPlan(null)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-dark-200 border border-dark-400 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-dark-400 flex-shrink-0">
                  <div>
                    <h3 className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>{viewMemberPlan.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-semibold" style={{ color: goalColors[viewMemberPlan.goal] || '#e63946' }}>{viewMemberPlan.goal}</span>
                      {viewMemberPlan.duration && <span className="text-xs text-gray-500 bg-dark-400 px-2 py-0.5 rounded">{viewMemberPlan.duration}</span>}
                      {viewMemberPlan.assignedTo?.length > 0 && (
                        <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                          {viewMemberPlan.assignedTo.length} member{viewMemberPlan.assignedTo.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => { setViewMemberPlan(null); setTimeout(() => openMemberPlanEdit(viewMemberPlan), 80) }}
                      className="flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-xs transition-colors">
                      <FaEdit className="text-[10px]" /> Edit
                    </button>
                    <button onClick={() => { setViewMemberPlan(null); handleCopyMemberPlan(viewMemberPlan) }}
                      className="flex items-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-lg text-xs transition-colors">
                      <FaCopy className="text-[10px]" /> Copy
                    </button>
                    <button onClick={() => setViewMemberPlan(null)} className="text-gray-500 hover:text-white ml-1">
                      <FaTimes />
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {grouped.length === 0 ? (
                    <div className="text-center py-12">
                      <FaAppleAlt className="text-3xl text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No meals added to this plan yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-dark-400">
                      <table className="w-full min-w-[700px] border-collapse text-xs">
                        <thead>
                          <tr className="bg-dark-300">
                            <th className="text-left font-semibold text-gray-400 px-3 py-2.5 border-b border-dark-400 w-[115px]">Meal</th>
                            <th className="text-left font-semibold text-gray-400 px-3 py-2.5 border-b border-dark-400">Food Items</th>
                            <th className="text-left font-semibold text-gray-400 px-3 py-2.5 border-b border-dark-400 w-[88px]">Qty (g/ml)</th>
                            <th className="text-left font-semibold text-gray-400 px-3 py-2.5 border-b border-dark-400 w-[68px]">Fats (g)</th>
                            <th className="text-left font-semibold text-gray-400 px-3 py-2.5 border-b border-dark-400 w-[68px]">Carbs (g)</th>
                            <th className="text-left font-semibold text-gray-400 px-3 py-2.5 border-b border-dark-400 w-[78px]">Protein (g)</th>
                            <th className="text-left font-semibold text-gray-400 px-3 py-2.5 border-b border-dark-400 w-[72px]">Calories</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grouped.map((group) => (
                            <Fragment key={group.mealType}>
                              {group.items.map((item, ii) => (
                                <tr key={ii} className="border-b border-dark-500/40">
                                  {ii === 0 && (
                                    <td rowSpan={group.items.length}
                                      className="font-bold text-primary px-3 py-2 align-middle border-r border-dark-400 bg-dark-300/30 whitespace-nowrap">
                                      {group.mealType}
                                    </td>
                                  )}
                                  <td className="px-3 py-2 text-gray-200">{item.name || '—'}</td>
                                  <td className="px-3 py-2 text-gray-400">{item.quantity || '—'}</td>
                                  <td className="px-3 py-2 text-yellow-400">{item.fat ?? '—'}</td>
                                  <td className="px-3 py-2 text-green-400">{item.carbs ?? '—'}</td>
                                  <td className="px-3 py-2 text-blue-400">{item.protein ?? '—'}</td>
                                  <td className="px-3 py-2 text-orange-400">{item.calories ?? '—'}</td>
                                </tr>
                              ))}
                              {/* separator between meal groups */}
                              <tr className="h-1 bg-dark-400/40"><td colSpan={7} /></tr>
                            </Fragment>
                          ))}
                          <tr className="bg-dark-300 font-bold">
                            <td className="px-3 py-2.5 text-white border-r border-dark-400">Total</td>
                            <td colSpan={2} className="px-3 py-2.5 text-gray-500 italic font-normal">Daily totals</td>
                            <td className="px-3 py-2.5 text-yellow-400">{totals.fat > 0 ? totals.fat.toFixed(1) : '—'}</td>
                            <td className="px-3 py-2.5 text-green-400">{totals.carbs > 0 ? totals.carbs.toFixed(1) : '—'}</td>
                            <td className="px-3 py-2.5 text-blue-400">{totals.protein > 0 ? totals.protein.toFixed(1) : '—'}</td>
                            <td className="px-3 py-2.5 text-orange-400">{totals.calories > 0 ? Math.round(totals.calories) : '—'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 border-t border-dark-400 flex-shrink-0">
                  <button onClick={() => setViewMemberPlan(null)}
                    className="w-full py-2.5 bg-dark-300 hover:bg-dark-400 text-gray-300 rounded-full transition-colors text-sm">
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* ── Delete Confirm ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setDeleteId(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-dark-200 border border-dark-400 rounded-2xl p-6 w-full max-w-sm text-center"
              onClick={(e) => e.stopPropagation()}>
              <FaTrash className="text-red-400 text-3xl mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Remove Diet Plan?</h3>
              <p className="text-gray-400 text-sm mb-6">This plan will be deactivated.</p>
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
