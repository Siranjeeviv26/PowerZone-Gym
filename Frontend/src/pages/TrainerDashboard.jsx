import { useState, useEffect, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import {
  FaUsers, FaUserTie, FaCheck, FaCheckCircle, FaTimes, FaAppleAlt, FaDumbbell,
  FaCalendarAlt, FaSearch, FaEye, FaArrowLeft, FaHome, FaBars, FaSignOutAlt,
  FaUser, FaPhone, FaIdCard, FaEdit, FaSave, FaMapMarkerAlt, FaClock, FaRunning, FaChevronDown, FaStar,
  FaInstagram, FaFacebook, FaTwitter, FaLinkedin,
} from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { logout, setUser } from '../store/slices/authSlice'
import { validate, positiveNum, fieldClass } from '../utils/validate'
import PhoneInput from '../components/shared/PhoneInput'

const Err = ({ msg }) => msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null

const WorkoutDayCard = ({ day, di }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-dark-300 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-dark-400/40 transition-colors text-left"
      >
        <span className="text-xs font-bold bg-dark-400 text-gray-300 px-2.5 py-1 rounded-full font-mono flex-shrink-0">Day {day.dayNumber ?? di + 1}</span>
        <span className="text-white font-bold flex-1">{day.dayName}</span>
        {day.coachGuided && <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full flex-shrink-0">Coach Guided</span>}
        {day.exercises?.length > 0 && (
          <span className="text-gray-500 text-xs flex-shrink-0 mr-1">{day.exercises.length} exercises</span>
        )}
        <FaChevronDown className={`text-gray-400 text-xs flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4">
          {day.exercises?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="text-gray-500 text-left border-b border-dark-500">
                    <th className="pb-2 pr-4 font-medium">Exercise</th>
                    <th className="pb-2 px-3 text-center font-medium">Sets</th>
                    <th className="pb-2 pl-3 text-center font-medium">Reps</th>
                  </tr>
                </thead>
                <tbody>
                  {day.exercises.map((ex, ei) => (
                    <tr key={ei} className="border-b border-dark-500/50 last:border-0">
                      <td className="py-2 pr-4 text-white font-medium">{ex.name}</td>
                      <td className="py-2 px-3 text-center text-gray-300">{ex.sets || '—'}</td>
                      <td className="py-2 pl-3 text-center text-gray-300">{ex.reps || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-xs pt-1">No exercises listed.</p>
          )}
        </div>
      )}
    </div>
  )
}

const ATTENDANCE_RULES = { duration: [positiveNum('Duration')] }

const navItems = [
  { to: '/', label: 'View Site', icon: FaHome },
]

const statusColor = {
  active: 'text-green-400 bg-green-500/10',
  pending: 'text-yellow-400 bg-yellow-500/10',
  expired: 'text-red-400 bg-red-500/10',
  frozen: 'text-blue-400 bg-blue-500/10',
}

export default function TrainerDashboard() {
  const { user } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [clientPage, setClientPage] = useState(1)
  const CLIENT_PAGE_SIZE = 15
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024)
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientDetail, setClientDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [clientPlanTab, setClientPlanTab] = useState('plan')
  const [modal, setModal] = useState(null)
  const [attendanceForm, setAttendanceForm] = useState({ duration: '', workoutType: '', notes: '' })
  const [attendanceErrors, setAttendanceErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const [adminDietPlans, setAdminDietPlans] = useState([])
  const [adminWorkouts, setAdminWorkouts] = useState([])
  const [selectedDietPlan, setSelectedDietPlan] = useState('')
  const [selectedWorkout, setSelectedWorkout] = useState('')
  const [plansLoading, setPlansLoading] = useState(false)

  const [trainerProfile, setTrainerProfile] = useState(null)
  const [profileForm, setProfileForm] = useState({ phone: '', bio: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [phoneError, setPhoneError] = useState('')

  const [myActivities, setMyActivities] = useState([])
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const [activityNotifCount, setActivityNotifCount] = useState(0)

  useEffect(() => {
    fetchClients(); fetchTrainerProfile(); fetchMyActivities(); fetchActivityNotifCount()
    const interval = setInterval(fetchActivityNotifCount, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchClients = async () => {
    try {
      const { data } = await api.get('/trainers/me/clients')
      setClients(data.clients || [])
    } catch {
      toast.error('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  const fetchTrainerProfile = async () => {
    try {
      const { data } = await api.get('/trainers/me/profile')
      setTrainerProfile(data.trainer)
      setProfileForm({
        phone: data.trainer.phone || '',
        bio: data.trainer.bio || '',
        socialLinks: {
          instagram: data.trainer.socialLinks?.instagram || '',
          facebook: data.trainer.socialLinks?.facebook || '',
          twitter: data.trainer.socialLinks?.twitter || '',
          linkedin: data.trainer.socialLinks?.linkedin || '',
        },
      })
    } catch {}
  }

  const fetchMyActivities = async () => {
    setActivitiesLoading(true)
    try {
      const { data } = await api.get('/activities')
      setMyActivities(data.activities || [])
    } catch {}
    finally { setActivitiesLoading(false) }
  }

  const fetchActivityNotifCount = async () => {
    try {
      const { data } = await api.get('/notifications')
      const count = (data.notifications || []).filter(
        (n) => n.type === 'activity' && !n.isRead
      ).length
      setActivityNotifCount(count)
    } catch {}
  }

  const handleOpenActivities = async () => {
    setActiveTab('activities')
    setSelectedClient(null)
    if (activityNotifCount > 0) {
      try {
        await api.put('/notifications/mark-all-read')
        setActivityNotifCount(0)
      } catch {}
    }
  }

  const fetchAdminPlans = async () => {
    setPlansLoading(true)
    try {
      const [dietRes, workoutRes] = await Promise.all([
        api.get('/diet?admin=true'),
        api.get('/workouts?admin=true'),
      ])
      setAdminDietPlans((dietRes.data.plans || []).filter((p) => p.planType === 'member'))
      setAdminWorkouts((workoutRes.data.workouts || []).filter((w) => w.planType === 'member'))
    } catch {
      toast.error('Failed to load plans')
    } finally {
      setPlansLoading(false)
    }
  }

  const openClient = async (client) => {
    setSelectedClient(client)
    setDetailLoading(true)
    try {
      const { data } = await api.get(`/trainers/me/clients/${client._id}`)
      setClientDetail(data)
    } catch {
      toast.error('Failed to load client details')
    } finally {
      setDetailLoading(false)
    }
  }

  const openDietModal = () => {
    setSelectedDietPlan('')
    setModal('diet')
    fetchAdminPlans()
  }

  const openWorkoutModal = () => {
    setSelectedWorkout('')
    setModal('workout')
    fetchAdminPlans()
  }

  const closeModal = () => {
    setModal(null)
    setAttendanceErrors({})
    setSelectedDietPlan('')
    setSelectedWorkout('')
  }

  const handleAttendance = async (e) => {
    e.preventDefault()
    const errs = validate(attendanceForm, ATTENDANCE_RULES)
    if (Object.keys(errs).length) { setAttendanceErrors(errs); return }
    setAttendanceErrors({})
    setSaving(true)
    try {
      await api.post(`/trainers/me/clients/${selectedClient._id}/attendance`, attendanceForm)
      toast.success('Attendance marked!')
      closeModal()
      setAttendanceForm({ duration: '', workoutType: '', notes: '' })
      openClient(selectedClient)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance')
    } finally {
      setSaving(false)
    }
  }

  const handleAssignDiet = async (e) => {
    e.preventDefault()
    if (!selectedDietPlan) return toast.error('Please select a diet plan')
    setSaving(true)
    try {
      await api.post(`/trainers/me/clients/${selectedClient._id}/diet`, { planId: selectedDietPlan })
      toast.success('Diet plan assigned!')
      closeModal()
      openClient(selectedClient)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign diet plan')
    } finally {
      setSaving(false)
    }
  }

  const handleAssignWorkout = async (e) => {
    e.preventDefault()
    if (!selectedWorkout) return toast.error('Please select a workout plan')
    setSaving(true)
    try {
      await api.post(`/trainers/me/clients/${selectedClient._id}/workout`, { planId: selectedWorkout })
      toast.success('Workout plan assigned!')
      closeModal()
      openClient(selectedClient)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign workout plan')
    } finally {
      setSaving(false)
    }
  }

  const personalClients = clients.filter((c) => c.trainerRole === 'Personal Trainer')
  const displayedClients = activeTab === 'all' ? clients : personalClients
  const filtered = displayedClients.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    )
  })
  const clientTotalPages = Math.ceil(filtered.length / CLIENT_PAGE_SIZE)
  const paginatedClients = filtered.slice((clientPage - 1) * CLIENT_PAGE_SIZE, clientPage * CLIENT_PAGE_SIZE)

  return (
    <div className="h-screen bg-dark flex overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto flex-shrink-0 flex flex-col bg-dark-100 border-r border-dark-400 transition-all duration-300 ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64 lg:translate-x-0 lg:w-16'}`}>
        <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-6' : 'justify-center px-3'} py-5 border-b border-dark-400`}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <FaUserTie className="text-white text-sm" />
          </div>
          {sidebarOpen && <span className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>TRAINER</span>}
        </div>
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {/* Dashboard */}
          <button
            onClick={() => { setActiveTab('dashboard'); setSelectedClient(null); if (window.innerWidth < 1024) setSidebarOpen(false) }}
            className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl mb-1 text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-primary/15 text-primary border border-primary/20' : 'text-gray-400 hover:bg-dark-300 hover:text-white'}`}
          >
            <FaRunning className="text-base flex-shrink-0" />{sidebarOpen && 'Dashboard'}
          </button>
          {/* My Clients */}
          <button
            onClick={() => { setActiveTab('all'); setSelectedClient(null); if (window.innerWidth < 1024) setSidebarOpen(false) }}
            className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl mb-1 text-sm font-medium transition-all ${(activeTab === 'all' || activeTab === 'personal') ? 'bg-primary/15 text-primary border border-primary/20' : 'text-gray-400 hover:bg-dark-300 hover:text-white'}`}
          >
            <FaUsers className="text-base flex-shrink-0" />{sidebarOpen && 'My Clients'}
          </button>
          {/* My Activities */}
          <button
            onClick={() => { handleOpenActivities(); if (window.innerWidth < 1024) setSidebarOpen(false) }}
            className={`relative w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl mb-1 text-sm font-medium transition-all ${activeTab === 'activities' ? 'bg-primary/15 text-primary border border-primary/20' : 'text-gray-400 hover:bg-dark-300 hover:text-white'}`}
          >
            <FaCalendarAlt className="text-base flex-shrink-0" />
            {sidebarOpen && (
              <span className="flex items-center gap-2 flex-1">
                My Activities
                {activityNotifCount > 0 && (
                  <span className="ml-auto min-w-[18px] h-[18px] px-1 bg-primary rounded-full text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {activityNotifCount > 99 ? '99+' : activityNotifCount}
                  </span>
                )}
              </span>
            )}
            {!sidebarOpen && activityNotifCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </button>
          {/* My Profile */}
          <button
            onClick={() => { setActiveTab('profile'); setSelectedClient(null); if (window.innerWidth < 1024) setSidebarOpen(false) }}
            className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl mb-1 text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-primary/15 text-primary border border-primary/20' : 'text-gray-400 hover:bg-dark-300 hover:text-white'}`}
          >
            <FaUser className="text-base flex-shrink-0" />{sidebarOpen && 'My Profile'}
          </button>
          {/* Visit Site */}
          <Link
            to="/"
            onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
            className={`flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl mb-1 text-sm font-medium transition-all text-gray-400 hover:bg-dark-300 hover:text-white`}
          >
            <FaHome className="text-base flex-shrink-0" />
            {sidebarOpen && 'Visit Site'}
          </Link>
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
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm hidden sm:block">{trainerProfile?.name || user?.name}</span>
            {trainerProfile?.image ? (
              <img src={trainerProfile.image} alt={trainerProfile.name} className="w-9 h-9 rounded-xl object-cover border-2 border-primary/30" />
            ) : (
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white text-sm font-black">
                {(trainerProfile?.name || user?.name)?.charAt(0)}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Oswald' }}>DASHBOARD OVERVIEW</h1>
                <p className="text-gray-400 text-sm">Welcome back, {trainerProfile?.name || user?.name}!</p>
              </motion.div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Clients', value: clients.length, color: '#e63946' },
                  { label: 'Personal Clients', value: personalClients.length, color: '#a855f7' },
                  { label: 'Active Members', value: clients.filter((c) => c.membership?.status === 'active').length, color: '#22c55e' },
                  { label: 'Pending Members', value: clients.filter((c) => c.membership?.status === 'pending').length, color: '#f59e0b' },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-5">
                    <div className="text-2xl font-black" style={{ fontFamily: 'Oswald', color: s.color }}>{s.value}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{s.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Quick links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'My Clients', desc: 'View and manage your assigned clients', icon: FaUsers, color: '#e63946', tab: 'all' },
                  { label: 'My Activities', desc: 'Track attendance and session logs', icon: FaCalendarAlt, color: '#4361ee', tab: 'activities' },
                  { label: 'My Profile', desc: 'Update your profile and information', icon: FaUser, color: '#22c55e', tab: 'profile' },
                ].map((q, i) => (
                  <motion.button key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                    onClick={() => { setActiveTab(q.tab); setSelectedClient(null) }}
                    className="glass-card p-5 text-left hover:border-primary/30 transition-all hover:-translate-y-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${q.color}20` }}>
                      <q.icon style={{ color: q.color }} />
                    </div>
                    <div className="text-white font-bold text-sm mb-1">{q.label}</div>
                    <div className="text-gray-500 text-xs">{q.desc}</div>
                  </motion.button>
                ))}
              </div>

              {/* Recent clients */}
              {clients.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold flex items-center gap-2"><FaUsers className="text-primary text-sm" /> Recent Clients</h2>
                    <button onClick={() => { setActiveTab('all'); setSelectedClient(null) }} className="text-primary text-xs hover:underline">View all</button>
                  </div>
                  <div className="space-y-3">
                    {clients.slice(0, 4).map((c, i) => (
                      <div key={c._id} className="flex items-center justify-between py-2 border-b border-dark-400/50 last:border-0">
                        <div className="flex items-center gap-3">
                          {c.avatar ? (
                            <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">{c.name?.charAt(0)}</div>
                          )}
                          <div>
                            <div className="text-white text-sm font-medium">{c.name}</div>
                            <div className="text-gray-500 text-xs">{c.email}</div>
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColor[c.membership?.status] || 'bg-gray-500/10 text-gray-400'}`}>
                          {c.membership?.status || 'none'}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && !trainerProfile && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {activeTab === 'profile' && trainerProfile && (
            <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>MY PROFILE</h1>
              <p className="text-gray-400 text-sm">View and update your trainer profile information</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* LEFT — Profile Info */}
              <div className="space-y-4">
                {/* Profile Header */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-5">
                    <label className="relative flex-shrink-0 cursor-pointer group" title="Change photo">
                      {trainerProfile.image ? (
                        <img src={trainerProfile.image} alt={trainerProfile.name} className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary/20">
                          {trainerProfile.name?.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {imageUploading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaUser className="text-white text-lg" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={imageUploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const fd = new FormData()
                          fd.append('image', file)
                          setImageUploading(true)
                          try {
                            const { data } = await api.put('/trainers/me/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
                            await fetchTrainerProfile()
                            if (data.trainer?.image) {
                              dispatch(setUser({ ...user, avatar: data.trainer.image }))
                            }
                            toast.success('Profile photo updated!')
                          } catch (err) {
                            toast.error(err.response?.data?.message || 'Upload failed')
                          } finally {
                            setImageUploading(false)
                            e.target.value = ''
                          }
                        }}
                      />
                    </label>
                    <div>
                      {trainerProfile.trainerId && (
                        <span className="text-xs font-mono bg-dark-400 text-gray-400 px-2 py-0.5 rounded-full">{trainerProfile.trainerId}</span>
                      )}
                      <h2 className="text-xl font-black text-white mt-1" style={{ fontFamily: 'Oswald' }}>{trainerProfile.name}</h2>
                      <p className="text-primary text-sm">{trainerProfile.speciality}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{trainerProfile.email}</p>
                    </div>
                  </div>
                  {trainerProfile.bio && (
                    <p className="text-gray-400 text-sm mt-4 pt-4 border-t border-dark-400 leading-relaxed">{trainerProfile.bio}</p>
                  )}
                  {(trainerProfile.socialLinks?.instagram || trainerProfile.socialLinks?.facebook || trainerProfile.socialLinks?.twitter || trainerProfile.socialLinks?.linkedin) && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-dark-400">
                      {trainerProfile.socialLinks?.instagram && (
                        <a href={trainerProfile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-pink-500/10 rounded-lg flex items-center justify-center text-pink-400 hover:bg-pink-500/20 transition-colors" title="Instagram">
                          <FaInstagram className="text-sm" />
                        </a>
                      )}
                      {trainerProfile.socialLinks?.facebook && (
                        <a href={trainerProfile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-colors" title="Facebook">
                          <FaFacebook className="text-sm" />
                        </a>
                      )}
                      {trainerProfile.socialLinks?.twitter && (
                        <a href={trainerProfile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-sky-500/10 rounded-lg flex items-center justify-center text-sky-400 hover:bg-sky-500/20 transition-colors" title="Twitter">
                          <FaTwitter className="text-sm" />
                        </a>
                      )}
                      {trainerProfile.socialLinks?.linkedin && (
                        <a href={trainerProfile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-blue-700/10 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-700/20 transition-colors" title="LinkedIn">
                          <FaLinkedin className="text-sm" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="glass-card p-5">
                  <h3 className="text-white font-bold mb-4 text-sm flex items-center gap-2">
                    <FaUserTie className="text-primary text-xs" /> Trainer Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Total Clients', value: trainerProfile.clients?.length ?? 0 },
                      { label: 'Experience', value: trainerProfile.experience ? `${trainerProfile.experience} yrs` : '—' },
                      { label: 'Branch', value: trainerProfile.branch?.name || '—' },
                      { label: 'Phone', value: trainerProfile.phone ? (trainerProfile.phone.startsWith('+91') ? trainerProfile.phone : `+91${trainerProfile.phone}`) : '—' },
                    ].map((s) => (
                      <div key={s.label} className="p-3 bg-dark-300 rounded-xl border border-dark-500">
                        <div className="text-gray-500 text-[11px] mb-0.5">{s.label}</div>
                        <div className="text-white text-sm font-semibold">{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Overall Rating */}
                  <div className="mt-3 p-3 bg-dark-300 rounded-xl border border-dark-500">
                    <div className="text-gray-500 text-[11px] mb-2">Overall Rating</div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FaStar key={s} className={`text-base ${s <= Math.round(trainerProfile.averageRating || 0) ? 'text-yellow-400' : 'text-gray-600'}`} />
                        ))}
                      </div>
                      <span className="text-yellow-400 font-bold text-sm">
                        {trainerProfile.averageRating > 0 ? trainerProfile.averageRating.toFixed(1) : '—'}
                      </span>
                      <span className="text-gray-500 text-xs">({trainerProfile.reviews?.length ?? 0} {trainerProfile.reviews?.length === 1 ? 'review' : 'reviews'})</span>
                    </div>
                  </div>
                </div>

                {/* Client Reviews */}
                {trainerProfile.reviews?.length > 0 && (
                  <div className="glass-card p-5">
                    <h3 className="text-white font-bold mb-4 text-sm flex items-center gap-2">
                      <FaStar className="text-yellow-400 text-xs" /> Client Reviews
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {[...trainerProfile.reviews].sort((a, b) => new Date(b.date) - new Date(a.date)).map((r, i) => (
                        <div key={i} className="p-3 bg-dark-300 rounded-xl border border-dark-500">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0">
                                {r.user?.name?.charAt(0) || '?'}
                              </div>
                              <span className="text-white text-xs font-medium">{r.user?.name || 'Member'}</span>
                            </div>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <FaStar key={s} className={`text-[10px] ${s <= r.rating ? 'text-yellow-400' : 'text-gray-600'}`} />
                              ))}
                            </div>
                          </div>
                          {r.comment && <p className="text-gray-400 text-xs leading-relaxed mt-1">{r.comment}</p>}
                          {r.date && <p className="text-gray-600 text-[10px] mt-1.5">{new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT — Edit Form */}
              <div className="glass-card p-6 h-fit">
                <h3 className="text-white font-bold mb-5 text-sm flex items-center gap-2">
                  <FaEdit className="text-primary text-xs" /> Edit Profile
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Bio</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                      className="input-field text-sm h-24 resize-none"
                      placeholder="Short bio about yourself..."
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Phone</label>
                    <PhoneInput
                      value={profileForm.phone}
                      onChange={(v) => {
                        setProfileForm((p) => ({ ...p, phone: v }))
                        const digits = v.replace(/^\+91/, '')
                        if (!digits) setPhoneError('')
                        else if (digits.length !== 10) setPhoneError('Enter exactly 10 digits')
                        else setPhoneError('')
                      }}
                      error={phoneError}
                    />
                    {phoneError && <p className="text-red-400 text-xs mt-1">{phoneError}</p>}
                  </div>

                  {/* Social Links */}
                  <div>
                    <label className="text-gray-400 text-xs mb-2 block font-medium">Social Media Links</label>
                    <div className="space-y-2">
                      {[
                        { key: 'instagram', icon: FaInstagram, color: 'text-pink-400', placeholder: 'https://instagram.com/username' },
                        { key: 'facebook', icon: FaFacebook, color: 'text-blue-400', placeholder: 'https://facebook.com/username' },
                        { key: 'twitter', icon: FaTwitter, color: 'text-sky-400', placeholder: 'https://twitter.com/username' },
                        { key: 'linkedin', icon: FaLinkedin, color: 'text-blue-500', placeholder: 'https://linkedin.com/in/username' },
                      ].map(({ key, icon: Icon, color, placeholder }) => (
                        <div key={key} className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-dark-400 rounded-lg flex items-center justify-center flex-shrink-0 border border-dark-500">
                            <Icon className={`text-sm ${color}`} />
                          </div>
                          <input
                            value={profileForm.socialLinks?.[key] || ''}
                            onChange={(e) => setProfileForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, [key]: e.target.value } }))}
                            className="input-field text-sm flex-1"
                            placeholder={placeholder}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: phoneError ? 1 : 1.02 }}
                    disabled={profileSaving || !!phoneError}
                    onClick={async () => {
                      const digits = (profileForm.phone || '').replace(/^\+91/, '')
                      if (digits && digits.length !== 10) {
                        setPhoneError('Enter exactly 10 digits')
                        return
                      }
                      setProfileSaving(true)
                      try {
                        await api.put('/trainers/me/profile', profileForm)
                        toast.success('Profile updated!')
                        fetchTrainerProfile()
                      } catch { toast.error('Failed to update') }
                      finally { setProfileSaving(false) }
                    }}
                    className="btn-primary py-3 w-full disabled:opacity-60 text-sm"
                  >
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* ACTIVITIES TAB */}
          {activeTab === 'activities' && (
            <div className="space-y-4 max-w-3xl">
              <div>
                <h2 className="text-xl font-black text-white mb-1" style={{ fontFamily: 'Oswald' }}>UPCOMING ACTIVITIES</h2>
                <p className="text-gray-400 text-sm">All scheduled gym activities — activities assigned to you are highlighted</p>
              </div>

              {activitiesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : myActivities.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <FaCalendarAlt className="text-4xl text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No upcoming activities scheduled yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myActivities.map((a) => {
                    const actDate = new Date(a.date)
                    const isToday = actDate.toDateString() === new Date().toDateString()
                    const isAssigned = trainerProfile && a.trainers?.some((t) => (t._id || t).toString() === trainerProfile._id?.toString())
                    return (
                      <div key={a._id} className={`glass-card p-5 ${isAssigned ? 'border-primary/40 ring-1 ring-primary/20' : ''} ${isToday ? 'border-yellow-500/30' : ''}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="text-white font-bold">{a.title}</h3>
                              <span className="text-xs text-primary">{a.activityType}</span>
                              {isAssigned && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold border border-primary/20">Your Session</span>
                              )}
                              {isToday && <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full font-semibold">Today</span>}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-2">
                              <span className="flex items-center gap-1">
                                <FaCalendarAlt className="text-gray-600" />
                                {actDate.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                                {a.time && ` · ${a.time}`}
                              </span>
                              {a.trainers?.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <FaUserTie className="text-gray-600" />
                                  {a.trainers.map((t) => t.name).join(', ')}
                                </span>
                              )}
                              {a.branch && <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-gray-600" />{a.branch.name}</span>}
                            </div>
                            {a.description && (
                              <div
                                className="text-gray-500 text-xs [&_strong]:font-bold [&_strong]:text-gray-300 [&_em]:italic [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-0.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_mark]:rounded [&_mark]:px-0.5"
                                dangerouslySetInnerHTML={{ __html: a.description }}
                              />
                            )}
                          </div>
                          
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'personal') && (selectedClient ? (
            /* CLIENT DETAIL VIEW */

            <div className="space-y-6">
              <button onClick={() => { setSelectedClient(null); setClientDetail(null) }} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                <FaArrowLeft /> Back to Clients
              </button>

              {detailLoading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
              ) : clientDetail && (
                <>
                  {/* Client Header Card */}
                  <div className="glass-card p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary text-xl font-black">
                          {clientDetail.client.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-bold text-lg">{clientDetail.client.name}</div>
                          <div className="text-gray-400 text-sm">{clientDetail.client.email}</div>
                          {selectedClient.trainerRole && (
                            <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${selectedClient.trainerRole === 'Personal Trainer' ? 'bg-purple-500/10 text-purple-400' : 'bg-orange-500/10 text-orange-400'}`}>
                              {selectedClient.trainerRole}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setModal('attendance')} className="btn-primary text-xs py-2 px-4 flex items-center gap-1">
                          <FaCheckCircle className="text-xs" /> Mark Attendance
                        </button>
                        <button onClick={openDietModal} className="bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-all rounded-xl text-xs py-2 px-4 flex items-center gap-1">
                          <FaAppleAlt className="text-xs" /> Assign Diet
                        </button>
                        <button onClick={openWorkoutModal} className="bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all rounded-xl text-xs py-2 px-4 flex items-center gap-1">
                          <FaDumbbell className="text-xs" /> Assign Workout
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                      {[
                        { label: 'Plan', value: clientDetail.client.membership?.plan?.name || '—' },
                        { label: 'Status', value: clientDetail.client.membership?.status || '—' },
                        { label: 'Goal', value: clientDetail.client.goal || '—' },
                        { label: 'Branch', value: clientDetail.client.branch?.name || '—' },
                      ].map((item) => (
                        <div key={item.label} className="bg-dark-300 rounded-xl p-3">
                          <div className="text-gray-500 text-xs">{item.label}</div>
                          <div className="text-white text-sm font-medium mt-0.5 capitalize">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Attendance History */}
                    <div className="glass-card p-6">
                      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <FaCalendarAlt className="text-primary" /> Recent Attendance ({clientDetail.client.attendance?.length || 0} total)
                      </h3>
                      {!clientDetail.client.attendance?.length ? (
                        <p className="text-gray-500 text-sm">No attendance recorded yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {[...clientDetail.client.attendance]
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .slice(0, 8)
                            .map((a, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-dark-300 rounded-xl">
                                <div>
                                  <div className="text-white text-sm">{a.workoutType || 'Session'}</div>
                                  <div className="text-gray-500 text-xs">{new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                </div>
                                {a.duration && <span className="text-gray-400 text-xs">{a.duration} min</span>}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Assigned Plans — pill tabs */}
                    <div className="glass-card p-5">
                      {/* Tab switcher */}
                      <div className="inline-flex items-center bg-dark-300 rounded-xl p-1 border border-dark-500 mb-5">
                        {[
                          { id: 'plan', label: 'Plan' },
                          { id: 'workout', label: 'Workout' },
                          { id: 'diet', label: 'Diet Plan' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setClientPlanTab(t.id)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                              clientPlanTab === t.id ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      {/* Plan Tab */}
                      {clientPlanTab === 'plan' && (() => {
                        const mem = clientDetail.client.membership
                        return mem?.plan ? (
                          <div className="space-y-3">
                            <div className="text-primary font-semibold text-lg">{mem.plan.name || '—'}</div>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { label: 'Status', value: mem.status || '—' },
                                { label: 'Monthly', value: mem.plan.monthlyPrice ? `₹${mem.plan.monthlyPrice.toLocaleString()}` : '—' },
                                { label: 'Start', value: mem.startDate ? new Date(mem.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
                                { label: 'Expires', value: mem.endDate ? new Date(mem.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
                              ].map((item) => (
                                <div key={item.label} className="bg-dark-300 rounded-xl p-3">
                                  <div className="text-gray-500 text-xs">{item.label}</div>
                                  <div className="text-white text-sm font-medium mt-0.5 capitalize">{item.value}</div>
                                </div>
                              ))}
                            </div>
                            {mem.plan.features?.length > 0 && (
                              <ul className="mt-2 space-y-1.5">
                                {mem.plan.features.map((f) => (
                                  <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                                    <FaCheck className="text-primary text-[9px] flex-shrink-0" />{f}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : <p className="text-gray-500 text-sm">No membership plan assigned.</p>
                      })()}

                      {/* Workout Tab */}
                      {clientPlanTab === 'workout' && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white font-bold flex items-center gap-2"><FaDumbbell className="text-blue-400 text-sm" /> Workout Plan</h3>
                            {clientDetail.workoutPlan?.days?.length > 0 && (
                              <button onClick={() => setModal('viewWorkout')} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
                                <FaEye className="text-xs" /> View Full
                              </button>
                            )}
                          </div>
                          {clientDetail.workoutPlan ? (
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-primary font-semibold">{clientDetail.workoutPlan.title}</span>
                                {clientDetail.workoutPlan.planType === 'member' && (
                                  <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">Member Plan</span>
                                )}
                              </div>
                              {clientDetail.workoutPlan.planType === 'member' ? (
                                <div className="text-gray-400 text-xs mt-1">
                                  {clientDetail.workoutPlan.levelNumber && <span className="mr-3">Level {clientDetail.workoutPlan.levelNumber}</span>}
                                  {clientDetail.workoutPlan.days?.length > 0 && <span className="mr-3">{clientDetail.workoutPlan.days.length} days</span>}
                                  {clientDetail.workoutPlan.completionWeeks && <span>{clientDetail.workoutPlan.completionWeeks} weeks</span>}
                                </div>
                              ) : (
                                <div>
                                  <div className="text-gray-400 text-sm mt-1">{[clientDetail.workoutPlan.category, clientDetail.workoutPlan.level].filter(Boolean).join(' · ')}</div>
                                  {clientDetail.workoutPlan.description && <div className="text-gray-500 text-xs mt-1 line-clamp-2">{clientDetail.workoutPlan.description}</div>}
                                </div>
                              )}
                            </div>
                          ) : <p className="text-gray-500 text-sm">No workout plan assigned yet.</p>}
                        </div>
                      )}

                      {/* Diet Tab */}
                      {clientPlanTab === 'diet' && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white font-bold flex items-center gap-2"><FaAppleAlt className="text-green-400 text-sm" /> Diet Plan</h3>
                            {clientDetail.dietPlan?.meals?.length > 0 && (
                              <button onClick={() => setModal('viewDiet')} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
                                <FaEye className="text-xs" /> View Full
                              </button>
                            )}
                          </div>
                          {clientDetail.dietPlan ? (
                            <div>
                              <div className="text-primary font-semibold">{clientDetail.dietPlan.title}</div>
                              <div className="text-gray-400 text-sm mt-1">{clientDetail.dietPlan.goal}</div>
                              <div className="grid grid-cols-2 gap-2 mt-3">
                                {[
                                  { label: 'Calories', value: clientDetail.dietPlan.totalCalories, unit: 'kcal', color: 'text-orange-400' },
                                  { label: 'Protein', value: clientDetail.dietPlan.totalProtein, unit: 'g', color: 'text-blue-400' },
                                  { label: 'Carbs', value: clientDetail.dietPlan.totalCarbs, unit: 'g', color: 'text-green-400' },
                                  { label: 'Fat', value: clientDetail.dietPlan.totalFat, unit: 'g', color: 'text-yellow-400' },
                                ].map((n) => (
                                  <div key={n.label} className="bg-dark-300 rounded-lg p-2 text-center">
                                    <div className={`font-bold text-sm ${n.color}`}>{n.value > 0 ? `${Number(n.value).toFixed(2)}${n.unit}` : '—'}</div>
                                    <div className="text-gray-500 text-xs mt-0.5">{n.label}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : <p className="text-gray-500 text-sm">No diet plan assigned yet.</p>}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* CLIENTS LIST */
            <div className="space-y-6">

              {/* Page heading */}
              <div>
                <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>MY CLIENTS</h1>
                <p className="text-gray-400 text-sm">Manage your assigned clients, track sessions and assign plans</p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Clients', value: clients.length, color: 'text-primary', bg: 'bg-primary/10', icon: FaUsers },
                  { label: 'Personal Clients', value: personalClients.length, color: 'text-purple-400', bg: 'bg-purple-500/10', icon: FaUserTie },
                  { label: 'Active Members', value: clients.filter((c) => c.membership?.status === 'active').length, color: 'text-green-400', bg: 'bg-green-500/10', icon: FaCheckCircle },
                  { label: 'Total Sessions', value: clients.reduce((sum, c) => sum + (c.attendance?.length || 0), 0), color: 'text-blue-400', bg: 'bg-blue-500/10', icon: FaCalendarAlt },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="glass-card p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                      <s.icon className={`${s.color} text-base`} />
                    </div>
                    <div>
                      <div className={`text-2xl font-black ${s.color}`} style={{ fontFamily: 'Oswald' }}>{s.value}</div>
                      <div className="text-gray-500 text-xs">{s.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Tabs + Search */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setActiveTab('all'); setClientPage(1) }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-primary text-white' : 'bg-dark-300 text-gray-400 border border-dark-500 hover:text-white'}`}
                  >
                    All Clients ({clients.length})
                  </button>
                  <button
                    onClick={() => { setActiveTab('personal'); setClientPage(1) }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'personal' ? 'bg-purple-600 text-white' : 'bg-dark-300 text-gray-400 border border-dark-500 hover:text-white'}`}
                  >
                    Personal Clients ({personalClients.length})
                  </button>
                </div>
                <div className="relative flex-1 w-full">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                  <input value={search} onChange={(e) => { setSearch(e.target.value); setClientPage(1) }} placeholder="Search by name, phone or email..." className="input-field pl-10" />
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
              ) : filtered.length === 0 ? (
                <div className="glass-card p-12 text-center text-gray-500">
                  <FaUsers className="text-4xl mx-auto mb-3 opacity-30" />
                  <p>{activeTab === 'personal' ? 'No personal clients assigned to you yet.' : 'No clients assigned to you yet.'}</p>
                  <p className="text-xs mt-1">Ask the admin to assign members to your profile.</p>
                </div>
              ) : (
                <>
                <div className="glass-card overflow-hidden">
                  <table className="w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="text-left text-gray-500 text-xs bg-dark-200 border-b border-dark-400">
                        {['Client', 'Role', 'Plan', 'Status', 'Sessions', 'Actions'].map((h) => (
                          <th key={h} className="py-3 px-4 font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedClients.map((client, i) => (
                        <motion.tr key={client._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} onClick={() => openClient(client)} className="border-b border-dark-400/50 hover:bg-dark-300/50 transition-colors cursor-pointer">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {client.avatar ? (
                                <img src={client.avatar} alt={client.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">{client.name?.charAt(0)}</div>
                              )}
                              <div>
                                <div className="text-white text-sm font-medium">{client.name}</div>
                                <div className="text-gray-500 text-xs">{client.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${client.trainerRole === 'Personal Trainer' ? 'bg-purple-500/10 text-purple-400' : 'bg-orange-500/10 text-orange-400'}`}>
                              {client.trainerRole}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300 text-sm">{client.membership?.plan?.name || '—'}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColor[client.membership?.status] || 'bg-gray-500/10 text-gray-400'}`}>
                              {client.membership?.status || 'none'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-400 text-sm">{client.attendance?.length || 0}</td>
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => openClient(client)} className="w-7 h-7 bg-primary/10 hover:bg-primary/20 rounded-lg flex items-center justify-center text-primary transition-colors" title="View Details">
                              <FaEye className="text-xs" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {clientTotalPages > 1 && (
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-gray-500 text-sm">
                      Showing <span className="text-white font-medium">{(clientPage - 1) * CLIENT_PAGE_SIZE + 1}–{Math.min(clientPage * CLIENT_PAGE_SIZE, filtered.length)}</span> of <span className="text-white font-medium">{filtered.length}</span> clients
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setClientPage((p) => Math.max(1, p - 1))}
                        disabled={clientPage === 1}
                        className="px-3 py-1.5 rounded-lg bg-dark-300 border border-dark-500 text-gray-400 hover:text-white disabled:opacity-40 text-sm transition-colors"
                      >← Prev</button>
                      {Array.from({ length: clientTotalPages }, (_, i) => i + 1).map((n) => {
                        if (n === 1 || n === clientTotalPages || (n >= clientPage - 2 && n <= clientPage + 2)) {
                          return (
                            <button key={n} onClick={() => setClientPage(n)}
                              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${n === clientPage ? 'bg-primary text-white' : 'bg-dark-300 border border-dark-500 text-gray-400 hover:text-white'}`}>
                              {n}
                            </button>
                          )
                        }
                        if (n === clientPage - 3 || n === clientPage + 3) return <span key={n} className="text-gray-600 px-1">…</span>
                        return null
                      })}
                      <button
                        onClick={() => setClientPage((p) => Math.min(clientTotalPages, p + 1))}
                        disabled={clientPage === clientTotalPages}
                        className="px-3 py-1.5 rounded-lg bg-dark-300 border border-dark-500 text-gray-400 hover:text-white disabled:opacity-40 text-sm transition-colors"
                      >Next →</button>
                    </div>
                  </div>
                )}
                </>
              )}
            </div>
          ))}
        </main>
      </div>

      {/* Attendance Modal */}
      <AnimatePresence>
        {modal === 'attendance' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-white font-black text-lg" style={{ fontFamily: 'Oswald' }}>MARK ATTENDANCE</h3>
                  <p className="text-primary text-sm font-semibold mt-0.5">{selectedClient?.name}</p>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <form onSubmit={handleAttendance} className="space-y-4" noValidate>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Workout Session</label>
                  {clientDetail?.workoutPlan?.days?.length > 0 ? (
                    <select value={attendanceForm.workoutType} onChange={(e) => setAttendanceForm({ ...attendanceForm, workoutType: e.target.value })} className="input-field">
                      <option value="">Select session</option>
                      {clientDetail.workoutPlan.days.map((day, di) => (
                        <option key={di} value={day.dayName}>
                          Day {day.dayNumber ?? di + 1}: {day.dayName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={attendanceForm.workoutType}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, workoutType: e.target.value })}
                      placeholder="e.g. Chest & Triceps"
                      className="input-field"
                    />
                  )}
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Duration (minutes)</label>
                  <input type="number" value={attendanceForm.duration} onChange={(e) => setAttendanceForm({ ...attendanceForm, duration: e.target.value })} placeholder="e.g. 60" className={fieldClass(attendanceErrors, 'duration', 'input-field')} />
                  <Err msg={attendanceErrors.duration} />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Notes (optional)</label>
                  <input value={attendanceForm.notes} onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })} placeholder="How was their session?" className="input-field" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-dark-500 text-gray-400 hover:text-white transition-all text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">{saving ? 'Marking...' : 'Mark Attendance'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diet Plan Modal — Select from Admin Plans */}
      <AnimatePresence>
        {modal === 'diet' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-black" style={{ fontFamily: 'Oswald' }}>ASSIGN DIET PLAN — {selectedClient?.name}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <form onSubmit={handleAssignDiet} className="space-y-4">
                <p className="text-gray-500 text-xs">Select one of the admin-created diet plans to assign to this client.</p>
                {plansLoading ? (
                  <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                ) : adminDietPlans.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm bg-dark-300 rounded-xl">
                    No diet plans available. Ask the admin to create diet plans first.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {adminDietPlans.map((plan) => (
                      <label key={plan._id} className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer border transition-all ${selectedDietPlan === plan._id ? 'border-green-500/50 bg-green-500/10' : 'border-dark-500 bg-dark-300 hover:border-dark-400'}`}>
                        <input type="radio" name="dietPlan" value={plan._id} checked={selectedDietPlan === plan._id} onChange={() => setSelectedDietPlan(plan._id)} className="mt-1 accent-green-500" />
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium text-sm">{plan.title}</div>
                          <div className="text-gray-400 text-xs mt-0.5">{plan.goal}</div>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                            {plan.totalCalories > 0 && <span>🔥 {Number(plan.totalCalories).toFixed(2)} kcal</span>}
                            {plan.totalProtein > 0 && <span>💪 {Number(plan.totalProtein).toFixed(2)}g protein</span>}
                            {plan.totalCarbs > 0 && <span>🍞 {Number(plan.totalCarbs).toFixed(2)}g carbs</span>}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <div className="flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-dark-500 text-gray-400 text-sm">Cancel</button>
                  <button type="submit" disabled={saving || !selectedDietPlan} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 text-sm rounded-xl disabled:opacity-60 transition-all font-medium">
                    {saving ? 'Assigning...' : 'Assign Diet Plan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workout Plan Modal — Select from Admin Plans */}
      <AnimatePresence>
        {modal === 'workout' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-black" style={{ fontFamily: 'Oswald' }}>ASSIGN WORKOUT PLAN — {selectedClient?.name}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <form onSubmit={handleAssignWorkout} className="space-y-4">
                <p className="text-gray-500 text-xs">Select a workout plan to assign to this client.</p>
                {plansLoading ? (
                  <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                ) : adminWorkouts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm bg-dark-300 rounded-xl">
                    No workout plans available. Ask admin to create plans from the Workouts section.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {adminWorkouts.map((workout) => {
                      const isMember = workout.planType === 'member'
                      const subtitle = isMember
                        ? [
                            workout.levelNumber ? `Level ${workout.levelNumber}` : null,
                            workout.days?.length ? `${workout.days.length} days` : null,
                            workout.completionWeeks ? `${workout.completionWeeks} wks` : null,
                          ].filter(Boolean).join(' · ') || 'Member Plan'
                        : [workout.category, workout.level].filter(Boolean).join(' · ') || 'Site Plan'
                      return (
                        <label key={workout._id} className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer border transition-all ${selectedWorkout === workout._id ? 'border-blue-500/50 bg-blue-500/10' : 'border-dark-500 bg-dark-300 hover:border-dark-400'}`}>
                          <input type="radio" name="workout" value={workout._id} checked={selectedWorkout === workout._id} onChange={() => setSelectedWorkout(workout._id)} className="mt-1 accent-blue-500" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white font-medium text-sm">{workout.title}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${isMember ? 'bg-purple-500/15 text-purple-400' : 'bg-blue-500/15 text-blue-400'}`}>
                                {isMember ? 'Member' : 'Site'}
                              </span>
                            </div>
                            <div className="text-gray-400 text-xs mt-0.5">{subtitle}</div>
                            {isMember && workout.promotionNote && <div className="text-gray-500 text-xs mt-0.5 line-clamp-1">{workout.promotionNote}</div>}
                            {!isMember && workout.description && <div className="text-gray-500 text-xs mt-0.5 line-clamp-1">{workout.description}</div>}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}
                <div className="flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-dark-500 text-gray-400 text-sm">Cancel</button>
                  <button type="submit" disabled={saving || !selectedWorkout} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm rounded-xl disabled:opacity-60 transition-all font-medium">
                    {saving ? 'Assigning...' : 'Assign Workout Plan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Diet Plan Modal */}
      <AnimatePresence>
        {modal === 'viewDiet' && clientDetail?.dietPlan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-black text-lg" style={{ fontFamily: 'Oswald' }}>{clientDetail.dietPlan.title}</h3>
                  <p className="text-primary text-sm">{clientDetail.dietPlan.goal}</p>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Calories', value: clientDetail.dietPlan.totalCalories, unit: 'kcal', color: 'text-orange-400' },
                  { label: 'Protein', value: clientDetail.dietPlan.totalProtein, unit: 'g', color: 'text-blue-400' },
                  { label: 'Carbs', value: clientDetail.dietPlan.totalCarbs, unit: 'g', color: 'text-green-400' },
                  { label: 'Fat', value: clientDetail.dietPlan.totalFat, unit: 'g', color: 'text-yellow-400' },
                ].map((n) => (
                  <div key={n.label} className="bg-dark-300 rounded-xl p-3 text-center">
                    <div className={`font-bold ${n.color}`}>{n.value > 0 ? `${Number(n.value).toFixed(2)}${n.unit}` : '—'}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{n.label}</div>
                  </div>
                ))}
              </div>
              {clientDetail.dietPlan.meals?.length > 0 && (() => {
                const MT = ['Breakfast', 'Mid-Breakfast', 'Lunch', 'Snacks', 'Dinner']
                const allGroups = MT.map((t) => ({ mealType: t, items: clientDetail.dietPlan.meals.filter((m) => m.time === t) })).filter((g) => g.items.length > 0)
                const ungrouped = clientDetail.dietPlan.meals.filter((m) => !m.time || !MT.includes(m.time))
                if (ungrouped.length > 0) allGroups.push({ mealType: 'Other', items: ungrouped })
                const totals = allGroups.flatMap((g) => g.items).reduce((a, m) => ({ fat: a.fat + (m.fat || 0), carbs: a.carbs + (m.carbs || 0), protein: a.protein + (m.protein || 0), calories: a.calories + (m.calories || 0) }), { fat: 0, carbs: 0, protein: 0, calories: 0 })
                return (
                  <div className="overflow-x-auto rounded-xl border border-dark-400">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-dark-300 text-gray-400 text-xs uppercase tracking-wider">
                          <th className="px-4 py-3 text-left border-b border-dark-400 w-28">Meal</th>
                          <th className="px-4 py-3 text-left border-b border-dark-400">Food Items</th>
                          <th className="px-4 py-3 text-center border-b border-dark-400 whitespace-nowrap">Qty (g/ml)</th>
                          <th className="px-4 py-3 text-center border-b border-dark-400 text-yellow-400 whitespace-nowrap">Fats (g)</th>
                          <th className="px-4 py-3 text-center border-b border-dark-400 text-green-400 whitespace-nowrap">Carbs (g)</th>
                          <th className="px-4 py-3 text-center border-b border-dark-400 text-blue-400 whitespace-nowrap">Protein (g)</th>
                          <th className="px-4 py-3 text-center border-b border-dark-400 text-orange-400 whitespace-nowrap">Calories</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allGroups.map((group) => (
                          <Fragment key={group.mealType}>
                            {group.items.map((item, ii) => (
                              <tr key={ii} className="border-b border-dark-500 hover:bg-dark-300/40 transition-colors">
                                {ii === 0 && (
                                  <td rowSpan={group.items.length} className="px-4 py-3 font-black text-primary text-xs tracking-wide align-middle border-r border-dark-500 bg-dark-300/30">
                                    {group.mealType}
                                  </td>
                                )}
                                <td className="px-4 py-2.5 text-white font-medium">{item.name || '—'}</td>
                                <td className="px-4 py-2.5 text-center text-gray-300">{item.quantity || '—'}</td>
                                <td className="px-4 py-2.5 text-center text-yellow-400">{item.fat > 0 ? Number(item.fat).toFixed(2) : '—'}</td>
                                <td className="px-4 py-2.5 text-center text-green-400">{item.carbs > 0 ? Number(item.carbs).toFixed(2) : '—'}</td>
                                <td className="px-4 py-2.5 text-center text-blue-400">{item.protein > 0 ? Number(item.protein).toFixed(2) : '—'}</td>
                                <td className="px-4 py-2.5 text-center text-orange-400">{item.calories > 0 ? Number(item.calories).toFixed(2) : '—'}</td>
                              </tr>
                            ))}
                          </Fragment>
                        ))}
                        <tr className="bg-dark-300 font-bold border-t-2 border-primary/40">
                          <td className="px-4 py-3 text-primary font-black">Total</td>
                          <td className="px-4 py-3 text-gray-400 text-xs" colSpan={2}>{allGroups.flatMap((g) => g.items).length} food items</td>
                          <td className="px-4 py-3 text-center text-yellow-400">{totals.fat > 0 ? totals.fat.toFixed(2) : '—'}</td>
                          <td className="px-4 py-3 text-center text-green-400">{totals.carbs > 0 ? totals.carbs.toFixed(2) : '—'}</td>
                          <td className="px-4 py-3 text-center text-blue-400">{totals.protein > 0 ? totals.protein.toFixed(2) : '—'}</td>
                          <td className="px-4 py-3 text-center text-orange-400">{totals.calories > 0 ? totals.calories.toFixed(2) : '—'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Workout Plan Modal */}
      <AnimatePresence>
        {modal === 'viewWorkout' && clientDetail?.workoutPlan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-black text-lg" style={{ fontFamily: 'Oswald' }}>{clientDetail.workoutPlan.title}</h3>
                    {clientDetail.workoutPlan.planType === 'member' && (
                      <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">Member Plan</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {clientDetail.workoutPlan.planType === 'member'
                      ? [clientDetail.workoutPlan.levelNumber && `Level ${clientDetail.workoutPlan.levelNumber}`, clientDetail.workoutPlan.days?.length && `${clientDetail.workoutPlan.days.length} days`, clientDetail.workoutPlan.completionWeeks && `${clientDetail.workoutPlan.completionWeeks} weeks`].filter(Boolean).join(' · ')
                      : [clientDetail.workoutPlan.category, clientDetail.workoutPlan.level].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <div className="space-y-2">
                {clientDetail.workoutPlan.days?.map((day, di) => (
                  <WorkoutDayCard key={di} day={day} di={di} />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
