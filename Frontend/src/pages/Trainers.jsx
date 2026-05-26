import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaInstagram, FaLinkedin, FaTwitter, FaStar, FaUsers, FaTrophy, FaDumbbell } from 'react-icons/fa'
import CallToAction from '../components/home/CallToAction'
import PageHero from '../components/shared/PageHero'
import api from '../utils/api'
import { useSiteContent } from '../context/SiteContentContext'

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80'

const TRAINERS_DEFAULTS = {
  heroBadge: 'Expert Team',
  heroTitle: 'MEET OUR',
  heroHighlight: 'TRAINERS',
  heroSubtitle: 'Certified professionals dedicated to your transformation journey.',
  heroImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1920&q=80',
}

function TrainerCard({ trainer, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="group relative rounded-2xl overflow-hidden bg-dark-200 border border-dark-400 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer"
    >
      <div className="relative overflow-hidden h-64">
        <img src={trainer.image || PLACEHOLDER_IMG} alt={trainer.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => { e.target.src = PLACEHOLDER_IMG }} />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-200 via-black/20 to-transparent" />

        {trainer.averageRating > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
            <FaStar className="text-yellow-400 text-[10px]" />
            <span className="text-yellow-400 text-xs font-bold">{trainer.averageRating.toFixed(1)}</span>
            {trainer.reviews?.length > 0 && (
              <span className="text-gray-400 text-[10px]">({trainer.reviews.length})</span>
            )}
          </div>
        )}

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2.5 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          {trainer.socialLinks?.instagram && (
            <a href={trainer.socialLinks.instagram} className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all">
              <FaInstagram className="text-xs" />
            </a>
          )}
          {trainer.socialLinks?.linkedin && (
            <a href={trainer.socialLinks.linkedin} className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all">
              <FaLinkedin className="text-xs" />
            </a>
          )}
          {trainer.socialLinks?.twitter && (
            <a href={trainer.socialLinks.twitter} className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all">
              <FaTwitter className="text-xs" />
            </a>
          )}
          {!trainer.socialLinks?.instagram && !trainer.socialLinks?.linkedin && !trainer.socialLinks?.twitter && (
            [FaInstagram, FaLinkedin, FaTwitter].map((Icon, j) => (
              <span key={j} className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white">
                <Icon className="text-xs" />
              </span>
            ))
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-white font-black text-base mb-0.5" style={{ fontFamily: 'Oswald' }}>{trainer.name}</h3>
        <p className="text-primary text-sm font-semibold mb-2">{trainer.speciality}</p>
        {trainer.bio && <p className="text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed">{trainer.bio}</p>}
        <div className="flex items-center justify-between pt-3 border-t border-dark-400">
          <div className="flex gap-3 text-xs text-gray-500">
            {trainer.experience > 0 && (
              <span className="flex items-center gap-1"><FaTrophy className="text-yellow-500 text-[10px]" />{trainer.experience} yrs</span>
            )}
            {trainer.totalMembers > 0 && (
              <span className="flex items-center gap-1"><FaUsers className="text-primary text-[10px]" />{trainer.totalMembers}</span>
            )}
          </div>
          {trainer.certifications?.length > 0 && (
            <div className="flex gap-1">
              {trainer.certifications.slice(0, 2).map((cert) => (
                <span key={cert} className="text-[10px] bg-dark-400 text-gray-400 px-2 py-0.5 rounded-full">{cert}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function Trainers() {
  const saved = useSiteContent('page_trainers')
  const c = saved ? { ...TRAINERS_DEFAULTS, ...saved } : TRAINERS_DEFAULTS
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/trainers').then(({ data }) => setTrainers(data.trainers || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHero badge={c.heroBadge} title={c.heroTitle} highlight={c.heroHighlight} subtitle={c.heroSubtitle} image={c.heroImage} />

      <section className="py-24 px-4 md:px-8 lg:px-16 bg-dark-100">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex gap-6 items-start mb-14">
            <div className="w-1 self-stretch bg-gradient-to-b from-primary to-transparent rounded-full flex-shrink-0 min-h-[70px]" />
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-3">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span className="text-primary text-xs font-bold uppercase tracking-widest">Our Team</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'Oswald' }}>
                World-Class <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Coaches</span>
              </h2>
              <p className="text-gray-400 mt-2 max-w-xl">Each trainer brings unique expertise and passion to help you achieve extraordinary results.</p>
            </div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[0,1,2,3,4,5,6,7].map((i) => (
                <div key={i} className="rounded-2xl bg-dark-200 border border-dark-400 overflow-hidden animate-pulse">
                  <div className="h-64 bg-dark-400" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-dark-400 rounded w-3/4" />
                    <div className="h-3 bg-dark-400 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : trainers.length === 0 ? (
            <div className="text-center py-20">
              <FaDumbbell className="text-5xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No trainers available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {trainers.map((trainer, i) => <TrainerCard key={trainer._id} trainer={trainer} index={i} />)}
            </div>
          )}
        </div>
      </section>

      <CallToAction />
    </>
  )
}
