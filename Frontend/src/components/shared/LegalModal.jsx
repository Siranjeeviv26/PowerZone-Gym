import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaShieldAlt, FaFileAlt } from 'react-icons/fa'
import api from '../../utils/api'

export default function LegalModal({ type, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/legal/${type}`)
      .then(({ data: d }) => setData(d.legal || d))
      .catch(() => setData({ sections: [] }))
      .finally(() => setLoading(false))

    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [type])

  const title = type === 'terms' ? 'Terms of Service' : 'Privacy Policy'
  const Icon = type === 'terms' ? FaFileAlt : FaShieldAlt

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.3 }}
          className="bg-dark-100 border border-dark-400 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-400 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/15 border border-primary/25 rounded-xl flex items-center justify-center">
                <Icon className="text-primary" />
              </div>
              <div>
                <h2 className="text-white font-black text-lg" style={{ fontFamily: 'Oswald' }}>{title}</h2>
                {data?.lastUpdated && (
                  <p className="text-gray-500 text-xs">
                    Last updated: {new Date(data.lastUpdated).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white bg-dark-300 hover:bg-dark-400 rounded-lg transition-colors">
              <FaTimes className="text-sm" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="h-5 bg-dark-400 rounded w-1/3 mb-2" />
                    <div className="space-y-1.5">
                      <div className="h-3 bg-dark-400 rounded w-full" />
                      <div className="h-3 bg-dark-400 rounded w-5/6" />
                      <div className="h-3 bg-dark-400 rounded w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !data?.sections?.length ? (
              <div className="text-center py-12">
                <Icon className="text-4xl text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Content not yet available. Please check back later.</p>
              </div>
            ) : (
              data.sections.map((sec, i) => (
                <div key={i}>
                  {sec.heading && (
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2 text-sm">
                      <span className="w-5 h-5 bg-primary/15 rounded flex items-center justify-center text-primary text-[10px] font-black flex-shrink-0">{i + 1}</span>
                      {sec.heading}
                    </h3>
                  )}
                  {sec.body && (
                    <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap pl-7">{sec.body}</p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-dark-400 flex-shrink-0">
            <button onClick={onClose} className="w-full btn-primary py-2.5 text-sm">
              I Understand
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
