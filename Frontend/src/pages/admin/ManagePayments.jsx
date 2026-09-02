import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  FaGlobe, FaTimes, FaBars, FaUsers, FaUserTie, FaCrown,
  FaHome, FaSignOutAlt, FaMapMarkerAlt, FaDumbbell, FaImages, FaAppleAlt,
  FaExchangeAlt, FaSave, FaFileAlt, FaTachometerAlt, FaQuoteLeft, FaRunning,
  FaEdit, FaLink, FaPalette, FaDatabase, FaQrcode, FaMoneyBillWave, FaCheck,
  FaTimes as FaX, FaClock, FaUpload, FaEye, FaEyeSlash,
} from 'react-icons/fa'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
  { to: '/admin/payments', label: 'Payments', icon: FaMoneyBillWave },
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

const DEFAULTS = {
  cashEnabled: true,
  qrEnabled: false,
  qrCodeImage: '',
  qrCodeLabel: 'Scan to Pay',
  upiId: '',
  cashInstructions: 'Visit the gym front desk and pay the amount in cash. Please quote your reference number when paying.',
  qrInstructions: 'Scan the QR code and complete the payment. Enter your transaction ID below after paying.',
}

const METHOD_MAP = { cash: 'Cash', upi: 'QR / UPI', card: 'Card', netbanking: 'Net Banking', wallet: 'Wallet' }

