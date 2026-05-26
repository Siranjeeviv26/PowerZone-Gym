import { useState, useEffect, useRef } from 'react'
import { FaBell, FaTimes, FaCheck, FaRunning } from 'react-icons/fa'
import { AnimatePresence, motion } from 'framer-motion'
import api from '../../utils/api'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {
      // silent — bell shouldn't break the page
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read')
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      // silent
    }
  }

  const markOneRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // silent
    }
  }

  const deleteOne = async (e, id) => {
    e.stopPropagation()
    try {
      await api.delete(`/notifications/${id}`)
      const removed = notifications.find((n) => n._id === id)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
      if (removed && !removed.isRead) setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // silent
    }
  }

  const handleOpen = () => {
    setOpen((v) => !v)
  }

  const handleNotificationClick = (n) => {
    if (!n.isRead) markOneRead(n._id)
  }

  const formatTime = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now - d
    const mins = Math.floor(diffMs / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-dark-200 border border-dark-400 text-gray-400 hover:text-white hover:border-primary/50 transition-all"
        title="Notifications"
      >
        <FaBell className="text-base" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary rounded-full text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 bg-dark-100 border border-dark-400 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-400">
              <span className="text-white font-bold text-sm">Notifications</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                  >
                    <FaCheck className="text-[10px]" /> Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                  <FaBell className="text-3xl mb-2 opacity-30" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-dark-400/50 last:border-0 group ${
                      n.isRead ? 'hover:bg-dark-200/50' : 'bg-primary/5 hover:bg-primary/10'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      n.type === 'activity' ? 'bg-primary/15 text-primary' : 'bg-gray-500/15 text-gray-400'
                    }`}>
                      <FaRunning className="text-sm" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold leading-snug ${n.isRead ? 'text-gray-300' : 'text-white'}`}>
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                      )}
                      <p className="text-[10px] text-gray-600 mt-1">{formatTime(n.createdAt)}</p>
                    </div>

                    {/* Unread dot + delete */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                      {!n.isRead && (
                        <span className="w-2 h-2 bg-primary rounded-full" />
                      )}
                      <button
                        onClick={(e) => deleteOne(e, n._id)}
                        className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove"
                      >
                        <FaTimes className="text-[10px]" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
