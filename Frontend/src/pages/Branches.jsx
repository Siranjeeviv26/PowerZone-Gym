import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaMapMarkerAlt, FaPhone, FaUser, FaArrowRight } from 'react-icons/fa'
import PageHero from '../components/shared/PageHero'
import api from '../utils/api'
import { useSiteContent } from '../context/SiteContentContext'

const BRANCHES_DEFAULTS = {
  heroBadge: 'Our Locations',
  heroTitle: 'FIND YOUR',
  heroHighlight: 'BRANCH',
  heroSubtitle: 'Multiple locations across the city — find the PowerZone nearest to you and start your transformation.',
  heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
}

export default function Branches() {
  const saved = useSiteContent('page_branches')
  const c = saved ? { ...BRANCHES_DEFAULTS, ...saved } : BRANCHES_DEFAULTS
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/branches').then(({ data }) => setBranches(data.branches || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHero badge={c.heroBadge} title={c.heroTitle} highlight={c.heroHighlight} subtitle={c.heroSubtitle} image={c.heroImage} />

      <section className="py-24 px-4 md:px-8 lg:px-16 bg-dark">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex gap-6 items-start mb-14">
            <div className="w-1 self-stretch bg-gradient-to-b from-primary to-transparent rounded-full flex-shrink-0 min-h-[70px]" />
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-3">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span className="text-primary text-xs font-bold uppercase tracking-widest">Locations</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'Oswald' }}>
                All <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Branches</span>
              </h2>
              <p className="text-gray-400 mt-2">Pick the branch closest to you and walk in today.</p>
            </div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0,1,2,3].map((i) => (
                <div key={i} className="rounded-2xl bg-dark-200 border border-dark-400 p-6 animate-pulse">
                  <div className="h-6 bg-dark-400 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-dark-400 rounded w-1/3 mb-5" />
                  {[0,1,2].map((j) => <div key={j} className="h-3 bg-dark-400 rounded mb-2" />)}
                </div>
              ))}
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center py-20">
              <FaMapMarkerAlt className="text-5xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No branches listed yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {branches.map((branch, i) => (
                <motion.div key={branch._id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl bg-dark-200 border border-dark-400 hover:border-primary/30 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-white font-black text-xl mb-0.5" style={{ fontFamily: 'Oswald' }}>{branch.name}</h3>
                      <p className="text-primary font-semibold text-sm">{branch.location}</p>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaMapMarkerAlt className="text-primary text-sm" />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {branch.address && (
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 bg-dark-300 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FaMapMarkerAlt className="text-primary text-[10px]" />
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">{branch.address}</p>
                      </div>
                    )}
                    {branch.manager && (
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-dark-300 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FaUser className="text-primary text-[10px]" />
                        </div>
                        <p className="text-gray-400 text-sm">Manager: <span className="text-gray-200 font-medium">{branch.manager}</span></p>
                      </div>
                    )}
                    {branch.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-dark-300 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FaPhone className="text-primary text-[10px]" />
                        </div>
                        <a href={`tel:${branch.phone}`} className="text-gray-400 hover:text-primary text-sm transition-colors">{branch.phone}</a>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Transfer CTA */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-dark-100">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span className="text-primary text-xs font-bold uppercase tracking-widest">Existing Members</span>
            </div>
            <h2 className="text-4xl font-black text-white mb-3" style={{ fontFamily: 'Oswald' }}>
              WANT TO <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">TRANSFER?</span>
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">Already a member? Transfer to any branch from your dashboard. A one-time transfer fee applies.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/dashboard">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="h-12 flex items-center gap-2 bg-primary text-white font-bold px-7 rounded-xl text-sm shadow-lg shadow-primary/25 transition-all">
                  Go to Dashboard <FaArrowRight className="text-xs" />
                </motion.button>
              </Link>
              <Link to="/contact">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="h-12 flex items-center gap-2 border border-dark-400 hover:border-primary text-gray-300 hover:text-white font-bold px-7 rounded-xl text-sm transition-all">
                  Contact Us
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
