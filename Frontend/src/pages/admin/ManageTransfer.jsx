import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaExchangeAlt, FaTimes, FaBars, FaUsers, FaUserTie, FaCrown,
  FaHome, FaSignOutAlt, FaMapMarkerAlt, FaDumbbell, FaImages, FaAppleAlt,
  FaGlobe, FaPlus, FaTrash, FaEye, FaCalendar, FaUser, FaIdCard, FaEdit, FaCheckCircle, FaFileAlt, FaTachometerAlt, FaQuoteLeft, FaRunning, FaLink,
  FaPalette,
  FaDatabase, FaTag,
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

export default function ManageTransfer() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024)
  const [activeTab, setActiveTab] = useState('branch') // 'branch' | 'name'
  const [branches, setBranches] = useState([])
  const [users, setUsers] = useState([])
  const [transfers, setTransfers] = useState([])
  const [nameTransfers, setNameTransfers] = useState([])
  const [transferFees, setTransferFees] = useState([])
  const [addingFee, setAddingFee] = useState(false)
  const [newFeeForm, setNewFeeForm] = useState({ name: '', value: '' })
  const [editingFeeId, setEditingFeeId] = useState(null)
  const [editFeeForm, setEditFeeForm] = useState({ name: '', value: '' })
  const [feesSaving, setFeesSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // 'addBranch' | 'addName' | 'viewBranch' | 'viewName'
  const [selected, setSelected] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  const [branchForm, setBranchForm] = useState({ userId: '', toBranchId: '', notes: '' })
  const [nameForm, setNameForm] = useState({ fromUserId: '', toUserId: '', fee: '', notes: '', transferMembership: false })

  // Lookup fee from the dynamic fee structure by partial name match
  const lookupFee = (keyword) =>
    transferFees.find((f) => f.name.toLowerCase().includes(keyword.toLowerCase()))?.value ?? 0

  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [branchRes, usersRes, transfersRes, nameRes, feesRes] = await Promise.all([
        api.get('/branches'),
        api.get('/users'),
        api.get('/admin/transfers'),
        api.get('/admin/name-transfers'),
        api.get('/admin/transfer-fees'),
      ])
      setBranches(branchRes.data.branches || [])
      setUsers(usersRes.data.users || [])
      setTransfers(transfersRes.data.transfers || [])
      setNameTransfers(nameRes.data.transfers || [])
      setTransferFees(feesRes.data.fees || [])
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddFee = async () => {
    if (!newFeeForm.name.trim()) return toast.error('Fee name is required')
    setFeesSaving(true)
    try {
      const res = await api.post('/admin/transfer-fees', { name: newFeeForm.name, value: newFeeForm.value })
      setTransferFees(res.data.fees)
      setNewFeeForm({ name: '', value: '' })
      setAddingFee(false)
      toast.success('Fee added')
    } catch { toast.error('Failed to add fee') }
    finally { setFeesSaving(false) }
  }

  const handleUpdateFee = async (id) => {
    if (!editFeeForm.name.trim()) return toast.error('Fee name is required')
    setFeesSaving(true)
    try {
      const res = await api.put(`/admin/transfer-fees/${id}`, { name: editFeeForm.name, value: editFeeForm.value })
      setTransferFees(res.data.fees)
      setEditingFeeId(null)
      toast.success('Fee updated')
    } catch { toast.error('Failed to update fee') }
    finally { setFeesSaving(false) }
  }

  const handleDeleteFee = async (id) => {
    try {
      const res = await api.delete(`/admin/transfer-fees/${id}`)
      setTransferFees(res.data.fees)
      toast.success('Fee deleted')
    } catch { toast.error('Failed to delete fee') }
  }

  const handleBranchTransfer = async (e) => {
    e.preventDefault()
    if (!branchForm.userId) return toast.error('Select a member')
    if (!branchForm.toBranchId) return toast.error('Select destination branch')
    setSaving(true)
    try {
      await api.post('/admin/branch-transfer', { userId: branchForm.userId, toBranchId: branchForm.toBranchId, notes: branchForm.notes })
      toast.success('Branch transfer completed')
      setModal(null)
      setBranchForm({ userId: '', toBranchId: '', notes: '' })
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed')
    } finally {
      setSaving(false)
    }
  }

  const handleNameTransfer = async (e) => {
    e.preventDefault()
    if (!nameForm.fromUserId || !nameForm.toUserId) return toast.error('Select both members')
    setSaving(true)
    try {
      await api.post('/admin/name-transfer', {
        fromUserId: nameForm.fromUserId,
        toUserId: nameForm.toUserId,
        fee: nameForm.fee || 0,
        notes: nameForm.notes,
        transferMembership: nameForm.transferMembership,
      })
      toast.success('Name transfer completed')
      setModal(null)
      setNameForm({ fromUserId: '', toUserId: '', fee: '', notes: '', transferMembership: false })
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBranch = async () => {
    try {
      await api.delete(`/admin/transfers/${deleteTarget.userId}/${deleteTarget._id}`)
      toast.success('Record deleted')
      setTransfers((p) => p.filter((t) => t._id !== deleteTarget._id))
      setDeleteTarget(null)
    } catch { toast.error('Failed to delete') }
  }

  const handleDeleteName = async () => {
    try {
      await api.delete(`/admin/name-transfers/${deleteTarget._id}`)
      toast.success('Record deleted')
      setNameTransfers((p) => p.filter((t) => t._id !== deleteTarget._id))
      setDeleteTarget(null)
    } catch { toast.error('Failed to delete') }
  }

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="h-screen bg-dark flex overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto flex-shrink-0 flex flex-col bg-dark-100 border-r border-dark-400 transition-all duration-300 ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64 lg:translate-x-0 lg:w-16'}`}>
        <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-6' : 'justify-center px-3'} py-5 border-b border-dark-400`}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <FaExchangeAlt className="text-white text-sm" />
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
        <header className="bg-dark-100 border-b border-dark-400 px-4 md:px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors">
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto space-y-6">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>TRANSFERS</h1>
              <p className="text-gray-400 text-sm">Manage branch and name transfer records</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => {
        if (activeTab === 'name') setNameForm((p) => ({ ...p, fee: String(lookupFee('name')) }))
        setModal(activeTab === 'branch' ? 'addBranch' : 'addName')
      }}
              className="btn-primary text-sm py-2.5 flex items-center gap-2"
            >
              <FaPlus className="text-xs" /> New {activeTab === 'branch' ? 'Branch' : 'Name'} Transfer
            </motion.button>
          </div>

          {/* Fee Structure Card */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold flex items-center gap-2 text-sm">
                <FaIdCard className="text-primary" /> Transfer Fee Structure
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                onClick={() => { setAddingFee(true); setEditingFeeId(null) }}
                className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <FaPlus className="text-xs" /> Add Fee
              </motion.button>
            </div>

            {/* Add Fee Row */}
            <AnimatePresence>
              {addingFee && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="mb-3 p-3 bg-dark-300 rounded-xl border border-primary/30"
                >
                  <div className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-end">
                    <div className="flex-1">
                      <label className="text-gray-500 text-xs mb-1 block">Fee Name</label>
                      <input
                        value={newFeeForm.name}
                        onChange={(e) => setNewFeeForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Name Transfer"
                        className="input-field text-sm"
                        autoFocus
                      />
                    </div>
                    <div className="w-full sm:w-36">
                      <label className="text-gray-500 text-xs mb-1 block">Amount (₹)</label>
                      <input
                        type="number"
                        value={newFeeForm.value}
                        onChange={(e) => setNewFeeForm((p) => ({ ...p, value: e.target.value }))}
                        placeholder="0"
                        className="input-field text-sm"
                        min="0"
                      />
                    </div>
                    <div className="flex gap-2 pb-0.5">
                      <button onClick={handleAddFee} disabled={feesSaving} className="btn-primary text-sm py-2.5 px-4 disabled:opacity-60">
                        {feesSaving ? '...' : 'Save'}
                      </button>
                      <button onClick={() => { setAddingFee(false); setNewFeeForm({ name: '', value: '' }) }} className="py-2.5 px-4 rounded-xl bg-dark-400 text-gray-400 text-sm hover:bg-dark-500 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fee List */}
            {transferFees.length === 0 && !addingFee ? (
              <div className="text-center py-6">
                <FaIdCard className="text-3xl text-gray-700 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No fee types configured yet.</p>
                <button onClick={() => setAddingFee(true)} className="text-primary text-xs mt-1 hover:underline">Add your first fee type</button>
              </div>
            ) : (
              <div className="space-y-2">
                {transferFees.map((fee) => (
                  editingFeeId === fee._id ? (
                    <motion.div key={fee._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center p-3 bg-dark-300 rounded-xl border border-primary/30"
                    >
                      <input
                        value={editFeeForm.name}
                        onChange={(e) => setEditFeeForm((p) => ({ ...p, name: e.target.value }))}
                        className="flex-1 bg-dark-200 border border-dark-400 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary/50"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">₹</span>
                        <input
                          type="number"
                          value={editFeeForm.value}
                          onChange={(e) => setEditFeeForm((p) => ({ ...p, value: e.target.value }))}
                          className="w-28 bg-dark-200 border border-dark-400 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary/50"
                          min="0"
                        />
                        <button onClick={() => handleUpdateFee(fee._id)} disabled={feesSaving} className="w-8 h-8 rounded-lg bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center text-green-400 transition-colors"><FaCheckCircle className="text-sm" /></button>
                        <button onClick={() => setEditingFeeId(null)} className="w-8 h-8 rounded-lg bg-dark-400 hover:bg-dark-500 flex items-center justify-center text-gray-400 transition-colors"><FaTimes className="text-sm" /></button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key={fee._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-3 bg-dark-300 rounded-xl hover:bg-dark-400/70 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FaIdCard className="text-primary text-xs" />
                        </div>
                        <span className="text-white text-sm font-medium">{fee.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 font-bold text-base">₹{fee.value.toLocaleString('en-IN')}</span>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditingFeeId(fee._id); setEditFeeForm({ name: fee.name, value: fee.value }); setAddingFee(false) }}
                            className="w-7 h-7 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 transition-colors"
                          >
                            <FaEdit className="text-xs" />
                          </button>
                          <button
                            onClick={() => handleDeleteFee(fee._id)}
                            className="w-7 h-7 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 transition-colors"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('branch')}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'branch' ? 'bg-primary text-white' : 'bg-dark-300 text-gray-400 border border-dark-500 hover:text-white'}`}
            >
              <FaMapMarkerAlt className="text-xs" /> Branch Transfers ({transfers.length})
            </button>
            <button
              onClick={() => setActiveTab('name')}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'name' ? 'bg-purple-600 text-white' : 'bg-dark-300 text-gray-400 border border-dark-500 hover:text-white'}`}
            >
              <FaIdCard className="text-xs" /> Name Transfers ({nameTransfers.length})
            </button>
          </div>

          {/* Branch Transfers Table */}
          {activeTab === 'branch' && (
            <div className="glass-card overflow-hidden">
              {loading ? (
                <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
              ) : transfers.length === 0 ? (
                <div className="p-12 text-center">
                  <FaMapMarkerAlt className="text-4xl text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No branch transfer records yet.</p>
                  <button onClick={() => setModal('addBranch')} className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-2"><FaPlus className="text-xs" /> New Transfer</button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 text-xs bg-dark-300/50 border-b border-dark-400">
                        {['Member', 'From Branch', 'To Branch', 'Fee', 'Date', 'Notes', 'Actions'].map((h) => (
                          <th key={h} className="py-3 px-4 font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {transfers.map((t, i) => (
                        <motion.tr key={t._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-dark-400/50 hover:bg-dark-300/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">{t.userName?.charAt(0).toUpperCase()}</div>
                              <div>
                                <div className="text-white text-sm font-medium">{t.userName}</div>
                                <div className="text-gray-500 text-xs">{t.userEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4"><span className="text-xs px-2.5 py-1 rounded-full bg-dark-400 text-gray-300">{t.fromBranch?.name || <span className="italic text-gray-600">None</span>}</span></td>
                          <td className="py-3 px-4"><span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">{t.toBranch?.name || '—'}</span></td>
                          <td className="py-3 px-4"><span className="text-green-400 text-sm font-semibold">₹{t.fee ?? 0}</span></td>
                          <td className="py-3 px-4 text-gray-400 text-xs whitespace-nowrap">{fmt(t.date)}</td>
                          <td className="py-3 px-4 text-gray-500 text-xs max-w-[120px] truncate">{t.notes || '—'}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1.5">
                              <button onClick={() => { setSelected({ ...t, type: 'branch' }); setModal('viewBranch') }} className="w-7 h-7 bg-green-500/10 hover:bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 transition-colors"><FaEye className="text-xs" /></button>
                              <button onClick={() => setDeleteTarget({ ...t, type: 'branch' })} className="w-7 h-7 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 transition-colors"><FaTrash className="text-xs" /></button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Name Transfers Table */}
          {activeTab === 'name' && (
            <div className="glass-card overflow-hidden">
              {loading ? (
                <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
              ) : nameTransfers.length === 0 ? (
                <div className="p-12 text-center">
                  <FaIdCard className="text-4xl text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No name transfer records yet.</p>
                  <button onClick={() => setModal('addName')} className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-2"><FaPlus className="text-xs" /> New Name Transfer</button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 text-xs bg-dark-300/50 border-b border-dark-400">
                        {['From Member', 'To Member', 'Plan', 'Fee', 'Membership Moved', 'Date', 'Notes', 'Actions'].map((h) => (
                          <th key={h} className="py-3 px-4 font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {nameTransfers.map((t, i) => (
                        <motion.tr key={t._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-dark-400/50 hover:bg-dark-300/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 text-xs font-bold flex-shrink-0">{t.fromUser?.name?.charAt(0)}</div>
                              <div>
                                <div className="text-white text-sm font-medium">{t.fromUser?.name}</div>
                                {t.fromUser?.regNo && <div className="text-xs text-primary font-mono">{t.fromUser.regNo}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-xs font-bold flex-shrink-0">{t.toUser?.name?.charAt(0)}</div>
                              <div>
                                <div className="text-white text-sm font-medium">{t.toUser?.name}</div>
                                {t.toUser?.regNo && <div className="text-xs text-primary font-mono">{t.toUser.regNo}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4"><span className="text-xs px-2.5 py-1 rounded-full bg-dark-400 text-gray-300">{t.membershipPlan?.name || '—'}</span></td>
                          <td className="py-3 px-4"><span className="text-green-400 text-sm font-semibold">₹{t.fee ?? 0}</span></td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${t.transferMembership ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-500'}`}>
                              {t.transferMembership ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-400 text-xs whitespace-nowrap">{fmt(t.date)}</td>
                          <td className="py-3 px-4 text-gray-500 text-xs max-w-[100px] truncate">{t.notes || '—'}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1.5">
                              <button onClick={() => { setSelected({ ...t, type: 'name' }); setModal('viewName') }} className="w-7 h-7 bg-green-500/10 hover:bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 transition-colors"><FaEye className="text-xs" /></button>
                              <button onClick={() => setDeleteTarget({ ...t, type: 'name' })} className="w-7 h-7 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 transition-colors"><FaTrash className="text-xs" /></button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Add Branch Transfer Modal */}
      <AnimatePresence>
        {modal === 'addBranch' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>NEW BRANCH TRANSFER</h2>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-4 flex items-center justify-between">
                <p className="text-yellow-400 text-xs">Branch Transfer Fee</p>
                <span className="text-yellow-300 font-bold text-sm">₹{lookupFee('branch').toLocaleString('en-IN')}</span>
              </div>
              <form onSubmit={handleBranchTransfer} className="space-y-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Member *</label>
                  <select value={branchForm.userId} onChange={(e) => setBranchForm((p) => ({ ...p, userId: e.target.value }))} className="input-field text-sm" required>
                    <option value="">Select member</option>
                    {users.map((u) => <option key={u._id} value={u._id}>{u.regNo ? `[${u.regNo}] ` : ''}{u.name} — {u.email}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Transfer to Branch *</label>
                  <select value={branchForm.toBranchId} onChange={(e) => setBranchForm((p) => ({ ...p, toBranchId: e.target.value }))} className="input-field text-sm" required>
                    <option value="">Select branch</option>
                    {branches.map((b) => <option key={b._id} value={b._id}>{b.name} — {b.location}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Notes</label>
                  <input value={branchForm.notes} onChange={(e) => setBranchForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Reason for transfer..." className="input-field text-sm" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-dark-500 text-gray-400 text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">{saving ? 'Processing...' : 'Confirm Transfer'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Name Transfer Modal */}
      <AnimatePresence>
        {modal === 'addName' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>NEW NAME TRANSFER</h2>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 mb-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-purple-300 text-xs">Name Transfer Fee</p>
                  <span className="text-purple-200 font-bold text-sm">₹{lookupFee('name').toLocaleString('en-IN')}</span>
                </div>
                <p className="text-gray-500 text-xs">Trainer assignments (personal &amp; class) will always be transferred to the new owner.</p>
              </div>
              <form onSubmit={handleNameTransfer} className="space-y-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">From Member (Current Owner) *</label>
                  <select value={nameForm.fromUserId} onChange={(e) => setNameForm((p) => ({ ...p, fromUserId: e.target.value }))} className="input-field text-sm" required>
                    <option value="">Select member</option>
                    {users.filter((u) => u._id !== nameForm.toUserId).map((u) => (
                      <option key={u._id} value={u._id}>{u.regNo ? `[${u.regNo}] ` : ''}{u.name} — {u.membership?.plan?.name || 'No plan'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">To Member (New Owner) *</label>
                  <select value={nameForm.toUserId} onChange={(e) => setNameForm((p) => ({ ...p, toUserId: e.target.value }))} className="input-field text-sm" required>
                    <option value="">Select member</option>
                    {users.filter((u) => u._id !== nameForm.fromUserId).map((u) => (
                      <option key={u._id} value={u._id}>{u.regNo ? `[${u.regNo}] ` : ''}{u.name} — {u.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Transfer Fee (₹)</label>
                  <input type="number" value={nameForm.fee} onChange={(e) => setNameForm((p) => ({ ...p, fee: e.target.value }))} placeholder={`₹${lookupFee('name').toLocaleString('en-IN')}`} className="input-field text-sm" min="0" />
                </div>
                <div className="flex items-center gap-3 p-3 bg-dark-300 rounded-xl">
                  <input
                    type="checkbox"
                    id="transferMembership"
                    checked={nameForm.transferMembership}
                    onChange={(e) => setNameForm((p) => ({ ...p, transferMembership: e.target.checked }))}
                    className="accent-primary"
                  />
                  <label htmlFor="transferMembership" className="text-gray-300 text-sm cursor-pointer">
                    Also transfer the membership plan to the new member
                  </label>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Notes</label>
                  <input value={nameForm.notes} onChange={(e) => setNameForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Reason for transfer..." className="input-field text-sm" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-dark-500 text-gray-400 text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 text-sm rounded-xl disabled:opacity-60 transition-all font-medium">{saving ? 'Processing...' : 'Confirm Transfer'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Branch Transfer Modal */}
      <AnimatePresence>
        {modal === 'viewBranch' && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>BRANCH TRANSFER DETAILS</h2>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Member', value: selected.userName, sub: selected.userEmail, icon: FaUser },
                  { label: 'From Branch', value: selected.fromBranch?.name || 'None', sub: selected.fromBranch?.location, icon: FaMapMarkerAlt },
                  { label: 'To Branch', value: selected.toBranch?.name || '—', sub: selected.toBranch?.location, icon: FaMapMarkerAlt },
                  { label: 'Transfer Fee', value: `₹${selected.fee ?? 0}`, icon: FaExchangeAlt },
                  { label: 'Date', value: fmt(selected.date), icon: FaCalendar },
                  ...(selected.notes ? [{ label: 'Notes', value: selected.notes, icon: FaExchangeAlt }] : []),
                ].map(({ label, value, sub, icon: Icon }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-dark-300 rounded-xl">
                    <div className="w-8 h-8 bg-primary/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><Icon className="text-primary text-xs" /></div>
                    <div><p className="text-gray-500 text-xs">{label}</p><p className="text-white text-sm font-medium">{value}</p>{sub && <p className="text-gray-600 text-xs">{sub}</p>}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => { setModal(null); setDeleteTarget(selected) }} className="flex-1 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm flex items-center justify-center gap-2 transition-colors"><FaTrash className="text-xs" /> Delete</button>
                <button onClick={() => setModal(null)} className="px-6 bg-dark-300 hover:bg-dark-400 text-gray-300 rounded-full transition-colors text-sm">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Name Transfer Modal */}
      <AnimatePresence>
        {modal === 'viewName' && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>NAME TRANSFER DETAILS</h2>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-dark-300 rounded-xl">
                  <div className="text-center flex-1">
                    <div className="text-gray-500 text-xs mb-1">From</div>
                    <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 font-bold mx-auto mb-1">{selected.fromUser?.name?.charAt(0)}</div>
                    <div className="text-white text-sm font-medium">{selected.fromUser?.name}</div>
                    {selected.fromUser?.regNo && <div className="text-primary text-xs font-mono">{selected.fromUser.regNo}</div>}
                  </div>
                  <div className="text-primary text-xl font-bold px-4">→</div>
                  <div className="text-center flex-1">
                    <div className="text-gray-500 text-xs mb-1">To</div>
                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold mx-auto mb-1">{selected.toUser?.name?.charAt(0)}</div>
                    <div className="text-white text-sm font-medium">{selected.toUser?.name}</div>
                    {selected.toUser?.regNo && <div className="text-primary text-xs font-mono">{selected.toUser.regNo}</div>}
                  </div>
                </div>
                {[
                  { label: 'Plan Transferred', value: selected.membershipPlan?.name || '—' },
                  { label: 'Membership Moved', value: selected.transferMembership ? 'Yes — Plan moved to new owner' : 'No — Record only' },
                  { label: 'Transfer Fee', value: `₹${selected.fee ?? 0}` },
                  { label: 'Date', value: fmt(selected.date) },
                  ...(selected.notes ? [{ label: 'Notes', value: selected.notes }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between p-3 bg-dark-300 rounded-xl">
                    <span className="text-gray-500 text-xs">{label}</span>
                    <span className="text-white text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => { setModal(null); setDeleteTarget(selected) }} className="flex-1 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm flex items-center justify-center gap-2 transition-colors"><FaTrash className="text-xs" /> Delete</button>
                <button onClick={() => setModal(null)} className="px-6 bg-dark-300 hover:bg-dark-400 text-gray-300 rounded-full transition-colors text-sm">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-sm p-6 text-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><FaTrash className="text-red-400" /></div>
              <h3 className="text-white font-bold mb-2">Delete Transfer Record</h3>
              <p className="text-gray-400 text-sm mb-6">This will only remove the record — it will NOT reverse any membership changes.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-dark-500 text-gray-400 text-sm">Cancel</button>
                <button onClick={deleteTarget.type === 'name' ? handleDeleteName : handleDeleteBranch} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
