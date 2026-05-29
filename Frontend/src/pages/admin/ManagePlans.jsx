import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaPlus, FaEdit, FaTrash, FaDumbbell, FaUsers, FaUserTie, FaCrown,
  FaHome, FaSignOutAlt, FaCheck, FaTimes, FaBars, FaEye,
  FaMapMarkerAlt, FaImages, FaAppleAlt, FaExchangeAlt, FaGlobe, FaFileAlt, FaTachometerAlt, FaQuoteLeft, FaRunning, FaLink,
  FaPalette, FaTag, FaUpload,
  FaDatabase,
} from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { validate, required, minLen, maxLen, positiveNum, nonNegative, fieldClass } from '../../utils/validate'

const Err = ({ msg }) => msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null

const PLAN_RULES = {
  name: [required('Plan name'), minLen(2, 'Plan name'), maxLen(50, 'Plan name')],
  monthlyPrice: [required('Monthly price'), positiveNum('Monthly price')],
  yearlyPrice: [nonNegative('Yearly price')],
}

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

const DURATIONS = [
  { value: 'monthly', label: 'Monthly', months: 1 },
  { value: 'quarterly', label: 'Quarterly (3 months)', months: 3 },
  { value: 'half-yearly', label: 'Half-Yearly (6 months)', months: 6 },
  { value: 'annual', label: 'Annual (12 months)', months: 12 },
]

const EMPTY = { name: '', description: '', duration: 'monthly', monthlyPrice: '', quarterlyPrice: '', halfYearlyPrice: '', yearlyPrice: '', features: '', color: '#e63946', isPopular: false, order: 0 }

const OFFER_EMPTY = { title: '', description: '', startDate: '', endDate: '', isActive: true, file: null, preview: '' }

