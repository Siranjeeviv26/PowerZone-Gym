import { useState, useEffect, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  FaDumbbell, FaFire, FaCalendarAlt, FaChartLine, FaUser,
  FaTrophy, FaAppleAlt, FaRunning, FaClock, FaWeight,
  FaCheckCircle, FaPlus, FaTimes, FaUserTie, FaMapMarkerAlt, FaChevronDown,
  FaUsers, FaCheck, FaHome, FaSignOutAlt, FaTrash, FaSync, FaExclamationTriangle, FaPencilAlt, FaStar,
  FaInstagram, FaFacebook, FaTwitter, FaLinkedin,
} from 'react-icons/fa'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { updateProfile, logout, setUser } from '../store/slices/authSlice'
import { validate, required, minLen, maxLen, phone, positiveNum, numRange, fieldClass } from '../utils/validate'
// phone also used directly for inline blur validation
import PhoneInput from '../components/shared/PhoneInput'


const Err = ({ msg }) => msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null

const PROFILE_RULES = {
  name: [required('Name'), minLen(2, 'Name'), maxLen(50, 'Name')],
  phone: [phone()],
}

const WEIGHT_RULES = {
  weight: [required('Weight'), positiveNum('Weight')],
  bodyFat: [numRange(0, 100, 'Body fat')],
  muscleMass: [positiveNum('Muscle mass')],
}

const CHECKIN_RULES = {
  duration: [positiveNum('Duration')],
}

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getThisWeekAttendance(attendance) {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + 1) // Monday
  startOfWeek.setHours(0, 0, 0, 0)
  const result = Array(7).fill(false)
  attendance.forEach((a) => {
    const d = new Date(a.date)
    const diff = Math.floor((d - startOfWeek) / 86400000)
    if (diff >= 0 && diff < 7) result[diff] = true
  })
  return result
}

