import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaMoneyBillWave, FaCreditCard, FaQrcode, FaWallet,
  FaFileAlt, FaDownload, FaEye, FaReceipt, FaClock,
  FaCheckCircle, FaTimesCircle, FaExclamationCircle,
  FaArrowRight, FaArrowLeft, FaFilter, FaTimes, FaInbox, FaSpinner
} from 'react-icons/fa'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const METHOD_ICONS = {
  cash: FaMoneyBillWave,
  razorpay: FaCreditCard,
  online: FaCreditCard,
  upi: FaQrcode,
  qr: FaQrcode,
  card: FaCreditCard,
  netbanking: FaWallet,
  wallet: FaWallet,
}

const METHOD_COLORS = {
  cash: 'bg-green-500/10 text-green-400 border-green-500/20',
  razorpay: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  online: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  upi: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  qr: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  card: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  netbanking: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  wallet: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

const STATUS_CONFIG = {
  success: { label: 'Completed', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: FaCheckCircle },
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: FaClock },
  failed: { label: 'Failed', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: FaTimesCircle },
  refunded: { label: 'Refunded', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: FaExclamationCircle },
}

const formatCurrency = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`
const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
const formatDateTime = (date) => new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

function MethodIcon({ method, className }) {
  const Icon = METHOD_ICONS[method] || FaMoneyBillWave
  return <Icon className={className} />
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: FaExclamationCircle }
  const Icon = config.icon
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${config.color}`}>
      <Icon className="text-[10px]" />
      {config.label}
    </span>
  )
}