export default function ManagePlans() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024)
  const [pageTab, setPageTab] = useState('plans')
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [viewPlan, setViewPlan] = useState(null)
  const [editTab, setEditTab] = useState('details')
  const [offerForm, setOfferForm] = useState({ title: '', startDate: '', endDate: '', isActive: true, file: null, preview: '' })
  const [offerSaving, setOfferSaving] = useState(false)
  // Standalone offers
  const [offers, setOffers] = useState([])
  const [offerLoading, setOfferLoading] = useState(true)
  const [offerModal, setOfferModal] = useState(null) // null | 'add' | { type: 'edit', id }
  const [standaloneOfferForm, setStandaloneOfferForm] = useState(OFFER_EMPTY)
  const [standaloneSaving, setStandaloneSaving] = useState(false)
  const [deleteOfferId, setDeleteOfferId] = useState(null)
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/plans')
      setPlans(data.plans || [])
    } catch {
      toast.error('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPlans() }, [])

  const fetchOffers = async () => {
    try {
      setOfferLoading(true)
      const { data } = await api.get('/offers')
      setOffers(data.offers || [])
    } catch {
      toast.error('Failed to load offers')
    } finally {
      setOfferLoading(false)
    }
  }

  useEffect(() => { fetchOffers() }, [])

  const openAddOffer = () => {
    setStandaloneOfferForm(OFFER_EMPTY)
    setOfferModal('add')
  }

  const openEditOffer = (offer) => {
    setStandaloneOfferForm({
      title: offer.title || '',
      description: offer.description || '',
      startDate: offer.startDate ? offer.startDate.slice(0, 10) : '',
      endDate: offer.endDate ? offer.endDate.slice(0, 10) : '',
      isActive: offer.isActive !== false,
      file: null,
      preview: offer.image || '',
    })
    setOfferModal({ type: 'edit', id: offer._id })
  }

  const closeOfferModal = () => setOfferModal(null)

  const handleStandaloneOfferSave = async () => {
    if (!standaloneOfferForm.title.trim()) return toast.error('Title is required')
    if (!standaloneOfferForm.preview && !standaloneOfferForm.file) return toast.error('Please upload an offer image')
    setStandaloneSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', standaloneOfferForm.title)
      fd.append('description', standaloneOfferForm.description)
      fd.append('startDate', standaloneOfferForm.startDate)
      fd.append('endDate', standaloneOfferForm.endDate)
      fd.append('isActive', String(standaloneOfferForm.isActive))
      if (standaloneOfferForm.file) fd.append('image', standaloneOfferForm.file)
      if (offerModal === 'add') {
        const { data } = await api.post('/offers', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        setOffers((prev) => [data.offer, ...prev])
        toast.success('Offer created!')
      } else {
        const { data } = await api.put(`/offers/${offerModal.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        setOffers((prev) => prev.map((o) => o._id === offerModal.id ? data.offer : o))
        toast.success('Offer updated!')
      }
      closeOfferModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save offer')
    } finally {
      setStandaloneSaving(false)
    }
  }

  const handleDeleteOffer = async (id) => {
    try {
      await api.delete(`/offers/${id}`)
      setOffers((prev) => prev.filter((o) => o._id !== id))
      toast.success('Offer deleted')
      setDeleteOfferId(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete offer')
    }
  }

  const openAdd = () => {
    setForm(EMPTY)
    setFormErrors({})
    setEditTab('details')
    setModal('add')
  }

  const openEdit = (plan, tab = 'details') => {
    setForm({
      name: plan.name || '',
      description: plan.description || '',
      duration: plan.duration || 'monthly',
      monthlyPrice: plan.monthlyPrice ?? '',
      quarterlyPrice: plan.quarterlyPrice ?? '',
      halfYearlyPrice: plan.halfYearlyPrice ?? '',
      yearlyPrice: plan.yearlyPrice ?? '',
      features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
      color: plan.color || '#e63946',
      isPopular: plan.isPopular || false,
      order: plan.order ?? 0,
    })
    setOfferForm({
      title: plan.offer?.title || '',
      startDate: plan.offer?.startDate ? plan.offer.startDate.slice(0, 10) : '',
      endDate: plan.offer?.endDate ? plan.offer.endDate.slice(0, 10) : '',
      isActive: plan.offer?.isActive !== false,
      file: null,
      preview: plan.offer?.image || '',
    })
    setFormErrors({})
    setEditTab(tab)
    setModal({ type: 'edit', id: plan._id })
  }

  const closeModal = () => {
    setModal(null)
    setFormErrors({})
    setEditTab('details')
  }

  const handleSave = async () => {
    const errs = validate(form, PLAN_RULES)
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      duration: form.duration,
      monthlyPrice: Number(form.monthlyPrice),
      quarterlyPrice: form.quarterlyPrice ? Number(form.quarterlyPrice) : undefined,
      halfYearlyPrice: form.halfYearlyPrice ? Number(form.halfYearlyPrice) : undefined,
      yearlyPrice: form.yearlyPrice ? Number(form.yearlyPrice) : undefined,
      features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
      color: form.color,
      isPopular: form.isPopular,
      order: Number(form.order) || 0,
    }

    try {
      setSaving(true)
      if (modal === 'add') {
        const { data } = await api.post('/plans', payload)
        setPlans((prev) => [...prev, data.plan])
        toast.success('Plan created')
      } else {
        const { data } = await api.put(`/plans/${modal.id}`, payload)
        setPlans((prev) => prev.map((p) => (p._id === modal.id ? data.plan : p)))
        toast.success('Plan updated')
      }
      closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/plans/${id}`)
      setPlans((prev) => prev.filter((p) => p._id !== id))
      toast.success('Plan removed')
      setDeleteId(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleOfferSave = async () => {
    if (!modal?.id) return
    if (!offerForm.preview && !offerForm.file) return toast.error('Please upload an offer image')
    setOfferSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', offerForm.title)
      fd.append('startDate', offerForm.startDate)
      fd.append('endDate', offerForm.endDate)
      fd.append('isActive', String(offerForm.isActive))
      if (offerForm.file) fd.append('image', offerForm.file)
      const { data } = await api.put(`/plans/${modal.id}/offer`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setPlans((prev) => prev.map((p) => p._id === modal.id ? data.plan : p))
      toast.success('Offer saved!')
      closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save offer')
    } finally {
      setOfferSaving(false)
    }
  }

  const handleOfferRemove = async () => {
    if (!modal?.id) return
    setOfferSaving(true)
    try {
      const { data } = await api.delete(`/plans/${modal.id}/offer`)
      setPlans((prev) => prev.map((p) => p._id === modal.id ? data.plan : p))
      toast.success('Offer removed!')
      closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove offer')
    } finally {
      setOfferSaving(false)
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
                <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>MEMBERSHIP PLANS</h1>
                <p className="text-gray-400 text-sm">Manage plans and promotional offers</p>
              </div>
              {pageTab === 'plans' && (
                <motion.button whileHover={{ scale: 1.05 }} onClick={openAdd} className="btn-primary text-sm py-2.5 flex items-center gap-2">
                  <FaPlus className="text-xs" /> Add Plan
                </motion.button>
              )}
              {pageTab === 'offers' && (
                <motion.button whileHover={{ scale: 1.05 }} onClick={openAddOffer} className="btn-primary text-sm py-2.5 flex items-center gap-2">
                  <FaPlus className="text-xs" /> Add Offer
                </motion.button>
              )}
            </div>

            {/* Page Tabs */}
            <div className="inline-flex items-center bg-dark-300 rounded-xl p-1 border border-dark-500">
              {[
                { id: 'plans', label: 'Plans', icon: FaCrown },
                { id: 'offers', label: 'Offers', icon: FaTag },
              ].map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setPageTab(id)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    pageTab === id ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-400 hover:text-white'
                  }`}>
                  <Icon className="text-xs" /> {label}
                </button>
              ))}
            </div>

            {pageTab === 'offers' ? (
              offerLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : offers.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <FaTag className="text-4xl text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-4">No offers yet.</p>
                  <motion.button whileHover={{ scale: 1.05 }} onClick={openAddOffer} className="btn-primary text-sm py-2.5 inline-flex items-center gap-2">
                    <FaPlus className="text-xs" /> Add Offer
                  </motion.button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {offers.map((offer, i) => (
                    <motion.div
                      key={offer._id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className="glass-card overflow-hidden hover:border-orange-500/20 transition-all"
                    >
                      <div className="relative">
                        <img src={offer.image} alt={offer.title} className="w-full h-44 object-cover" />
                        <div className="absolute top-3 right-3">
                          {offer.isActive ? (
                            <span className="flex items-center gap-1.5 text-[10px] bg-orange-500/90 text-white px-2.5 py-1 rounded-full font-bold backdrop-blur-sm">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                              </span>
                              LIVE
                            </span>
                          ) : (
                            <span className="text-[10px] bg-dark-200/90 text-gray-400 px-2.5 py-1 rounded-full backdrop-blur-sm">Inactive</span>
                          )}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-white font-black text-base mb-1" style={{ fontFamily: 'Oswald' }}>{offer.title}</h3>
                        {offer.description && <p className="text-gray-500 text-xs mb-3 line-clamp-2">{offer.description}</p>}
                        {(offer.startDate || offer.endDate) && (
                          <p className="text-gray-500 text-xs mb-4">
                            {offer.startDate ? new Date(offer.startDate).toLocaleDateString() : '—'} → {offer.endDate ? new Date(offer.endDate).toLocaleDateString() : '—'}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button onClick={() => openEditOffer(offer)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-2 rounded-xl text-sm transition-colors">
                            <FaEdit className="text-xs" /> Edit
                          </button>
                          <button onClick={() => setDeleteOfferId(offer._id)}
                            className="flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-xl transition-colors">
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            ) : loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : plans.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <FaCrown className="text-4xl text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No plans yet. Add your first membership plan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {plans.map((plan, i) => (
                  <motion.div
                    key={plan._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="glass-card p-6 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color || '#e63946' }} />
                        <h3 className="text-white font-black text-xl" style={{ fontFamily: 'Oswald' }}>{plan.name}</h3>
                        {plan.isPopular && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Popular</span>}
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400">Active</span>
                    </div>

                    {plan.description && <p className="text-gray-500 text-xs mb-3 line-clamp-2">{plan.description}</p>}

                    <div className="mb-3">
                      <span className="text-3xl font-black text-white" style={{ fontFamily: 'Oswald' }}>₹{plan.monthlyPrice?.toLocaleString()}</span>
                      <span className="text-gray-400 text-sm">/mo</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {plan.quarterlyPrice > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">₹{plan.quarterlyPrice?.toLocaleString()}/qtr</span>
                      )}
                      {plan.halfYearlyPrice > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">₹{plan.halfYearlyPrice?.toLocaleString()}/6mo</span>
                      )}
                      {plan.yearlyPrice > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">₹{plan.yearlyPrice?.toLocaleString()}/yr</span>
                      )}
                    </div>
                    <div className="mb-3">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 capitalize">
                        {DURATIONS.find((d) => d.value === plan.duration)?.label || 'Monthly'}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 mb-4">
                      <FaUsers className="inline mr-1 text-primary" />{plan.currentMembers || 0} active members
                    </div>

                    {plan.features?.length > 0 && (
                      <ul className="space-y-1.5 mb-5">
                        {plan.features.slice(0, 4).map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                            <FaCheck className="text-primary text-xs flex-shrink-0" />{f}
                          </li>
                        ))}
                        {plan.features.length > 4 && (
                          <li className="text-xs text-gray-500">+{plan.features.length - 4} more features</li>
                        )}
                      </ul>
                    )}

                    {plan.offer?.image && plan.offer?.isActive && (
                      <div className="flex items-center gap-2 mb-3 p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                        <FaTag className="text-orange-400 text-xs flex-shrink-0" />
                        <span className="text-orange-400 text-xs font-semibold truncate">{plan.offer.title || 'Active Offer'}</span>
                        <span className="ml-auto text-[10px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded-full flex-shrink-0">LIVE</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewPlan(plan)}
                        className="flex items-center justify-center bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-2 rounded-xl transition-colors"
                        title="View"
                      >
                        <FaEye className="text-xs" />
                      </button>
                      <button
                        onClick={() => openEdit(plan)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-2 rounded-xl text-sm transition-colors"
                      >
                        <FaEdit className="text-xs" /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(plan._id)}
                        className="flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-xl transition-colors"
                      >
                        <FaTrash className="text-xs" />
                      </button>
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
        {(modal === 'add' || modal?.type === 'edit') && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-dark-200 border border-dark-400 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>
                  {modal === 'add' ? 'ADD NEW PLAN' : 'EDIT PLAN'}
                </h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-white"><FaTimes /></button>
              </div>

              {/* Pill tabs — hide Offer tab when adding a new plan */}
              {modal !== 'add' && (
                <div className="inline-flex items-center bg-dark-300 rounded-xl p-1 border border-dark-500 mb-5">
                  {[{ id: 'details', label: 'Details' }, { id: 'offer', label: 'Offer' }].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setEditTab(t.id)}
                      className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        editTab === t.id ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}

              {/* ── DETAILS TAB ── */}
              {(modal === 'add' || editTab === 'details') && (
                <form className="space-y-4" noValidate onSubmit={(e) => { e.preventDefault(); handleSave() }}>
                  <div className="grid grid-cols-2 gap-4 items-start">
                    <div className="col-span-2">
                      <label className="text-gray-400 text-xs mb-1 block">Plan Name <span className="text-red-400">*</span></label>
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Premium" className={fc('name')} />
                      <Err msg={formErrors.name} />
                    </div>

                    <div className="col-span-2">
                      <label className="text-gray-400 text-xs mb-1 block">Plan Duration</label>
                      <select value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="input-field text-sm">
                        {DURATIONS.map((d) => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                      <p className="text-gray-600 text-xs mt-1">Used to auto-calculate next payment date when assigning members</p>
                    </div>

                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Monthly Price (₹) <span className="text-red-400">*</span></label>
                      <input type="number" value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })} placeholder="e.g. 999" className={fc('monthlyPrice')} />
                      <Err msg={formErrors.monthlyPrice} />
                    </div>

                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Quarterly Price (₹)</label>
                      <input type="number" value={form.quarterlyPrice} onChange={(e) => setForm({ ...form, quarterlyPrice: e.target.value })} placeholder="e.g. 2700" className="input-field text-sm" />
                    </div>

                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Half-Yearly Price (₹)</label>
                      <input type="number" value={form.halfYearlyPrice} onChange={(e) => setForm({ ...form, halfYearlyPrice: e.target.value })} placeholder="e.g. 5400" className="input-field text-sm" />
                    </div>

                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Yearly Price (₹)</label>
                      <input type="number" value={form.yearlyPrice} onChange={(e) => setForm({ ...form, yearlyPrice: e.target.value })} placeholder="e.g. 9990" className={fc('yearlyPrice')} />
                      <Err msg={formErrors.yearlyPrice} />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Brief plan description..." className="input-field text-sm resize-none" />
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Features (one per line)</label>
                    <textarea
                      value={form.features}
                      onChange={(e) => setForm({ ...form, features: e.target.value })}
                      rows={4}
                      placeholder={"Gym Access\nLocker Room\nUnlimited Classes"}
                      className="input-field text-sm resize-none"
                    />
                    <p className="text-gray-600 text-xs mt-1">Enter each feature on a new line</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-10 h-9 rounded cursor-pointer bg-dark-300 border border-dark-500" />
                        <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="input-field text-sm flex-1" />
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Display Order</label>
                      <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="input-field text-sm" />
                    </div>
                    <div className="flex flex-col justify-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.isPopular}
                          onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-gray-400 text-xs">Mark as Popular</span>
                      </label>
                    </div>
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
                      ) : modal === 'add' ? 'Create Plan' : 'Save Changes'}
                    </motion.button>
                    <button type="button" onClick={closeModal} className="px-6 bg-dark-300 hover:bg-dark-400 text-gray-300 rounded-full transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* ── OFFER TAB ── */}
              {modal !== 'add' && editTab === 'offer' && (
                <div className="space-y-4">
                  {/* Image upload */}
                  <div>
                    <label className="text-gray-400 text-xs mb-2 block">Offer Image</label>
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (!file) return
                          setOfferForm((f) => ({ ...f, file, preview: URL.createObjectURL(file) }))
                        }}
                      />
                      {offerForm.preview ? (
                        <div className="relative group rounded-xl overflow-hidden border border-dark-400">
                          <img src={offerForm.preview} alt="Offer preview" className="w-full h-44 object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <FaUpload className="text-white text-xl" />
                            <span className="text-white text-sm font-semibold">Change Image</span>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-dark-400 hover:border-orange-500/50 rounded-xl h-36 flex flex-col items-center justify-center gap-3 transition-colors">
                          <FaUpload className="text-3xl text-gray-600" />
                          <span className="text-gray-500 text-sm">Click to upload offer image</span>
                          <span className="text-gray-600 text-xs">JPG, PNG, WebP recommended</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Offer Title</label>
                    <input
                      value={offerForm.title}
                      onChange={(e) => setOfferForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. 50% OFF on Annual Plan"
                      className="input-field text-sm w-full"
                    />
                  </div>

                  {/* Start & End date */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Start Date</label>
                      <input
                        type="date"
                        value={offerForm.startDate}
                        onChange={(e) => setOfferForm((f) => ({ ...f, startDate: e.target.value }))}
                        className="input-field text-sm w-full"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">End Date</label>
                      <input
                        type="date"
                        value={offerForm.endDate}
                        onChange={(e) => setOfferForm((f) => ({ ...f, endDate: e.target.value }))}
                        className="input-field text-sm w-full"
                      />
                    </div>
                  </div>

                  {/* Active toggle */}
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={offerForm.isActive}
                        onChange={(e) => setOfferForm((f) => ({ ...f, isActive: e.target.checked }))}
                        className="w-4 h-4 accent-orange-500"
                      />
                      <div>
                        <span className="text-gray-300 text-sm">Show offer badge on site</span>
                        <p className="text-gray-600 text-xs">When enabled, a badge appears on the plan card for members to click</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleOfferSave}
                      disabled={offerSaving}
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full font-semibold text-sm transition-colors disabled:opacity-60"
                    >
                      {offerSaving ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                      ) : (
                        <><FaTag className="text-xs" /> Save Offer</>
                      )}
                    </motion.button>
                    {offerForm.preview && (
                      <button
                        onClick={handleOfferRemove}
                        disabled={offerSaving}
                        className="flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-3 rounded-full text-sm transition-colors disabled:opacity-60"
                      >
                        <FaTrash className="text-xs" /> Remove
                      </button>
                    )}
                    <button onClick={closeModal} className="px-5 bg-dark-300 hover:bg-dark-400 text-gray-300 py-3 rounded-full text-sm transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Plan Modal */}
      <AnimatePresence>
        {viewPlan && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setViewPlan(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-dark-200 border border-dark-400 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: viewPlan.color || '#e63946' }} />
                  <h3 className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>{viewPlan.name}</h3>
                  {viewPlan.isPopular && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Popular</span>}
                </div>
                <button onClick={() => setViewPlan(null)} className="text-gray-500 hover:text-white"><FaTimes /></button>
              </div>

              {viewPlan.description && (
                <p className="text-gray-400 text-sm mb-4">{viewPlan.description}</p>
              )}

              {/* Pricing grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-dark-300 rounded-xl p-3 text-center">
                  <div className="text-white font-black text-xl" style={{ fontFamily: 'Oswald' }}>₹{viewPlan.monthlyPrice?.toLocaleString()}</div>
                  <div className="text-gray-500 text-xs mt-0.5">Monthly</div>
                </div>
                {viewPlan.quarterlyPrice > 0 && (
                  <div className="bg-dark-300 rounded-xl p-3 text-center">
                    <div className="text-purple-400 font-black text-xl" style={{ fontFamily: 'Oswald' }}>₹{viewPlan.quarterlyPrice?.toLocaleString()}</div>
                    <div className="text-gray-500 text-xs mt-0.5">Quarterly (3 mo)</div>
                  </div>
                )}
                {viewPlan.halfYearlyPrice > 0 && (
                  <div className="bg-dark-300 rounded-xl p-3 text-center">
                    <div className="text-orange-400 font-black text-xl" style={{ fontFamily: 'Oswald' }}>₹{viewPlan.halfYearlyPrice?.toLocaleString()}</div>
                    <div className="text-gray-500 text-xs mt-0.5">Half-Yearly (6 mo)</div>
                  </div>
                )}
                {viewPlan.yearlyPrice > 0 && (
                  <div className="bg-dark-300 rounded-xl p-3 text-center">
                    <div className="text-green-400 font-black text-xl" style={{ fontFamily: 'Oswald' }}>₹{viewPlan.yearlyPrice?.toLocaleString()}</div>
                    <div className="text-gray-500 text-xs mt-0.5">Yearly (12 mo)</div>
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400">
                  {DURATIONS.find((d) => d.value === viewPlan.duration)?.label || 'Monthly'}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400">Active</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-dark-300 text-gray-400">
                  <FaUsers className="inline mr-1 text-primary" />{viewPlan.currentMembers || 0} members
                </span>
              </div>

              {/* Features */}
              {viewPlan.features?.length > 0 && (
                <div>
                  <div className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Features</div>
                  <ul className="space-y-2">
                    {viewPlan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                        <FaCheck className="text-primary text-xs flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => { setViewPlan(null); openEdit(viewPlan, 'details') }} className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-2.5 rounded-xl text-sm transition-colors">
                  <FaEdit className="text-xs" /> Edit
                </button>
                <button onClick={() => setViewPlan(null)} className="px-6 bg-dark-300 hover:bg-dark-400 text-gray-300 py-2.5 rounded-xl text-sm transition-colors">
                  Close
                </button>
              </div>
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
              <h3 className="text-white font-bold mb-2">Remove Plan?</h3>
              <p className="text-gray-400 text-sm mb-6">This plan will be deactivated and hidden from the site.</p>
              <div className="flex gap-3">
                <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-full font-semibold transition-colors text-sm">
                  Remove
                </button>
                <button onClick={() => setDeleteId(null)} className="flex-1 bg-dark-300 hover:bg-dark-400 text-gray-300 py-2.5 rounded-full transition-colors text-sm">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Standalone Offer Add / Edit Modal */}
      <AnimatePresence>
        {(offerModal === 'add' || offerModal?.type === 'edit') && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={closeOfferModal}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-dark-200 border border-dark-400 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>
                  {offerModal === 'add' ? 'ADD OFFER' : 'EDIT OFFER'}
                </h3>
                <button onClick={closeOfferModal} className="text-gray-500 hover:text-white"><FaTimes /></button>
              </div>

              <div className="space-y-4">
                {/* Image */}
                <div>
                  <label className="text-gray-400 text-xs mb-2 block">Offer Image <span className="text-red-400">*</span></label>
                  <label className="block cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files[0]
                      if (!file) return
                      setStandaloneOfferForm((f) => ({ ...f, file, preview: URL.createObjectURL(file) }))
                    }} />
                    {standaloneOfferForm.preview ? (
                      <div className="relative group rounded-xl overflow-hidden border border-dark-400">
                        <img src={standaloneOfferForm.preview} alt="Offer" className="w-full h-44 object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <FaUpload className="text-white text-xl" />
                          <span className="text-white text-sm font-semibold">Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-dark-400 hover:border-orange-500/50 rounded-xl h-36 flex flex-col items-center justify-center gap-3 transition-colors">
                        <FaUpload className="text-3xl text-gray-600" />
                        <span className="text-gray-500 text-sm">Click to upload offer image</span>
                        <span className="text-gray-600 text-xs">JPG, PNG, WebP recommended</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Title */}
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Offer Title <span className="text-red-400">*</span></label>
                  <input
                    value={standaloneOfferForm.title}
                    onChange={(e) => setStandaloneOfferForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Summer Sale – 40% OFF"
                    className="input-field text-sm w-full"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Description</label>
                  <textarea
                    value={standaloneOfferForm.description}
                    onChange={(e) => setStandaloneOfferForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description of the offer..."
                    rows={2}
                    className="input-field text-sm w-full resize-none"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Start Date</label>
                    <input type="date" value={standaloneOfferForm.startDate}
                      onChange={(e) => setStandaloneOfferForm((f) => ({ ...f, startDate: e.target.value }))}
                      className="input-field text-sm w-full" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">End Date</label>
                    <input type="date" value={standaloneOfferForm.endDate}
                      onChange={(e) => setStandaloneOfferForm((f) => ({ ...f, endDate: e.target.value }))}
                      className="input-field text-sm w-full" />
                  </div>
                </div>

                {/* Active */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={standaloneOfferForm.isActive}
                    onChange={(e) => setStandaloneOfferForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-orange-500" />
                  <div>
                    <span className="text-gray-300 text-sm">Show on site</span>
                    <p className="text-gray-600 text-xs">When enabled, this offer is visible on the Membership page</p>
                  </div>
                </label>

                <div className="flex gap-3 pt-1">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleStandaloneOfferSave} disabled={standaloneSaving}
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full font-semibold text-sm transition-colors disabled:opacity-60">
                    {standaloneSaving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><FaTag className="text-xs" /> {offerModal === 'add' ? 'Create Offer' : 'Save Changes'}</>}
                  </motion.button>
                  <button onClick={closeOfferModal} className="px-6 bg-dark-300 hover:bg-dark-400 text-gray-300 py-3 rounded-full text-sm transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Offer Confirm */}
      <AnimatePresence>
        {deleteOfferId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setDeleteOfferId(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-dark-200 border border-dark-400 rounded-2xl p-6 w-full max-w-sm text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <FaTrash className="text-red-400 text-3xl mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Delete Offer?</h3>
              <p className="text-gray-400 text-sm mb-6">This offer will be permanently removed from the site.</p>
              <div className="flex gap-3">
                <button onClick={() => handleDeleteOffer(deleteOfferId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-full font-semibold transition-colors text-sm">
                  Delete
                </button>
                <button onClick={() => setDeleteOfferId(null)} className="flex-1 bg-dark-300 hover:bg-dark-400 text-gray-300 py-2.5 rounded-full transition-colors text-sm">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