export default function ManagePayments() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024)
  const [activeTab, setActiveTab] = useState('settings')
  const [form, setForm] = useState(DEFAULTS)
  const [qrPreview, setQrPreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pendingPayments, setPendingPayments] = useState([])
  const [pendingLoading, setPendingLoading] = useState(false)
  const [actionId, setActionId] = useState(null)
  const fileRef = useRef()
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => { fetchSettings() }, [])
  useEffect(() => { if (activeTab === 'pending') fetchPending() }, [activeTab])

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings/payment')
      const s = data.settings
      setForm({
        cashEnabled: s.cashEnabled !== false,
        qrEnabled: s.qrEnabled === true,
        qrCodeImage: s.qrCodeImage || '',
        qrCodeLabel: s.qrCodeLabel || DEFAULTS.qrCodeLabel,
        upiId: s.upiId || '',
        cashInstructions: s.cashInstructions || DEFAULTS.cashInstructions,
        qrInstructions: s.qrInstructions || DEFAULTS.qrInstructions,
      })
      if (s.qrCodeImage) setQrPreview(s.qrCodeImage)
    } catch {
      // keep defaults
    } finally {
      setLoading(false)
    }
  }

  const fetchPending = async () => {
    setPendingLoading(true)
    try {
      const { data } = await api.get('/payments/pending')
      setPendingPayments(data.payments || [])
    } catch {
      toast.error('Failed to load pending payments')
    } finally {
      setPendingLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setForm((prev) => ({ ...prev, _file: file }))
    setQrPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      if (form._file) fd.append('qrCodeImage', form._file)
      fd.append('cashEnabled', form.cashEnabled)
      fd.append('qrEnabled', form.qrEnabled)
      fd.append('qrCodeLabel', form.qrCodeLabel)
      fd.append('upiId', form.upiId)
      fd.append('cashInstructions', form.cashInstructions)
      fd.append('qrInstructions', form.qrInstructions)
      await api.put('/settings/payment', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Payment settings saved!')
      setForm((prev) => ({ ...prev, _file: undefined }))
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async (id) => {
    setActionId(id)
    try {
      await api.put(`/payments/${id}/approve`)
      toast.success('Payment approved — membership activated!')
      setPendingPayments((prev) => prev.filter((p) => p._id !== id))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed')
    } finally {
      setActionId(null)
    }
  }

  const handleReject = async (id) => {
    setActionId(id)
    try {
      await api.put(`/payments/${id}/reject`)
      toast.success('Payment rejected.')
      setPendingPayments((prev) => prev.filter((p) => p._id !== id))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed')
    } finally {
      setActionId(null)
    }
  }

  const f = (field, val) => setForm((prev) => ({ ...prev, [field]: val }))

  return (
    <div className="h-screen bg-dark flex overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto flex-shrink-0 flex flex-col bg-dark-100 border-r border-dark-400 transition-all duration-300 ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64 lg:translate-x-0 lg:w-16'}`}>
        <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-6' : 'justify-center px-3'} py-5 border-b border-dark-400`}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <FaMoneyBillWave className="text-white text-sm" />
          </div>
          {sidebarOpen && <span className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>ADMIN PANEL</span>}
        </div>
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} className={`flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl mb-1 text-sm font-medium transition-all ${pathname === item.to ? 'bg-primary/15 text-primary border border-primary/20' : 'text-gray-400 hover:bg-dark-300 hover:text-white'}`}>
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
        <header className="bg-dark-100 border-b border-dark-400 px-4 md:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors">
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-3xl space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>PAYMENT SETTINGS</h1>
              <p className="text-gray-400 text-sm">Configure payment methods and approve pending transactions</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-dark-400 pb-0">
              {[
                { key: 'settings', label: 'Payment Methods' },
                { key: 'pending', label: 'Pending Approvals', badge: pendingPayments.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all flex items-center gap-2 ${
                    activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-white'
                  }`}
                >
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'settings' && (
              loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Cash */}
                  <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                        <FaMoneyBillWave className="text-green-400" /> Cash Payment
                      </h3>
                      <button
                        type="button"
                        onClick={() => f('cashEnabled', !form.cashEnabled)}
                        className={`flex items-center gap-1.5 text-[10px] font-medium rounded-full px-2.5 py-1 transition-all border ${
                          form.cashEnabled
                            ? 'bg-green-500/15 text-green-400 border-green-500/20'
                            : 'bg-dark-400 text-gray-500 border-dark-500'
                        }`}
                      >
                        {form.cashEnabled ? <FaEye className="text-[9px]" /> : <FaEyeSlash className="text-[9px]" />}
                        {form.cashEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                    <div className={form.cashEnabled ? '' : 'opacity-40 pointer-events-none'}>
                      <label className="text-gray-400 text-xs mb-1.5 block">Instructions shown to member</label>
                      <textarea
                        value={form.cashInstructions}
                        onChange={(e) => f('cashInstructions', e.target.value)}
                        rows={3}
                        className="input-field text-sm resize-none"
                        placeholder="e.g. Visit our front desk and pay in cash..."
                      />
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                        <FaQrcode className="text-primary" /> QR Code / UPI Payment
                      </h3>
                      <button
                        type="button"
                        onClick={() => f('qrEnabled', !form.qrEnabled)}
                        className={`flex items-center gap-1.5 text-[10px] font-medium rounded-full px-2.5 py-1 transition-all border ${
                          form.qrEnabled
                            ? 'bg-green-500/15 text-green-400 border-green-500/20'
                            : 'bg-dark-400 text-gray-500 border-dark-500'
                        }`}
                      >
                        {form.qrEnabled ? <FaEye className="text-[9px]" /> : <FaEyeSlash className="text-[9px]" />}
                        {form.qrEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                    <div className={`space-y-4 ${form.qrEnabled ? '' : 'opacity-40 pointer-events-none'}`}>
                      {/* QR image upload */}
                      <div>
                        <label className="text-gray-400 text-xs mb-2 block">QR Code Image</label>
                        <div className="flex items-start gap-4">
                          <div
                            className="w-32 h-32 bg-dark-300 border-2 border-dashed border-dark-500 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
                            onClick={() => fileRef.current?.click()}
                          >
                            {qrPreview ? (
                              <img src={qrPreview} alt="QR Code" className="w-full h-full object-contain p-1" />
                            ) : (
                              <div className="text-center">
                                <FaUpload className="text-gray-500 text-xl mx-auto mb-1" />
                                <p className="text-gray-600 text-xs">Upload QR</p>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-3">
                            <input type="file" accept="image/*" ref={fileRef} onChange={handleFileChange} className="hidden" />
                            <motion.button
                              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                              type="button"
                              onClick={() => fileRef.current?.click()}
                              className="flex items-center gap-2 px-4 py-2 bg-dark-300 border border-dark-500 hover:border-primary/40 rounded-lg text-gray-300 text-xs transition-all"
                            >
                              <FaUpload className="text-[10px]" /> {qrPreview ? 'Change Image' : 'Upload QR Image'}
                            </motion.button>
                            <p className="text-gray-600 text-xs">PNG or JPG. Will be shown to members during payment.</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-gray-400 text-xs mb-1.5 block">QR Label</label>
                          <input
                            value={form.qrCodeLabel}
                            onChange={(e) => f('qrCodeLabel', e.target.value)}
                            placeholder="Scan to Pay"
                            className="input-field text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs mb-1.5 block">UPI ID</label>
                          <input
                            value={form.upiId}
                            onChange={(e) => f('upiId', e.target.value)}
                            placeholder="name@upi"
                            className="input-field text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-400 text-xs mb-1.5 block">Instructions shown to member</label>
                        <textarea
                          value={form.qrInstructions}
                          onChange={(e) => f('qrInstructions', e.target.value)}
                          rows={2}
                          className="input-field text-sm resize-none"
                          placeholder="e.g. Scan the QR code and complete the payment..."
                        />
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary py-3 px-8 flex items-center gap-2 disabled:opacity-60"
                  >
                    {saving
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                      : <><FaSave /> Save Payment Settings</>}
                  </motion.button>
                </div>
              )
            )}

            {activeTab === 'pending' && (
              <div>
                {pendingLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : pendingPayments.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <FaClock className="text-4xl mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No pending payments</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingPayments.map((p) => (
                      <div key={p._id} className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-semibold text-sm truncate">{p.user?.name}</span>
                            <span className="text-[10px] bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full font-bold flex-shrink-0">PENDING</span>
                          </div>
                          <p className="text-gray-500 text-xs mb-1">{p.user?.email}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400">
                            <span>{p.plan?.name}</span>
                            <span>·</span>
                            <span className="capitalize">{p.billingCycle}</span>
                            <span>·</span>
                            <span className="text-white font-semibold">₹{p.amount?.toLocaleString()}</span>
                            <span>·</span>
                            <span>{METHOD_MAP[p.paymentMethod] || p.paymentMethod}</span>
                          </div>
                          {p.transactionId && (
                            <p className="text-gray-600 text-xs mt-1">TxnID: <span className="font-mono text-gray-400">{p.transactionId}</span></p>
                          )}
                          <p className="text-gray-600 text-xs mt-0.5">{new Date(p.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => handleApprove(p._id)}
                            disabled={actionId === p._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/15 border border-green-500/30 hover:bg-green-500/25 text-green-400 text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                          >
                            <FaCheck className="text-[10px]" /> Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => handleReject(p._id)}
                            disabled={actionId === p._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 text-red-400 text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                          >
                            <FaX className="text-[10px]" /> Reject
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
