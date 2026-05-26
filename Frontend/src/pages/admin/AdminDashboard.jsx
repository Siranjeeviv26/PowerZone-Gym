import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaDumbbell, FaUsers, FaUserTie, FaCrown, FaImages,
  FaMoneyBill, FaEnvelope, FaChartBar, FaHome, FaTachometerAlt,
  FaBars, FaTimes, FaSignOutAlt, FaMapMarkerAlt, FaAppleAlt,
  FaExchangeAlt, FaGlobe, FaFileAlt, FaQuoteLeft, FaRunning, FaEdit, FaLink,
  FaPalette, FaDatabase, FaCamera, FaTag,
} from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { logout, setUser } from '../../store/slices/authSlice'
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

export function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [uploading, setUploading] = useState(false)
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)
  const fileRef = useRef()

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('avatar', file)
    setUploading(true)
    try {
      const { data } = await api.put('/users/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      dispatch(setUser(data.user))
      toast.success('Profile photo updated!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

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
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors">
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            <button
              onClick={() => fileRef.current?.click()}
              title="Click to update profile photo"
              className="relative group flex-shrink-0"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-colors" />
              ) : (
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaCamera className="text-white text-[10px]" />
                )}
              </div>
            </button>
            <span className="text-gray-300 text-sm hidden sm:block">{user?.name || 'Admin'}</span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [dashData, setDashData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setDashData(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = dashData ? [
    { label: 'Total Members', value: dashData.stats?.totalUsers?.toLocaleString() ?? '—', change: `+${dashData.stats?.newSignups ?? 0} new`, icon: FaUsers, color: '#e63946' },
    { label: 'Active Trainers', value: dashData.stats?.totalTrainers?.toLocaleString() ?? '—', change: 'Certified', icon: FaUserTie, color: '#f4a261' },
    { label: 'Monthly Revenue', value: dashData.stats?.monthlyRevenue ? `₹${(dashData.stats.monthlyRevenue / 100000).toFixed(1)}L` : '₹0', change: 'This month', icon: FaMoneyBill, color: '#22c55e' },
    { label: 'New Signups', value: dashData.stats?.newSignups?.toLocaleString() ?? '0', change: 'Last 30 days', icon: FaChartBar, color: '#4361ee' },
  ] : []

  const recentUsers = dashData?.recentUsers ?? []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Oswald' }}>DASHBOARD OVERVIEW</h1>
          <p className="text-gray-400 text-sm">Welcome back, Admin! Here's what's happening today.</p>
        </motion.div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="h-10 w-10 bg-dark-400 rounded-xl mb-4" />
                <div className="h-6 bg-dark-400 rounded w-20 mb-2" />
                <div className="h-3 bg-dark-400 rounded w-28" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                    <stat.icon style={{ color: stat.color }} />
                  </div>
                  <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">{stat.change}</span>
                </div>
                <div className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Oswald' }}>{stat.value}</div>
                <div className="text-gray-400 text-xs">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Recent Members */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold flex items-center gap-2">
              <FaUsers className="text-primary" /> Recent Members
            </h2>
            <Link to="/admin/users" className="text-primary text-sm hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-dark-400 rounded-full" />
                  <div className="flex-1">
                    <div className="h-3 bg-dark-400 rounded w-32 mb-1" />
                    <div className="h-3 bg-dark-400 rounded w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentUsers.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No members yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 text-xs border-b border-dark-400">
                    {['Member', 'Plan', 'Joined', 'Status'].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((m, i) => (
                    <tr key={i} className="border-b border-dark-400/50 hover:bg-dark-300/50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          {m.avatar ? (
                            <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                              {m.name?.charAt(0) || '?'}
                            </div>
                          )}
                          <div>
                            <div className="text-white text-sm font-medium">{m.name}</div>
                            <div className="text-gray-500 text-xs">{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-300">{m.membership?.plan?.name || '—'}</td>
                      <td className="py-3 pr-4 text-sm text-gray-400">
                        {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          m.membership?.status === 'active'  ? 'bg-green-500/10 text-green-400'  :
                          m.membership?.status === 'expired' ? 'bg-red-500/10 text-red-400'      :
                          m.membership?.status === 'frozen'  ? 'bg-blue-500/10 text-blue-400'    :
                          m.membership?.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400':
                          'bg-gray-500/10 text-gray-500'
                        }`}>
                          {m.membership?.status
                            ? m.membership.status.charAt(0).toUpperCase() + m.membership.status.slice(1)
                            : 'No Plan'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Add Trainer', icon: FaUserTie, to: '/admin/trainers', color: '#f4a261' },
            { label: 'Manage Plans', icon: FaCrown, to: '/admin/plans', color: '#e63946' },
            { label: 'Manage Gallery', icon: FaImages, to: '/admin/gallery', color: '#4361ee' },
            { label: 'Diet Plans', icon: FaAppleAlt, to: '/admin/diet-plans', color: '#22c55e' },
          ].map((action, i) => (
            <Link
              key={i}
              to={action.to}
              className="glass-card p-5 text-center hover:border-primary/30 transition-all hover:-translate-y-1"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${action.color}20` }}>
                <action.icon style={{ color: action.color }} />
              </div>
              <div className="text-white text-sm font-medium">{action.label}</div>
            </Link>
          ))}
        </motion.div>
      </div>
    </AdminLayout>
  )
}