function MethodBadge({ method }) {
  const Icon = METHOD_ICONS[method] || FaMoneyBillWave
  const colorClass = METHOD_COLORS[method] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  const labels = {
    cash: 'Cash',
    razorpay: 'Razorpay',
    online: 'Online',
    upi: 'UPI',
    qr: 'QR Code',
    card: 'Card',
    netbanking: 'Net Banking',
    wallet: 'Wallet',
  }
  return (
    <div className="flex items-center gap-2">
      <Icon className="text-primary text-lg" />
      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${colorClass}`}>
        {labels[method] || method}
      </span>
    </div>
  )
}

export default function MemberPurchaseHistory({ member, onClose, onViewInvoice }) {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [member?._id])

  const fetchPayments = async () => {
    if (!member?._id) return
    setLoading(true)
    try {
      const { data } = await api.get('/payments', { params: { user: member._id, limit: 100 } })
      setPayments(data.payments || [])
    } catch (err) {
      console.error('Failed to fetch payments:', err)
      toast.error('Failed to load purchase history')
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter(p => filter === 'all' || p.status === filter)

  const getMethodLabel = (method) => {
    const labels = {
      cash: 'Cash',
      razorpay: 'Razorpay',
      online: 'Online',
      upi: 'UPI',
      qr: 'QR Code',
      card: 'Card',
      netbanking: 'Net Banking',
      wallet: 'Wallet',
    }
    return labels[method] || method
  }

  const getMethodIcon = (method) => METHOD_ICONS[method] || FaMoneyBillWave

  const handleViewInvoice = (payment) => {
    if (onViewInvoice) {
      onViewInvoice(payment)
    } else {
      setSelectedPayment(payment)
      setShowDetail(true)
    }
  }

  const handleDownloadReceipt = async (payment) => {
    try {
      const { data } = await api.get(`/payments/${payment._id}/receipt`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Receipt-${payment.invoiceNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Receipt downloaded')
    } catch {
      toast.error('Failed to download receipt')
    }
  }

  if (!member) return null

  const totalSpent = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const counts = payments.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc }, {})
  const filterTabs = [
    { key: 'all', label: 'All', count: payments.length },
    { key: 'success', label: 'Completed', count: counts.success || 0 },
    { key: 'pending', label: 'Pending', count: counts.pending || 0 },
    { key: 'failed', label: 'Failed', count: counts.failed || 0 },
    { key: 'refunded', label: 'Refunded', count: counts.refunded || 0 },
  ].filter(t => t.key === 'all' || t.count > 0)

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3.5 bg-dark-300 rounded-xl border border-dark-400">
          <div className="flex items-center gap-2 mb-1">
            <FaReceipt className="text-primary text-xs" />
            <span className="text-gray-500 text-xs uppercase tracking-wide">Total Purchases</span>
          </div>
          <p className="text-white font-black text-2xl" style={{ fontFamily: 'Oswald' }}>{payments.length}</p>
        </div>
        <div className="p-3.5 bg-dark-300 rounded-xl border border-dark-400">
          <div className="flex items-center gap-2 mb-1">
            <FaMoneyBillWave className="text-green-400 text-xs" />
            <span className="text-gray-500 text-xs uppercase tracking-wide">Total Spent</span>
          </div>
          <p className="text-green-400 font-black text-2xl" style={{ fontFamily: 'Oswald' }}>{formatCurrency(totalSpent)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <FaFilter className="text-gray-500 text-xs" />
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filter === tab.key ? 'bg-primary text-white shadow-sm' : 'bg-dark-300 text-gray-400 hover:text-white hover:bg-dark-400'
            }`}
          >
            {tab.label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filter === tab.key ? 'bg-white/25' : 'bg-dark-400 text-gray-500'}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2 min-h-[120px]">
        {loading && (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-dark-300 rounded-xl animate-pulse border border-dark-400" />
            ))}
          </div>
        )}

        {!loading && filteredPayments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-14 h-14 bg-dark-300 rounded-2xl flex items-center justify-center mb-3 border border-dark-400">
              <FaInbox className="text-gray-500 text-2xl" />
            </div>
            <p className="text-gray-400 font-semibold text-sm mb-1">
              {payments.length === 0 ? 'No purchases yet' : `No ${filter} payments`}
            </p>
            <p className="text-gray-600 text-xs">
              {payments.length === 0 ? `${member.name} hasn't bought any plan yet.` : 'Try another filter.'}
            </p>
          </div>
        )}

        {!loading && filteredPayments.map((payment, index) => {
          const statusCfg = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending
          const StatusIcon = statusCfg.icon
          return (
            <motion.div
              key={payment._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => handleViewInvoice(payment)}
              className="group p-4 bg-dark-300 hover:bg-dark-400 border border-dark-400 hover:border-primary/30 rounded-xl cursor-pointer transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MethodIcon method={payment.paymentMethod} className="text-primary text-lg" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-white font-semibold text-sm truncate">{payment.plan?.name || 'Membership Plan'}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize flex-shrink-0 ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs truncate">
                    <span className="font-mono">{payment.invoiceNumber || '—'}</span>
                    <span className="mx-1.5">•</span>
                    {formatDate(payment.createdAt)}
                    <span className="mx-1.5">•</span>
                    <span className="capitalize">{getMethodLabel(payment.paymentMethod)}</span>
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-white font-black text-lg" style={{ fontFamily: 'Oswald' }}>{formatCurrency(payment.amount)}</p>
                  <span className="text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">View invoice →</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
      {showDetail && selectedPayment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetail(false)}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <FaReceipt className="text-primary text-xl" />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg" style={{ fontFamily: 'Oswald' }}>Invoice Details</h3>
                  <p className="text-gray-500 text-xs">Invoice #{selectedPayment.invoiceNumber}</p>
                </div>
              </div>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-white transition-colors p-1">
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Status</span>
                <StatusBadge status={selectedPayment.status} />
              </div>

              {/* Invoice Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-3 bg-dark-200 rounded-xl border border-dark-400">
                    <p className="text-gray-500 text-xs mb-1">Invoice Number</p>
                    <p className="text-white font-mono font-semibold text-sm">{selectedPayment.invoiceNumber}</p>
                  </div>
                  <div className="p-3 bg-dark-200 rounded-xl border border-dark-400">
                    <p className="text-gray-500 text-xs mb-1">Plan</p>
                    <p className="text-white font-medium text-sm">{selectedPayment.plan?.name || '—'}</p>
                  </div>
                  <div className="p-3 bg-dark-200 rounded-xl border border-dark-400">
                    <p className="text-gray-500 text-xs mb-1">Billing Cycle</p>
                    <p className="text-white font-medium text-sm capitalize">{selectedPayment.billingCycle}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-dark-200 rounded-xl border border-dark-400">
                    <p className="text-gray-500 text-xs mb-1">Amount Paid</p>
                    <p className="text-white font-black text-xl" style={{ fontFamily: 'Oswald' }}>{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  <div className="p-3 bg-dark-200 rounded-xl border border-dark-400">
                    <p className="text-gray-500 text-xs mb-1">Payment Method</p>
                    <MethodBadge method={selectedPayment.paymentMethod} />
                  </div>
                  <div className="p-3 bg-dark-200 rounded-xl border border-dark-400">
                    <p className="text-gray-500 text-xs mb-1">Transaction Date</p>
                    <p className="text-white font-medium text-sm">{formatDateTime(selectedPayment.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Membership Period */}
              {selectedPayment.startDate && selectedPayment.endDate && (
                <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
                  <p className="text-gray-500 text-xs mb-1">Membership Period</p>
                  <p className="text-white font-medium">
                    {formatDate(selectedPayment.startDate)} → {formatDate(selectedPayment.endDate)}
                  </p>
                </div>
              )}

              {/* Transaction ID */}
              {selectedPayment.transactionId && (
                <div className="p-3 bg-dark-200 rounded-xl border border-dark-400">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 text-xs">Transaction ID</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedPayment.transactionId)
                        toast.success('Copied!')
                      }}
                      className="text-primary text-xs hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-gray-200 font-mono text-sm break-all mt-1">{selectedPayment.transactionId}</p>
                </div>
              )}

              {/* Razorpay Details */}
              {selectedPayment.razorpayOrderId && (
                <div className="p-3 bg-dark-200 rounded-xl border border-dark-400">
                  <p className="text-gray-500 text-xs mb-1">Razorpay Order ID</p>
                  <p className="text-gray-200 font-mono text-sm break-all">{selectedPayment.razorpayOrderId}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-dark-400">
                <button
                  onClick={() => handleDownloadReceipt(selectedPayment)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-dark-200 border border-dark-400 hover:bg-dark-300 rounded-xl text-sm font-medium text-white transition-colors"
                >
                  <FaDownload className="text-xs" /> Download Receipt
                </button>
                <button
                  onClick={() => setShowDetail(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 btn-primary rounded-xl text-sm font-medium"
                >
                  <FaArrowLeft className="text-xs" /> Back
                </button>
              </div>
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}