import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaQuoteLeft, FaStar, FaTrophy, FaUser } from 'react-icons/fa'
import api from '../../utils/api'

function StarRow({ rating, small }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <FaStar key={i} className={`${small ? 'text-xs' : 'text-sm'} ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`} />
      ))}
    </div>
  )
}

function Avatar({ src, name, size = 12 }) {
  if (src) {
    return <img src={src} alt={name} className={`w-${size} h-${size} rounded-full object-cover`} />
  }
  return (
    <div className={`w-${size} h-${size} rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold`}>
      {name?.charAt(0).toUpperCase() || <FaUser />}
    </div>
  )
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/testimonials')
      .then(({ data }) => setTestimonials(data.testimonials || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const avgRating = testimonials.length
    ? (testimonials.reduce((s, t) => s + (t.rating || 5), 0) / testimonials.length).toFixed(1)
    : '5.0'

  const featured = testimonials.find((t) => t.featured) || testimonials[0]
  const rest = testimonials.filter((t) => t !== featured).slice(0, 5)

  if (loading) {
    return (
      <section className="py-24 px-4 md:px-8 lg:px-16 bg-dark">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-dark-300 rounded w-48 mx-auto mb-4 animate-pulse" />
          <div className="h-12 bg-dark-300 rounded w-80 mx-auto mb-12 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`rounded-2xl bg-dark-200 border border-dark-400 p-6 animate-pulse ${i === 0 ? 'lg:col-span-2' : ''}`}>
                <div className="h-4 bg-dark-300 rounded w-24 mb-4" />
                <div className="space-y-2 mb-6">
                  <div className="h-3 bg-dark-300 rounded" />
                  <div className="h-3 bg-dark-300 rounded w-5/6" />
                  <div className="h-3 bg-dark-300 rounded w-4/6" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-dark-300" />
                  <div className="space-y-1">
                    <div className="h-3 bg-dark-300 rounded w-24" />
                    <div className="h-2 bg-dark-300 rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!loading && testimonials.length === 0) {
    return null
  }

  return (
    <section className="py-24 px-4 md:px-8 lg:px-16 bg-dark relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-secondary/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="absolute top-12 left-8 text-[20rem] font-black leading-none text-primary/[0.025] pointer-events-none select-none" style={{ fontFamily: 'Georgia, serif' }}>"</div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Testimonials</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-3" style={{ fontFamily: 'Oswald' }}>
            Real People,{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Real Results</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Thousands of members have transformed their lives at PowerZone. Here's what they say.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* Featured card */}
          {featured && (
            <motion.div
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-primary/20 p-7 group"
              style={{ background: 'linear-gradient(135deg, rgba(230,57,70,0.08) 0%, rgba(10,10,10,0.98) 50%)' }}>
              <FaQuoteLeft className="text-primary/20 text-5xl absolute top-5 right-6" />

              <div className="mb-4">
                <StarRow rating={featured.rating} />
              </div>

              <p className="text-gray-200 text-lg leading-relaxed mb-6 relative z-10 italic max-w-xl">
                "{featured.text}"
              </p>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Avatar src={featured.image} name={featured.name} size={12} />
                  <div>
                    <div className="text-white font-bold text-sm">{featured.name}</div>
                    {featured.role && <div className="text-gray-500 text-xs">{featured.role}</div>}
                  </div>
                </div>
                {featured.result && (
                  <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5">
                    <FaTrophy className="text-primary text-xs" />
                    <span className="text-primary text-xs font-bold">{featured.result}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Regular cards */}
          {rest.map((t, i) => (
            <motion.div key={t._id}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: (i + 1) * 0.1 }}
              className="relative overflow-hidden rounded-2xl bg-dark-200 border border-dark-400 hover:border-primary/25 transition-all duration-300 p-6 group hover:-translate-y-1">
              <FaQuoteLeft className="text-white/5 text-4xl absolute top-4 right-4" />

              <div className="mb-3">
                <StarRow rating={t.rating} small />
              </div>

              <p className="text-gray-400 text-sm leading-relaxed mb-5 relative z-10">
                "{t.text}"
              </p>

              <div className="pt-4 border-t border-dark-400">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar src={t.image} name={t.name} size={10} />
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    {t.role && <div className="text-gray-500 text-xs">{t.role}</div>}
                  </div>
                </div>
                {t.result && (
                  <div className="flex items-center gap-1.5 text-primary/80 text-xs">
                    <FaTrophy className="text-[10px] text-primary" />
                    <span className="font-medium">{t.result}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom stat */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-center mt-12">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 bg-dark-200 border border-dark-400 rounded-2xl px-5 sm:px-8 py-3 sm:py-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => <FaStar key={i} className="text-yellow-400 text-sm" />)}
            </div>
            <div className="hidden sm:block w-px h-6 bg-dark-400" />
            <span className="text-white font-bold text-sm">{avgRating}/5 average rating</span>
            <div className="hidden sm:block w-px h-6 bg-dark-400" />
            <span className="text-gray-400 text-sm">Based on {testimonials.length}+ reviews</span>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
