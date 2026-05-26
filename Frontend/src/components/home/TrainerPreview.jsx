import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaInstagram, FaFacebook, FaTwitter, FaArrowRight, FaStar } from 'react-icons/fa'
import api from '../../utils/api'

const CARD_COLORS = ['#e63946', '#52b788', '#f4a261', '#4361ee']

export default function TrainerPreview() {
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/trainers')
      .then(({ data }) => setTrainers((data.trainers || []).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cards = loading
    ? Array(4).fill(null)
    : trainers

  return (
    <section className="py-24 px-4 md:px-8 lg:px-16 bg-dark-100 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span className="text-primary text-xs font-bold uppercase tracking-widest">Our Trainers</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'Oswald' }}>
              Meet Your{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Coaches</span>
            </h2>
            <p className="text-gray-400 mt-2 text-base max-w-xl">Certified professionals dedicated to helping you achieve your best physique and performance.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <Link to="/trainers">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 border border-primary/30 hover:border-primary text-primary hover:text-white hover:bg-primary font-bold px-6 py-3 rounded-xl transition-all duration-300 text-sm whitespace-nowrap">
                View All Trainers <FaArrowRight className="text-xs" />
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((trainer, i) => {
            const color = CARD_COLORS[i % CARD_COLORS.length]
            const num = String(i + 1).padStart(2, '0')

            if (!trainer) {
              return (
                <div key={i} className="rounded-2xl overflow-hidden bg-dark-200 border border-dark-400 animate-pulse">
                  <div className="h-64 bg-dark-300" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-dark-300 rounded w-3/4" />
                    <div className="h-3 bg-dark-300 rounded w-1/2" />
                    <div className="h-3 bg-dark-300 rounded w-full" />
                  </div>
                </div>
              )
            }

            const avgRating = trainer.reviews?.length
              ? (trainer.reviews.reduce((s, r) => s + r.rating, 0) / trainer.reviews.length).toFixed(1)
              : trainer.rating?.toFixed(1) ?? null

            const social = trainer.socialLinks || {}

            return (
              <motion.div key={trainer._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative rounded-2xl overflow-hidden bg-dark-200 border border-dark-400 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer">

                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  {trainer.image ? (
                    <img src={trainer.image} alt={trainer.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl font-black text-white/20"
                      style={{ background: `linear-gradient(135deg, ${color}22, ${color}08)`, fontFamily: 'Oswald' }}>
                      {trainer.name?.charAt(0)}
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-200 via-black/20 to-transparent" />

                  {/* Number badge */}
                  <div className="absolute top-3 left-3 text-4xl font-black leading-none text-white/10 select-none pointer-events-none"
                    style={{ fontFamily: 'Oswald' }}>
                    {num}
                  </div>

                  {/* Rating */}
                  {avgRating && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <FaStar className="text-yellow-400 text-[10px]" />
                      <span className="text-yellow-400 text-xs font-bold">{avgRating}</span>
                    </div>
                  )}

                  {/* Social icons on hover */}
                  {(social.instagram || social.facebook || social.twitter) && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2.5 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      {social.instagram && (
                        <a href={social.instagram} target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all duration-200">
                          <FaInstagram className="text-xs" />
                        </a>
                      )}
                      {social.facebook && (
                        <a href={social.facebook} target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all duration-200">
                          <FaFacebook className="text-xs" />
                        </a>
                      )}
                      {social.twitter && (
                        <a href={social.twitter} target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all duration-200">
                          <FaTwitter className="text-xs" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-white font-black text-base leading-tight" style={{ fontFamily: 'Oswald' }}>{trainer.name}</h3>
                  </div>
                  <p className="text-sm font-semibold mb-3" style={{ color }}>{trainer.speciality}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-dark-400">
                    <div className="text-xs text-gray-500">
                      {trainer.experience != null && (
                        <><span className="text-gray-300 font-medium">{trainer.experience} {trainer.experience === 1 ? 'Year' : 'Years'}</span> exp</>
                      )}
                    </div>
                    {trainer.certifications?.[0] && (
                      <div className="text-xs px-2.5 py-1 rounded-lg font-medium"
                        style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}25` }}>
                        {trainer.certifications[0]}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {!loading && trainers.length === 0 && (
          <p className="text-center text-gray-500 py-12">No trainers available yet.</p>
        )}
      </div>
    </section>
  )
}