export default function UserDashboard() {
  const { user } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [progress, setProgress] = useState([])
  const [dietPlan, setDietPlan] = useState(null)
  const [workoutPlan, setWorkoutPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkinModal, setCheckinModal] = useState(false)
  const [weightModal, setWeightModal] = useState(false)
  const [checkinForm, setCheckinForm] = useState({ duration: '', workoutType: '', notes: '' })
  const [checkinDayName, setCheckinDayName] = useState('')
  const [expandedDays, setExpandedDays] = useState(new Set())
  const [weightForm, setWeightForm] = useState({ weight: '', bodyFat: '', muscleMass: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', goal: '' })
  const [profileErrors, setProfileErrors] = useState({})
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [checkinErrors, setCheckinErrors] = useState({})
  const [weightErrors, setWeightErrors] = useState({})
  const [activities, setActivities] = useState([])
  const [activityRegistering, setActivityRegistering] = useState(null)
  const [progressLoading, setProgressLoading] = useState(false)
  const [progressError, setProgressError] = useState(false)
  const [editingProgressId, setEditingProgressId] = useState(null)
  const [editingNotes, setEditingNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [trainerModal, setTrainerModal] = useState(null)
  const [ratingForm, setRatingForm] = useState({ rating: 0, comment: '' })
  const [hoverRating, setHoverRating] = useState(0)
  const [ratingSaving, setRatingSaving] = useState(false)

  const tabConfig = [
    { id: 'overview', label: 'Overview', icon: FaFire },
    { id: 'workouts', label: 'Workouts', icon: FaDumbbell },
    { id: 'activities', label: 'Activities', icon: FaRunning },
    { id: 'progress', label: 'Progress', icon: FaChartLine },
    { id: 'diet', label: 'Diet', icon: FaAppleAlt },
    { id: 'profile', label: 'Profile', icon: FaUser },
  ]

  useEffect(() => {
    fetchAll()
    fetchActivities()
  }, [])

  useEffect(() => {
    if (activeTab === 'diet' || activeTab === 'workouts') fetchPlans()
  }, [activeTab])

  useEffect(() => {
    if (!trainerModal?._id) return
    setRatingForm({ rating: 0, comment: '' })
    setHoverRating(0)
    api.get(`/trainers/${trainerModal._id}`).then(({ data }) => {
      const mine = (data.trainer?.reviews || []).find(
        (r) => String(r.user) === String(user?._id) || String(r.user?._id) === String(user?._id)
      )
      if (mine) setRatingForm({ rating: mine.rating || 0, comment: mine.comment || '' })
    }).catch(() => {})
  }, [trainerModal?._id])

  const fetchProgress = async () => {
    setProgressLoading(true)
    setProgressError(false)
    try {
      const { data } = await api.get('/users/progress')
      setProgress(data.progress || [])
    } catch {
      setProgressError(true)
      toast.error('Failed to load progress data')
    } finally {
      setProgressLoading(false)
    }
  }

  const fetchActivities = async () => {
    try {
      const { data } = await api.get('/activities')
      setActivities(data.activities || [])
    } catch {}
  }

  const handleActivityRegister = async (activityId, isRegistered) => {
    setActivityRegistering(activityId)
    try {
      const endpoint = isRegistered ? `/activities/${activityId}/unregister` : `/activities/${activityId}/register`
      const { data } = await api.post(endpoint)
      setActivities((prev) => prev.map((a) => a._id === activityId ? { ...a, registeredUsers: data.registeredUsers } : a))
      toast.success(isRegistered ? 'Unregistered from activity' : 'Registered successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    } finally {
      setActivityRegistering(null)
    }
  }

  const fetchPlans = async () => {
    try {
      const [dietRes, workoutRes] = await Promise.all([
        api.get('/users/my-diet-plan'),
        api.get('/users/my-workout-plan'),
      ])
      setDietPlan(dietRes.data.plan)
      setWorkoutPlan(workoutRes.data.plan)
    } catch {}
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [profileRes, attRes, dietRes, workoutRes] = await Promise.allSettled([
        api.get('/users/profile'),
        api.get('/users/attendance'),
        api.get('/users/my-diet-plan'),
        api.get('/users/my-workout-plan'),
      ])
      if (profileRes.status === 'fulfilled') {
        const u = profileRes.value.data.user
        setProfile(u)
        setProfileForm({
          name: u.name || '',
          phone: u.phone || '',
          goal: u.goal || '',
          socialLinks: {
            instagram: u.socialLinks?.instagram || '',
            facebook: u.socialLinks?.facebook || '',
            twitter: u.socialLinks?.twitter || '',
            linkedin: u.socialLinks?.linkedin || '',
          },
        })
      }
      if (attRes.status === 'fulfilled') setAttendance(attRes.value.data.attendance || [])
      if (dietRes.status === 'fulfilled') setDietPlan(dietRes.value.data.plan)
      if (workoutRes.status === 'fulfilled') setWorkoutPlan(workoutRes.value.data.plan)
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
    fetchProgress()
  }

  const handleDeleteProgress = async (id) => {
    if (!window.confirm('Delete this progress entry?')) return
    try {
      const { data } = await api.delete(`/users/progress/${id}`)
      setProgress(data.progress || [])
      toast.success('Entry deleted')
    } catch {
      toast.error('Failed to delete entry')
    }
  }

  const startEditNotes = (p) => {
    setEditingProgressId(p._id)
    setEditingNotes(p.notes || '')
  }

  const cancelEditNotes = () => {
    setEditingProgressId(null)
    setEditingNotes('')
  }

  const handleUpdateNotes = async (id) => {
    setSavingNotes(true)
    try {
      const { data } = await api.put(`/users/progress/${id}`, { notes: editingNotes })
      setProgress(data.progress || [])
      setEditingProgressId(null)
      setEditingNotes('')
      toast.success('Notes updated')
    } catch {
      toast.error('Failed to update notes')
    } finally {
      setSavingNotes(false)
    }
  }

  const handleCheckIn = async (e) => {
    e.preventDefault()
    const errs = validate(checkinForm, CHECKIN_RULES)
    if (Object.keys(errs).length) { setCheckinErrors(errs); return }
    setCheckinErrors({})
    setSaving(true)
    try {
      const { data } = await api.post('/users/checkin', checkinForm)
      setAttendance(data.attendance)
      toast.success('Checked in successfully!')
      setCheckinModal(false)
      setCheckinForm({ duration: '', workoutType: '', notes: '' })
      setCheckinDayName('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed')
    } finally {
      setSaving(false)
    }
  }

  const handleLogWeight = async (e) => {
    e.preventDefault()
    const errs = validate(weightForm, WEIGHT_RULES)
    if (Object.keys(errs).length) { setWeightErrors(errs); return }
    setWeightErrors({})
    setSaving(true)
    try {
      await api.post('/users/weight', weightForm)
      await fetchProgress()
      toast.success('Weight logged!')
      setWeightModal(false)
      setWeightForm({ weight: '', bodyFat: '', muscleMass: '', notes: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log weight')
    } finally {
      setSaving(false)
    }
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    const errs = validate(profileForm, PROFILE_RULES)
    if (Object.keys(errs).length) { setProfileErrors(errs); return }
    setProfileErrors({})
    setSaving(true)
    try {
      await dispatch(updateProfile(profileForm)).unwrap()
      await fetchAll()
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('avatar', file)
    setAvatarUploading(true)
    try {
      const { data } = await api.put('/users/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      dispatch(setUser(data.user))
      await fetchAll()
      toast.success('Profile photo updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setAvatarUploading(false)
      e.target.value = ''
    }
  }

  const toggleExpandDay = (di) => setExpandedDays((prev) => {
    const next = new Set(prev)
    next.has(di) ? next.delete(di) : next.add(di)
    return next
  })

  const isDayAttended = (dayDate) => {
    const d = new Date(dayDate); d.setHours(0, 0, 0, 0)
    return attendance.some((a) => { const ad = new Date(a.date); ad.setHours(0, 0, 0, 0); return ad.getTime() === d.getTime() })
  }

  const openCheckinForDay = (dayName) => {
    setCheckinDayName(dayName)
    setCheckinForm({ duration: '', workoutType: dayName, notes: '' })
    setCheckinErrors({})
    setCheckinModal(true)
  }

  const weekAttendance = getThisWeekAttendance(attendance)
  const totalThisMonth = attendance.filter((a) => {
    const d = new Date(a.date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const streak = (() => {
    if (!attendance.length) return 0
    let count = 0
    const sorted = [...attendance].sort((a, b) => new Date(b.date) - new Date(a.date))
    let expected = new Date(); expected.setHours(0, 0, 0, 0)
    for (const a of sorted) {
      const d = new Date(a.date); d.setHours(0, 0, 0, 0)
      if (d.getTime() === expected.getTime()) { count++; expected.setDate(expected.getDate() - 1) }
      else break
    }
    return count
  })()

  const latest = progress[0]

  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Top bar */}
      <div className="bg-dark-100 border-b border-dark-400 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
        <Link to="/" className="font-black text-white text-lg" style={{ fontFamily: 'Oswald' }}>
          POWER<span className="text-primary">ZONE</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-400 hover:text-white text-xs flex items-center gap-1.5 transition-colors">
            <FaHome className="text-[11px]" /> View Site
          </Link>
          <button
            onClick={() => { dispatch(logout()); navigate('/login') }}
            className="text-gray-400 hover:text-red-400 text-xs flex items-center gap-1.5 transition-colors"
          >
            <FaSignOutAlt className="text-[11px]" /> Logout
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-6">

        {/* Dashboard Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl mb-5 border border-dark-400">
          <div className="absolute inset-0 bg-gradient-to-br from-dark-100 via-dark-200 to-dark-100" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-secondary/5" />
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/6 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-1/3 w-32 h-32 bg-secondary/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left: Avatar + Info */}
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-16 h-16 rounded-2xl object-cover shadow-lg shadow-primary/25" />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary/25">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                {profile?.membership?.status === 'active' && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-dark-100 flex items-center justify-center">
                    <FaCheck className="text-[7px] text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-black text-white leading-tight" style={{ fontFamily: 'Oswald' }}>
                  {user?.name?.toUpperCase()}
                </h1>
                <p className="text-gray-500 text-xs mt-0.5">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {profile?.regNo && (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono font-semibold border border-primary/20">
                      #{profile.regNo}
                    </span>
                  )}
                  {profile?.branch && (
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <FaMapMarkerAlt className="text-primary text-[9px]" /> {profile.branch.name}
                    </span>
                  )}
                  {profile?.membership?.status && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold capitalize ${
                      profile.membership.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      profile.membership.status === 'expired' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {profile.membership.status}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Quick Stats + Bell */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="hidden sm:flex items-center gap-2">
                {[
                  { value: totalThisMonth, label: 'This Month', color: 'text-orange-400' },
                  { value: attendance.length, label: 'Check-ins', color: 'text-white' },
                  { value: `${streak}🔥`, label: 'Streak', color: 'text-primary' },
                ].map((s) => (
                  <div key={s.label} className="text-center px-3 py-2 bg-dark-300/60 rounded-xl border border-dark-500/50 min-w-[56px]">
                    <div className={`text-base font-black leading-none ${s.color}`} style={{ fontFamily: 'Oswald' }}>{s.value}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 whitespace-nowrap">{s.label}</div>
                  </div>
                ))}
              </div>
              {profile?.personalTrainer && (
                <button
                  onClick={() => setTrainerModal({ ...profile.personalTrainer, type: 'Personal Trainer' })}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  <FaUserTie className="text-primary text-xs" />
                  <span className="text-primary text-xs font-medium">PT: {profile.personalTrainer.name}</span>
                </button>
              )}
              {profile?.classTrainer && (
                <button
                  onClick={() => setTrainerModal({ ...profile.classTrainer, type: 'Class Trainer' })}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-colors cursor-pointer"
                >
                  <FaUserTie className="text-purple-400 text-xs" />
                  <span className="text-purple-300 text-xs font-medium">CT: {profile.classTrainer.name}</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        {(() => {
          const myId = (profile?._id || user?.id)?.toString()
          const unregisteredCount = activities.filter(
            (a) => !a.registeredUsers?.some((u) => (u._id || u).toString() === myId)
          ).length
          return (
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6">
              {tabConfig.map(({ id, label, icon: Icon }) => {
                const badge = id === 'activities' && unregisteredCount > 0 ? unregisteredCount : 0
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                      activeTab === id
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'bg-dark-200 text-gray-400 hover:bg-dark-300 hover:text-white border border-dark-400'
                    }`}
                  >
                    <Icon className="text-xs" />
                    {label}
                    {badge > 0 && (
                      <span className={`ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center leading-none ${
                        activeTab === id ? 'bg-white text-primary' : 'bg-primary text-white'
                      }`}>
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )
        })()}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: FaFire, label: 'This Month', value: `${totalThisMonth}`, unit: 'sessions', color: '#f4a261', bg: 'from-orange-500/10 to-transparent' },
                { icon: FaDumbbell, label: 'Total Check-ins', value: attendance.length, unit: 'visits', color: '#e63946', bg: 'from-red-500/10 to-transparent' },
                { icon: FaWeight, label: 'Current Weight', value: latest?.weight ? latest.weight : '—', unit: latest?.weight ? 'kg' : '', color: '#4361ee', bg: 'from-blue-500/10 to-transparent' },
                { icon: FaTrophy, label: 'Day Streak', value: streak, unit: streak === 1 ? 'day 🔥' : 'days 🔥', color: '#f59e0b', bg: 'from-yellow-500/10 to-transparent' },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className={`relative overflow-hidden bg-gradient-to-br ${stat.bg} bg-dark-200 border border-dark-400 rounded-2xl p-5 hover:border-dark-300 transition-all`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}18` }}>
                    <stat.icon style={{ color: stat.color }} />
                  </div>
                  <div className="text-2xl font-black text-white leading-none" style={{ fontFamily: 'Oswald' }}>{stat.value}
                    {stat.unit && <span className="text-sm font-normal text-gray-500 ml-1">{stat.unit}</span>}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
                  <div className="absolute -bottom-3 -right-3 w-14 h-14 rounded-full opacity-10" style={{ backgroundColor: stat.color }} />
                </motion.div>
              ))}
            </div>

            {/* Weekly Attendance + Check-in */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <FaCalendarAlt className="text-primary" /> This Week's Attendance
                </h3>
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => setCheckinModal(true)} className="btn-primary text-xs py-2 px-4 flex items-center gap-1">
                  <FaPlus className="text-xs" /> Check In Today
                </motion.button>
              </div>
              <div className="flex items-center gap-2">
                {weekdays.map((day, i) => {
                  const attended = weekAttendance[i]
                  const now = new Date()
                  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1
                  const isToday = i === dayOfWeek
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className={`text-[10px] font-semibold ${isToday ? 'text-primary' : 'text-gray-600'}`}>{day}</span>
                      <div className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        attended
                          ? 'bg-primary shadow-md shadow-primary/40'
                          : isToday
                          ? 'bg-dark-300 border-2 border-primary/50'
                          : 'bg-dark-300 border border-dark-500'
                      }`}>
                        {attended ? (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-primary/60' : 'bg-dark-500'}`} />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dark-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-gray-500 text-xs">Attended</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-dark-300 border border-primary/50" />
                  <span className="text-gray-500 text-xs">Today</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-dark-300 border border-dark-500" />
                  <span className="text-gray-500 text-xs">Missed</span>
                </div>
                <span className="ml-auto text-xs text-gray-600">
                  {weekAttendance.filter(Boolean).length}/7 this week
                </span>
              </div>
            </div>

            {/* Membership Dates */}
            {(profile?.membership?.joiningDate || profile?.membership?.paymentDate || profile?.membership?.nextPaymentDate) && (
              <div className="glass-card p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <FaCalendarAlt className="text-primary" /> Membership Dates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Joining Date', value: profile.membership?.joiningDate, color: '#4361ee' },
                    { label: 'Last Payment', value: profile.membership?.paymentDate, color: '#2ec27e' },
                    { label: 'Next Payment', value: profile.membership?.nextPaymentDate, color: '#f59e0b' },
                  ].map((item) => (
                    <div key={item.label} className="p-4 bg-dark-300 rounded-xl">
                      <div className="text-gray-500 text-xs mb-1">{item.label}</div>
                      <div className="text-sm font-bold" style={{ color: item.value ? item.color : undefined }}>
                        {item.value ? new Date(item.value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : <span className="text-gray-600">Not set</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Branch Card */}
            {profile?.branch && (
              <div className="glass-card p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-primary" /> Your Branch
                </h3>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-primary text-lg" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1">
                    <div>
                      <div className="text-gray-500 text-xs mb-0.5">Branch</div>
                      <div className="text-white font-semibold text-sm">{profile.branch.name}</div>
                    </div>
                    {profile.branch.location && (
                      <div>
                        <div className="text-gray-500 text-xs mb-0.5">Location</div>
                        <div className="text-white text-sm">{profile.branch.location}</div>
                      </div>
                    )}
                    {profile.branch.address && (
                      <div>
                        <div className="text-gray-500 text-xs mb-0.5">Address</div>
                        <div className="text-white text-sm">{profile.branch.address}</div>
                      </div>
                    )}
                    {profile.branch.manager && (
                      <div>
                        <div className="text-gray-500 text-xs mb-0.5">Manager</div>
                        <div className="text-white text-sm">{profile.branch.manager}</div>
                      </div>
                    )}
                    {profile.branch.phone && (
                      <div>
                        <div className="text-gray-500 text-xs mb-0.5">Contact</div>
                        <div className="text-primary text-sm font-medium">{profile.branch.phone}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Trainer Cards */}
            {(profile?.personalTrainer || profile?.classTrainer) && (
              <div className={`grid grid-cols-1 ${profile.personalTrainer && profile.classTrainer ? 'sm:grid-cols-2' : ''} gap-4`}>
                {profile?.personalTrainer && (
                  <div className="glass-card p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <FaUserTie className="text-primary" /> Personal Trainer
                    </h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setTrainerModal({ ...profile.personalTrainer, type: 'Personal Trainer' })}
                        className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0 hover:scale-105 transition-transform cursor-pointer overflow-hidden"
                        title="View trainer details"
                      >
                        {profile.personalTrainer.image
                          ? <img src={profile.personalTrainer.image} alt={profile.personalTrainer.name} className="w-full h-full object-cover" />
                          : profile.personalTrainer.name?.charAt(0)}
                      </button>
                      <div>
                        {profile.personalTrainer.trainerId && <div className="text-xs font-mono text-gray-500 mb-0.5">{profile.personalTrainer.trainerId}</div>}
                        <button onClick={() => setTrainerModal({ ...profile.personalTrainer, type: 'Personal Trainer' })} className="text-white font-bold hover:text-primary transition-colors text-left">
                          {profile.personalTrainer.name}
                        </button>
                        <div className="text-primary text-sm">{profile.personalTrainer.speciality}</div>
                        {profile.personalTrainer.phone && <div className="text-gray-400 text-xs mt-0.5">{profile.personalTrainer.phone}</div>}
                      </div>
                    </div>
                  </div>
                )}
                {profile?.classTrainer && (
                  <div className="glass-card p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <FaUserTie className="text-purple-400" /> Class Trainer
                    </h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setTrainerModal({ ...profile.classTrainer, type: 'Class Trainer' })}
                        className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0 hover:scale-105 transition-transform cursor-pointer overflow-hidden"
                        title="View trainer details"
                      >
                        {profile.classTrainer.image
                          ? <img src={profile.classTrainer.image} alt={profile.classTrainer.name} className="w-full h-full object-cover" />
                          : profile.classTrainer.name?.charAt(0)}
                      </button>
                      <div>
                        {profile.classTrainer.trainerId && <div className="text-xs font-mono text-gray-500 mb-0.5">{profile.classTrainer.trainerId}</div>}
                        <button onClick={() => setTrainerModal({ ...profile.classTrainer, type: 'Class Trainer' })} className="text-white font-bold hover:text-purple-300 transition-colors text-left">
                          {profile.classTrainer.name}
                        </button>
                        <div className="text-purple-300 text-sm">{profile.classTrainer.speciality}</div>
                        {profile.classTrainer.phone && <div className="text-gray-400 text-xs mt-0.5">{profile.classTrainer.phone}</div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* WORKOUTS TAB */}
        {activeTab === 'workouts' && (
          <div className="space-y-6">
            <motion.button whileHover={{ scale: 1.03 }} onClick={() => { setCheckinDayName(''); setCheckinForm({ duration: '', workoutType: '', notes: '' }); setCheckinErrors({}); setCheckinModal(true) }} className="btn-primary py-3 px-6 flex items-center gap-2">
              <FaCheckCircle /> Mark Today's Attendance
            </motion.button>

            {/* Member workout schedule — always visible */}
            {workoutPlan?.planType === 'member' && workoutPlan?.days?.length > 0 && profile?.membership?.joiningDate && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-primary text-sm" />
                    <span className="text-gray-400 text-sm">
                      Schedule from:
                      <span className="text-white font-medium ml-1">
                        {new Date(profile.membership.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={() => setExpandedDays(expandedDays.size > 0 ? new Set() : new Set(workoutPlan.days.map((_, i) => i)))}
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    {expandedDays.size > 0 ? 'Collapse All' : 'Expand All'}
                  </button>
                </div>

                {workoutPlan.days.map((day, di) => {
                  const base = new Date(profile.membership.joiningDate)
                  base.setHours(0, 0, 0, 0)
                  const dayDate = new Date(base)
                  dayDate.setDate(base.getDate() + ((day.dayNumber ?? di + 1) - 1))
                  const today = new Date(); today.setHours(0, 0, 0, 0)
                  const isToday = dayDate.getTime() === today.getTime()
                  const isPast = dayDate < today
                  const isExpanded = expandedDays.has(di)
                  const dateLabel = dayDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  return (
                    <div key={di} className={`glass-card overflow-hidden transition-all ${isToday ? 'border-primary/50 ring-1 ring-primary/20' : isPast && !isDayAttended(dayDate) ? 'opacity-70' : ''}`}>
                      {/* Clickable day header */}
                      <button
                        type="button"
                        onClick={() => toggleExpandDay(di)}
                        className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${isToday ? 'bg-primary/10 hover:bg-primary/15' : 'bg-dark-300/60 hover:bg-dark-300'} ${isExpanded ? 'border-b border-dark-500' : ''}`}
                      >
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 font-mono ${isToday ? 'bg-primary text-white' : 'bg-dark-400 text-gray-400'}`}>
                          Day {day.dayNumber ?? di + 1}
                        </span>
                        <span className={`font-bold flex-1 text-left ${isToday ? 'text-white' : 'text-gray-200'}`}>{day.dayName}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isToday && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Today</span>}
                          {day.coachGuided && <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full">Coach Guided</span>}
                          <span className="text-gray-500 text-xs hidden sm:inline">{dateLabel}</span>
                          {isDayAttended(dayDate) ? (
                            <span className="text-xs bg-green-500/15 text-green-400 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                              <FaCheckCircle className="text-xs" /> Done
                            </span>
                          ) : dayDate > today ? (
                            <span className="text-xs bg-dark-400 text-gray-500 px-2.5 py-1 rounded-full">Upcoming</span>
                          ) : (
                            <span
                              role="button"
                              onClick={(e) => { e.stopPropagation(); openCheckinForDay(day.dayName) }}
                              className="text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-2.5 py-1 rounded-full transition-colors font-medium"
                            >
                              Mark
                            </span>
                          )}
                          <FaChevronDown className={`text-gray-500 text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {/* Collapsible exercise list */}
                      {isExpanded && (
                        day.exercises?.length > 0 ? (
                          <div className="px-5 py-4">
                            <div className="grid grid-cols-[1fr_52px_68px] gap-2 mb-2 px-1">
                              <span className="text-gray-500 text-xs font-medium">Exercise</span>
                              <span className="text-gray-500 text-xs font-medium text-center">Sets</span>
                              <span className="text-gray-500 text-xs font-medium text-center">Reps</span>
                            </div>
                            <div className="space-y-0">
                              {day.exercises.map((ex, ei) => (
                                <div key={ei} className="grid grid-cols-[1fr_52px_68px] gap-2 items-center py-2 border-b border-dark-500/30 last:border-0">
                                  <span className="text-gray-200 text-sm">{ex.name}</span>
                                  <span className="text-gray-400 text-sm text-center">{ex.sets ?? '—'}</span>
                                  <span className="text-gray-400 text-sm text-center">{ex.reps || '—'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-600 text-xs px-5 py-3">Rest day / No exercises listed.</p>
                        )
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Attendance history */}
            {attendance.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-white font-bold mb-5 flex items-center gap-2"><FaDumbbell className="text-primary" /> Workout History</h3>
                <div className="space-y-3">
                  {[...attendance].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20).map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-dark-300 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <FaRunning className="text-primary text-sm" />
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">{a.workoutType || 'Gym Session'}</div>
                          <div className="text-gray-500 text-xs">{new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        </div>
                      </div>
                      {a.duration && <span className="text-gray-400 text-sm flex items-center gap-1"><FaClock className="text-xs" /> {a.duration} min</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state — no plan, no attendance */}
            {!workoutPlan && attendance.length === 0 && (
              <div className="glass-card p-12 text-center text-gray-500">
                <FaDumbbell className="text-4xl mx-auto mb-3 opacity-30" />
                <p>No workout sessions recorded yet.</p>
              </div>
            )}
            {workoutPlan && workoutPlan.planType !== 'member' && (
              <div className="glass-card p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><FaDumbbell className="text-primary" /> Assigned Workout Plan</h3>
                <div className="mb-3">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-primary font-semibold text-lg">{workoutPlan.title}</span>
                    {workoutPlan.planType === 'member' && (
                      <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">Member Plan</span>
                    )}
                  </div>
                  {workoutPlan.planType === 'member' ? (
                    <div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                        {workoutPlan.levelNumber && <span>Level: <span className="text-gray-300">{workoutPlan.levelNumber}</span></span>}
                        {workoutPlan.completionWeeks && <span>Duration: <span className="text-gray-300">{workoutPlan.completionWeeks} weeks</span></span>}
                        {workoutPlan.days?.length > 0 && <span>Days: <span className="text-gray-300">{workoutPlan.days.length}</span></span>}
                      </div>
                      {workoutPlan.promotionNote && (
                        <p className="text-gray-500 text-xs mb-4 bg-dark-300 rounded-xl px-3 py-2 border-l-2 border-primary">{workoutPlan.promotionNote}</p>
                      )}
                      {workoutPlan.days?.length > 0 && (
                        <div className="space-y-3">
                          {workoutPlan.days.map((day, di) => (
                            <div key={di} className="bg-dark-300 rounded-xl overflow-hidden border border-dark-500">
                              <div className="flex items-center gap-3 px-4 py-2.5 bg-dark-400/50 border-b border-dark-500">
                                <span className="text-xs text-primary font-semibold">Day {day.dayNumber || di + 1}</span>
                                <span className="text-white text-sm font-medium flex-1">{day.dayName}</span>
                                {day.coachGuided && <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full">Coach Guided</span>}
                              </div>
                              {day.exercises?.length > 0 && (
                                <div className="px-4 py-3">
                                  <div className="grid grid-cols-[1fr_48px_64px] gap-2 mb-1.5">
                                    <span className="text-gray-500 text-xs">Exercise</span>
                                    <span className="text-gray-500 text-xs text-center">Sets</span>
                                    <span className="text-gray-500 text-xs text-center">Reps</span>
                                  </div>
                                  {day.exercises.map((ex, ei) => (
                                    <div key={ei} className="grid grid-cols-[1fr_48px_64px] gap-2 py-1 border-b border-dark-500/40 last:border-0">
                                      <span className="text-gray-300 text-sm">{ex.name}</span>
                                      <span className="text-gray-400 text-sm text-center">{ex.sets ?? '—'}</span>
                                      <span className="text-gray-400 text-sm text-center">{ex.reps || '—'}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {workoutPlan.description && <div className="text-gray-400 text-sm mt-1 mb-3">{workoutPlan.description}</div>}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        {workoutPlan.category && <span>Category: <span className="text-gray-300">{workoutPlan.category}</span></span>}
                        {workoutPlan.level && <span>Level: <span className="text-gray-300">{workoutPlan.level}</span></span>}
                        {workoutPlan.duration && <span>Duration: <span className="text-gray-300">{workoutPlan.duration} min</span></span>}
                      </div>
                      {workoutPlan.schedule?.length > 0 && (
                        <div className="mt-4">
                          <div className="text-gray-400 text-xs mb-2">Schedule</div>
                          <div className="flex flex-wrap gap-2">
                            {workoutPlan.schedule.map((s, i) => (
                              <span key={i} className="bg-dark-400 text-gray-300 text-xs px-3 py-1 rounded-full">{s.day} {s.time}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Weight & Progress History</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchProgress}
                  disabled={progressLoading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dark-400 text-gray-400 hover:text-white hover:border-dark-300 text-xs transition-all disabled:opacity-50"
                  title="Refresh progress data"
                >
                  <FaSync className={`text-xs ${progressLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => setWeightModal(true)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                  <FaPlus className="text-xs" /> Log Weight
                </motion.button>
              </div>
            </div>

            {progressError ? (
              <div className="glass-card p-12 text-center">
                <FaExclamationTriangle className="text-3xl text-red-400 mx-auto mb-3" />
                <p className="text-red-400 font-medium mb-1">Failed to load progress data</p>
                <p className="text-gray-500 text-sm mb-4">Your data is still saved. Click Refresh to try again.</p>
                <button onClick={fetchProgress} className="btn-primary text-sm py-2 px-6 flex items-center gap-2 mx-auto">
                  <FaSync className="text-xs" /> Try Again
                </button>
              </div>
            ) : progressLoading ? (
              <div className="glass-card p-12 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading progress data...</p>
              </div>
            ) : progress.length === 0 ? (
              <div className="glass-card p-12 text-center text-gray-500">
                <FaChartLine className="text-4xl mx-auto mb-3 opacity-30" />
                <p>No progress logged yet. Start tracking your weight!</p>
              </div>
            ) : (
              <div className="glass-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 text-xs bg-dark-300/50 border-b border-dark-400">
                      {['Date', 'Weight (kg)', 'Body Fat (%)', 'Muscle Mass (kg)', 'Notes', ''].map((h) => (
                        <th key={h} className="py-3 px-4 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {progress.map((p, i) => {
                      const isEditing = editingProgressId === p._id
                      return (
                        <tr key={p._id || i} className="border-b border-dark-400/50 hover:bg-dark-300/50 group">
                          <td className="py-3 px-4 text-gray-300 text-sm whitespace-nowrap">{new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td className="py-3 px-4 text-white font-semibold text-sm">{p.weight || '—'}</td>
                          <td className="py-3 px-4 text-gray-300 text-sm">{p.bodyFat || '—'}</td>
                          <td className="py-3 px-4 text-gray-300 text-sm">{p.muscleMass || '—'}</td>
                          <td className="py-3 px-4 text-sm min-w-[180px]">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  autoFocus
                                  value={editingNotes}
                                  onChange={(e) => setEditingNotes(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleUpdateNotes(p._id)
                                    if (e.key === 'Escape') cancelEditNotes()
                                  }}
                                  className="flex-1 bg-dark-400 border border-primary/50 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-primary"
                                  placeholder="Add notes..."
                                />
                                <button
                                  onClick={() => handleUpdateNotes(p._id)}
                                  disabled={savingNotes}
                                  className="text-green-400 hover:text-green-300 text-xs disabled:opacity-50 flex-shrink-0"
                                  title="Save"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  onClick={cancelEditNotes}
                                  className="text-gray-500 hover:text-gray-300 text-xs flex-shrink-0"
                                  title="Cancel"
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-xs">{p.notes || <span className="italic text-gray-600">—</span>}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {!isEditing && (
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditNotes(p)}
                                  className="text-gray-500 hover:text-primary transition-colors text-xs"
                                  title="Edit notes"
                                >
                                  <FaPencilAlt />
                                </button>
                                <button
                                  onClick={() => handleDeleteProgress(p._id)}
                                  className="text-gray-600 hover:text-red-400 transition-colors text-xs"
                                  title="Delete entry"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* DIET TAB */}
        {activeTab === 'diet' && (
          <div className="space-y-6">
            {!dietPlan ? (
              <div className="glass-card p-12 text-center text-gray-500">
                <FaAppleAlt className="text-4xl mx-auto mb-3 opacity-30" />
                <p>No diet plan assigned yet. Ask your trainer to assign one.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="glass-card p-6">
                  <h2 className="text-xl font-black text-white mb-1" style={{ fontFamily: 'Oswald' }}>{dietPlan.title}</h2>
                  <p className="text-primary text-sm mb-3">{dietPlan.goal}</p>
                  {dietPlan.description && <p className="text-gray-400 text-sm mb-4">{dietPlan.description}</p>}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Calories', value: dietPlan.totalCalories > 0 ? `${Number(dietPlan.totalCalories).toFixed(2)} kcal` : '—' },
                      { label: 'Protein', value: dietPlan.totalProtein > 0 ? `${Number(dietPlan.totalProtein).toFixed(2)}g` : '—' },
                      { label: 'Carbs', value: dietPlan.totalCarbs > 0 ? `${Number(dietPlan.totalCarbs).toFixed(2)}g` : '—' },
                      { label: 'Fat', value: dietPlan.totalFat > 0 ? `${Number(dietPlan.totalFat).toFixed(2)}g` : '—' },
                    ].map((n) => (
                      <div key={n.label} className="bg-dark-300 rounded-xl p-3 text-center">
                        <div className="text-white font-bold">{n.value}</div>
                        <div className="text-gray-500 text-xs mt-0.5">{n.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {dietPlan.meals?.length > 0 && (() => {
                  const MT = ['Breakfast', 'Mid-Breakfast', 'Lunch', 'Snacks', 'Dinner']
                  const allGroups = MT.map((t) => ({ mealType: t, items: dietPlan.meals.filter((m) => m.time === t) })).filter((g) => g.items.length > 0)
                  const ungrouped = dietPlan.meals.filter((m) => !m.time || !MT.includes(m.time))
                  if (ungrouped.length > 0) allGroups.push({ mealType: 'Other', items: ungrouped })
                  const totals = allGroups.flatMap((g) => g.items).reduce((acc, m) => ({
                    fat: acc.fat + (m.fat || 0),
                    carbs: acc.carbs + (m.carbs || 0),
                    protein: acc.protein + (m.protein || 0),
                    calories: acc.calories + (m.calories || 0),
                  }), { fat: 0, carbs: 0, protein: 0, calories: 0 })
                  return (
                    <div className="glass-card p-6">
                      <h3 className="text-white font-bold mb-5">Meal Plan</h3>
                      <div className="overflow-x-auto rounded-xl border border-dark-400">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-dark-300 text-gray-400 text-xs uppercase tracking-wider">
                              <th className="px-4 py-3 text-left font-semibold border-b border-dark-400 w-28">Meal</th>
                              <th className="px-4 py-3 text-left font-semibold border-b border-dark-400">Food Items</th>
                              <th className="px-4 py-3 text-center font-semibold border-b border-dark-400 whitespace-nowrap">Qty (g/ml)</th>
                              <th className="px-4 py-3 text-center font-semibold border-b border-dark-400 whitespace-nowrap text-yellow-400">Fats (g)</th>
                              <th className="px-4 py-3 text-center font-semibold border-b border-dark-400 whitespace-nowrap text-green-400">Carbs (g)</th>
                              <th className="px-4 py-3 text-center font-semibold border-b border-dark-400 whitespace-nowrap text-blue-400">Protein (g)</th>
                              <th className="px-4 py-3 text-center font-semibold border-b border-dark-400 whitespace-nowrap text-orange-400">Calories</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allGroups.map((group) => (
                              <Fragment key={group.mealType}>
                                {group.items.map((item, ii) => (
                                  <tr key={ii} className="border-b border-dark-500 hover:bg-dark-300/40 transition-colors">
                                    {ii === 0 && (
                                      <td
                                        rowSpan={group.items.length}
                                        className="px-4 py-3 font-black text-primary text-xs tracking-wide align-middle border-r border-dark-500 bg-dark-300/30"
                                      >
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
                            <tr className="bg-dark-300 font-bold text-sm border-t-2 border-primary/40">
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
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )}

        {/* ACTIVITIES TAB */}
        {activeTab === 'activities' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>UPCOMING ACTIVITIES</h2>
                <p className="text-gray-400 text-sm">Browse and register for gym activities</p>
              </div>
            </div>

            {activities.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <FaCalendarAlt className="text-4xl text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No upcoming activities at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activities.map((a, i) => {
                  const myId = (profile?._id || user?.id)?.toString()
                  const isRegistered = a.registeredUsers?.some((u) => (u._id || u).toString() === myId)
                  const isFull = a.maxParticipants && a.registeredUsers?.length >= a.maxParticipants
                  const isDeadlinePassed = a.registrationDeadline && new Date() > new Date(a.registrationDeadline)
                  const isLoading = activityRegistering === a._id
                  const actDate = new Date(a.date)
                  const isToday = actDate.toDateString() === new Date().toDateString()
                  return (
                    <motion.div
                      key={a._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`glass-card p-5 ${isRegistered ? 'border-primary/30 ring-1 ring-primary/10' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-white font-bold">{a.title}</h3>
                          <span className="text-xs text-primary">{a.activityType}</span>
                        </div>
                        {isRegistered && (
                          <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex-shrink-0">
                            <FaCheck className="text-xs" /> Registered
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt className="text-gray-600" />
                          {isToday ? 'Today' : actDate.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
                          {a.time && ` · ${a.time}`}
                        </span>
                        {a.registrationDeadline && (
                          <span className={`flex items-center gap-1 ${isDeadlinePassed ? 'text-orange-400' : 'text-gray-400'}`}>
                            <FaClock className="text-gray-600" />
                            {isDeadlinePassed ? 'Registration closed' : `Register by ${new Date(a.registrationDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} ${new Date(a.registrationDeadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
                          </span>
                        )}
                        {a.trainers?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <FaUserTie className="text-gray-600" />
                            {a.trainers.map((t) => t.name).join(', ')}
                          </span>
                        )}
                        {a.branch && (
                          <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-gray-600" />{a.branch.name}</span>
                        )}
                      </div>

                      {a.description && (
                        <div
                          className="text-gray-500 text-xs mb-3 [&_strong]:font-bold [&_strong]:text-gray-300 [&_em]:italic [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-0.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:space-y-0.5 [&_mark]:rounded [&_mark]:px-0.5"
                          dangerouslySetInnerHTML={{ __html: a.description }}
                        />
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <FaUsers className="text-gray-600" />
                          {a.registeredUsers?.length || 0}{a.maxParticipants ? ` / ${a.maxParticipants}` : ''} joined
                          {isFull && !isRegistered && <span className="ml-2 text-red-400 font-medium">Full</span>}
                        </span>
                        {isDeadlinePassed && !isRegistered ? (
                          <span className="text-xs px-4 py-1.5 rounded-full bg-dark-400 text-gray-500 border border-dark-500">
                            Registration Closed
                          </span>
                        ) : (
                          <button
                            disabled={isLoading || (isFull && !isRegistered)}
                            onClick={() => handleActivityRegister(a._id, isRegistered)}
                            className={`text-xs px-4 py-1.5 rounded-full font-semibold transition-all disabled:opacity-50 ${
                              isRegistered
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                : isFull
                                  ? 'bg-dark-400 text-gray-500 cursor-not-allowed'
                                  : 'btn-primary py-1.5'
                            }`}
                          >
                            {isLoading ? '...' : isRegistered ? 'Unregister' : 'Register'}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT — Profile Info */}
            <div className="space-y-4">
              {/* Profile Header Card */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-5">
                  <label className="relative flex-shrink-0 cursor-pointer group" title="Change photo">
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt={profile.name} className="w-20 h-20 rounded-2xl object-cover shadow-lg shadow-primary/20" />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary/20">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {avatarUploading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaUser className="text-white text-lg" />
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={avatarUploading} />
                  </label>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>{profile?.name}</h2>
                    <p className="text-gray-400 text-sm">{profile?.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile?.regNo && (
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-mono font-semibold border border-primary/20">
                          #{profile.regNo}
                        </span>
                      )}
                      {profile?.membership?.status && (
                        <span className={`text-xs px-2.5 py-1 rounded-lg font-medium capitalize ${
                          profile.membership.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          profile.membership.status === 'expired' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {profile.membership.status}
                        </span>
                      )}
                      {profile?.goal && (
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-dark-400 text-gray-300 border border-dark-500">{profile.goal}</span>
                      )}
                    </div>
                  </div>
                  {(profile?.socialLinks?.instagram || profile?.socialLinks?.facebook || profile?.socialLinks?.twitter || profile?.socialLinks?.linkedin) && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-dark-400">
                      {profile.socialLinks?.instagram && (
                        <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-pink-500/10 rounded-lg flex items-center justify-center text-pink-400 hover:bg-pink-500/20 transition-colors" title="Instagram">
                          <FaInstagram className="text-sm" />
                        </a>
                      )}
                      {profile.socialLinks?.facebook && (
                        <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-colors" title="Facebook">
                          <FaFacebook className="text-sm" />
                        </a>
                      )}
                      {profile.socialLinks?.twitter && (
                        <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-sky-500/10 rounded-lg flex items-center justify-center text-sky-400 hover:bg-sky-500/20 transition-colors" title="Twitter">
                          <FaTwitter className="text-sm" />
                        </a>
                      )}
                      {profile.socialLinks?.linkedin && (
                        <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-blue-700/10 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-700/20 transition-colors" title="LinkedIn">
                          <FaLinkedin className="text-sm" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Info Tiles */}
              <div className="glass-card p-5">
                <h3 className="text-white font-bold mb-4 text-sm flex items-center gap-2">
                  <FaUser className="text-primary text-xs" /> Membership Info
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Branch', value: profile?.branch?.name || '—', sub: profile?.branch?.location },
                    { label: 'Plan', value: profile?.membership?.plan?.name || '—' },
                    { label: 'Package', value: profile?.membership?.package || '—' },
                    { label: 'Joining Date', value: profile?.membership?.joiningDate ? new Date(profile.membership.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
                    ...(profile?.personalTrainer ? [{ label: 'Personal Trainer', value: profile.personalTrainer.name, onClick: () => setTrainerModal({ ...profile.personalTrainer, type: 'Personal Trainer' }) }] : []),
                    ...(profile?.classTrainer ? [{ label: 'Class Trainer', value: profile.classTrainer.name, onClick: () => setTrainerModal({ ...profile.classTrainer, type: 'Class Trainer' }) }] : []),
                  ].map((item) => (
                    item.onClick ? (
                      <button key={item.label} onClick={item.onClick} className="p-3 bg-dark-300 rounded-xl border border-dark-500 hover:border-primary/40 hover:bg-dark-200 transition-all text-left w-full">
                        <div className="text-gray-500 text-[11px] mb-0.5 flex items-center gap-1">{item.label} <FaUserTie className="text-[9px] text-primary" /></div>
                        <div className="text-primary text-sm font-semibold truncate">{item.value}</div>
                        <div className="text-gray-600 text-[10px] mt-0.5">Click to view details</div>
                      </button>
                    ) : (
                      <div key={item.label} className="p-3 bg-dark-300 rounded-xl border border-dark-500">
                        <div className="text-gray-500 text-[11px] mb-0.5">{item.label}</div>
                        <div className="text-white text-sm font-semibold truncate">{item.value}</div>
                        {item.sub && <div className="text-gray-600 text-xs mt-0.5 truncate">{item.sub}</div>}
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Edit Form */}
            <div className="glass-card p-6 h-fit">
              <h3 className="text-white font-bold mb-5 text-sm flex items-center gap-2">
                <FaCheckCircle className="text-primary text-xs" /> Edit Information
              </h3>
              <form onSubmit={handleProfileSave} className="space-y-4" noValidate>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Full Name</label>
                  <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className={fieldClass(profileErrors, 'name', 'input-field')} />
                  <Err msg={profileErrors.name} />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Email</label>
                  <input value={profile?.email || ''} className="input-field opacity-40 cursor-not-allowed" readOnly />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Phone</label>
                  <PhoneInput
                    value={profileForm.phone}
                    onChange={(v) => setProfileForm({ ...profileForm, phone: v })}
                    onBlur={() => {
                      const err = phone()(profileForm.phone)
                      if (err) setProfileErrors((p) => ({ ...p, phone: err }))
                      else setProfileErrors((p) => { const n = { ...p }; delete n.phone; return n })
                    }}
                    error={profileErrors.phone}
                  />
                  <Err msg={profileErrors.phone} />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Fitness Goal</label>
                  <select value={profileForm.goal} onChange={(e) => setProfileForm({ ...profileForm, goal: e.target.value })} className="input-field">
                    <option value="">Select goal</option>
                    <option>Lose Weight</option>
                    <option>Build Muscle</option>
                    <option>Improve Fitness</option>
                    <option>Athletic Training</option>
                    <option>General Health</option>
                  </select>
                </div>
                {profile?.branch && (
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Branch</label>
                    <input value={profile.branch.name || ''} className="input-field opacity-40 cursor-not-allowed" readOnly />
                    <p className="text-gray-600 text-xs mt-1">Contact admin to change branch(Transfer Fee included)</p>
                  </div>
                )}

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

                <motion.button type="submit" disabled={saving} whileHover={{ scale: 1.02 }} className="btn-primary py-3 w-full disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Check-in Modal */}
      <AnimatePresence>
        {checkinModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { setCheckinModal(false); setCheckinErrors({}); setCheckinDayName('') } }}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-white font-black text-lg" style={{ fontFamily: 'Oswald' }}>
                    {checkinDayName ? 'MARK ATTENDANCE' : 'CHECK IN TODAY'}
                  </h3>
                  {checkinDayName && (
                    <p className="text-primary text-sm font-semibold mt-0.5">{checkinDayName}</p>
                  )}
                </div>
                <button onClick={() => { setCheckinModal(false); setCheckinErrors({}); setCheckinDayName('') }} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <form onSubmit={handleCheckIn} className="space-y-4" noValidate>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Workout Session</label>
                  {checkinDayName ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-dark-300 border border-dark-500 rounded-xl">
                      <FaDumbbell className="text-primary text-sm flex-shrink-0" />
                      <span className="text-white text-sm font-medium">{checkinDayName}</span>
                      <span className="text-xs text-gray-500 ml-auto">from plan</span>
                    </div>
                  ) : workoutPlan?.days?.length > 0 ? (
                    <select value={checkinForm.workoutType} onChange={(e) => setCheckinForm({ ...checkinForm, workoutType: e.target.value })} className="input-field">
                      <option value="">Select session</option>
                      {workoutPlan.days.map((day, di) => (
                        <option key={di} value={day.dayName}>
                          Day {day.dayNumber ?? di + 1}: {day.dayName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={checkinForm.workoutType}
                      onChange={(e) => setCheckinForm({ ...checkinForm, workoutType: e.target.value })}
                      placeholder="e.g. Chest & Triceps"
                      className="input-field"
                    />
                  )}
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Duration (minutes)</label>
                  <input type="number" value={checkinForm.duration} onChange={(e) => setCheckinForm({ ...checkinForm, duration: e.target.value })} placeholder="e.g. 60" className={fieldClass(checkinErrors, 'duration', 'input-field')} />
                  <Err msg={checkinErrors.duration} />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Notes (optional)</label>
                  <input value={checkinForm.notes} onChange={(e) => setCheckinForm({ ...checkinForm, notes: e.target.value })} placeholder="How was your session?" className="input-field" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => { setCheckinModal(false); setCheckinErrors({}); setCheckinDayName('') }} className="flex-1 py-2.5 rounded-xl border border-dark-500 text-gray-400 hover:text-white transition-all text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">{saving ? 'Marking...' : checkinDayName ? 'Mark Done' : 'Check In'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weight Log Modal */}
      <AnimatePresence>
        {weightModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { setWeightModal(false); setWeightErrors({}) } }}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-black text-lg" style={{ fontFamily: 'Oswald' }}>LOG PROGRESS</h3>
                <button onClick={() => { setWeightModal(false); setWeightErrors({}) }} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <form onSubmit={handleLogWeight} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Weight (kg) *</label>
                    <input type="number" step="0.1" value={weightForm.weight} onChange={(e) => setWeightForm({ ...weightForm, weight: e.target.value })} placeholder="72.5" className={fieldClass(weightErrors, 'weight', 'input-field')} />
                    <Err msg={weightErrors.weight} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Body Fat (%)</label>
                    <input type="number" step="0.1" value={weightForm.bodyFat} onChange={(e) => setWeightForm({ ...weightForm, bodyFat: e.target.value })} placeholder="18.0" className={fieldClass(weightErrors, 'bodyFat', 'input-field')} />
                    <Err msg={weightErrors.bodyFat} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Muscle Mass (kg)</label>
                    <input type="number" step="0.1" value={weightForm.muscleMass} onChange={(e) => setWeightForm({ ...weightForm, muscleMass: e.target.value })} placeholder="55.0" className={fieldClass(weightErrors, 'muscleMass', 'input-field')} />
                    <Err msg={weightErrors.muscleMass} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Notes</label>
                    <input value={weightForm.notes} onChange={(e) => setWeightForm({ ...weightForm, notes: e.target.value })} placeholder="Optional" className="input-field" />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => { setWeightModal(false); setWeightErrors({}) }} className="flex-1 py-2.5 rounded-xl border border-dark-500 text-gray-400 hover:text-white transition-all text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">{saving ? 'Saving...' : 'Log Progress'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trainer Details Modal */}
      <AnimatePresence>
        {trainerModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setTrainerModal(null) }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-sm p-6 relative"
            >
              <button onClick={() => setTrainerModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                <FaTimes />
              </button>

              {/* Trainer type badge */}
              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-5 ${
                trainerModal.type === 'Personal Trainer'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
              }`}>
                <FaUserTie className="text-[10px]" />
                {trainerModal.type}
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-white text-4xl font-black mb-4 overflow-hidden shadow-lg ${
                  trainerModal.type === 'Personal Trainer'
                    ? 'bg-gradient-to-br from-primary to-secondary shadow-primary/25'
                    : 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-500/25'
                }`}>
                  {trainerModal.image
                    ? <img src={trainerModal.image} alt={trainerModal.name} className="w-full h-full object-cover" />
                    : trainerModal.name?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>
                  {trainerModal.name?.toUpperCase()}
                </h2>
                {trainerModal.speciality && (
                  <p className={`text-sm mt-1 ${trainerModal.type === 'Personal Trainer' ? 'text-primary' : 'text-purple-300'}`}>
                    {trainerModal.speciality}
                  </p>
                )}
                {trainerModal.trainerId && (
                  <span className="mt-2 text-xs font-mono text-gray-500 bg-dark-300 px-2 py-0.5 rounded-md border border-dark-500">
                    {trainerModal.trainerId}
                  </span>
                )}
              </div>

              {/* Contact details */}
              <div className="space-y-3">
                {trainerModal.email && (
                  <div className="flex items-center gap-3 p-3 bg-dark-300 rounded-xl border border-dark-500">
                    <div className="w-8 h-8 rounded-lg bg-dark-400 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-gray-500 text-[10px] mb-0.5">Email</div>
                      <a href={`mailto:${trainerModal.email}`} className="text-white text-sm truncate block hover:text-primary transition-colors">
                        {trainerModal.email}
                      </a>
                    </div>
                  </div>
                )}
                {trainerModal.phone && (
                  <div className="flex items-center gap-3 p-3 bg-dark-300 rounded-xl border border-dark-500">
                    <div className="w-8 h-8 rounded-lg bg-dark-400 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-gray-500 text-[10px] mb-0.5">Phone</div>
                      <a href={`tel:${trainerModal.phone}`} className="text-white text-sm block hover:text-primary transition-colors">
                        {trainerModal.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Star Rating */}
              <div className="mt-5 pt-5 border-t border-dark-400">
                <h4 className="text-white text-xs font-bold mb-3 flex items-center gap-1.5">
                  <FaStar className="text-yellow-400 text-[10px]" /> Rate Your Trainer
                </h4>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRatingForm((p) => ({ ...p, rating: star }))}
                      className="text-2xl transition-colors leading-none"
                    >
                      <FaStar className={`${(hoverRating || ratingForm.rating) >= star ? 'text-yellow-400' : 'text-gray-600'} transition-colors`} />
                    </button>
                  ))}
                  {ratingForm.rating > 0 && (
                    <span className="text-gray-400 text-xs ml-2">{ratingForm.rating} / 5</span>
                  )}
                </div>
                <textarea
                  value={ratingForm.comment}
                  onChange={(e) => setRatingForm((p) => ({ ...p, comment: e.target.value }))}
                  placeholder="Share your experience... (optional)"
                  className="input-field text-sm h-16 resize-none w-full"
                />
                <button
                  disabled={ratingSaving || !ratingForm.rating}
                  onClick={async () => {
                    setRatingSaving(true)
                    try {
                      await api.post(`/trainers/${trainerModal._id}/reviews`, ratingForm)
                      toast.success('Review submitted! Thank you.')
                      setTrainerModal(null)
                    } catch (err) {
                      toast.error(err.response?.data?.message || 'Failed to submit review')
                    } finally {
                      setRatingSaving(false)
                    }
                  }}
                  className="w-full mt-3 btn-primary py-2.5 text-sm disabled:opacity-60"
                >
                  {ratingSaving ? 'Submitting...' : ratingForm.rating ? 'Submit Review' : 'Select a rating first'}
                </button>
              </div>

              <button
                onClick={() => setTrainerModal(null)}
                className="w-full mt-3 py-2.5 rounded-xl border border-dark-500 text-gray-400 hover:text-white hover:border-dark-300 transition-all text-sm"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  )
}
