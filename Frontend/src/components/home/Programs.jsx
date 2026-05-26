import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaClock, FaSignal } from 'react-icons/fa'
import { useSiteContent } from '../../context/SiteContentContext'

const PROGRAMS_DEFAULTS = {
  sectionTag: 'Our Programs',
  heading: 'Choose Your',
  headingHighlight: 'Training Path',
  programs: [
    { title: 'Strength Training', category: 'BUILD MUSCLE', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80', duration: '60 min', level: 'All Levels', color: '#e63946', desc: 'Build raw strength and muscle mass with progressive overload programs designed by elite coaches.', num: '01' },
    { title: 'HIIT Cardio', category: 'BURN FAT', image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=600&q=80', duration: '45 min', level: 'Intermediate', color: '#f4a261', desc: 'High-intensity intervals for maximum calorie burn and cardiovascular health.', num: '02' },
    { title: 'Yoga & Flexibility', category: 'MIND & BODY', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80', duration: '75 min', level: 'Beginner', color: '#52b788', desc: 'Improve flexibility, balance and mental clarity through guided yoga practice.', num: '03' },
    { title: 'CrossFit', category: 'FUNCTIONAL', image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&q=80', duration: '50 min', level: 'Advanced', color: '#4361ee', desc: 'Constantly varied functional movements to build total body fitness.', num: '04' },
    { title: 'Boxing', category: 'COMBAT', image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&q=80', duration: '60 min', level: 'All Levels', color: '#f72585', desc: 'Learn boxing fundamentals while burning calories and relieving stress.', num: '05' },
    { title: 'Zumba', category: 'DANCE FITNESS', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80', duration: '55 min', level: 'Beginner', color: '#fb8500', desc: 'Dance-based fitness program combining Latin rhythms with easy-to-follow moves.', num: '06' },
  ],
}

export default function Programs() {
  const saved = useSiteContent('programs')
  const c = saved
    ? { ...PROGRAMS_DEFAULTS, ...saved, programs: saved.programs?.length ? saved.programs.map((p, i) => ({ ...PROGRAMS_DEFAULTS.programs[i], ...p })) : PROGRAMS_DEFAULTS.programs }
    : PROGRAMS_DEFAULTS
  return (
    <section className="py-24 px-4 md:px-8 lg:px-16 bg-dark relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">

        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span className="text-primary text-xs font-bold uppercase tracking-widest">{c.sectionTag}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'Oswald' }}>
              {c.heading}{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{c.headingHighlight}</span>
            </h2>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <Link to="/workouts">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 border border-primary/30 hover:border-primary text-primary hover:text-white hover:bg-primary font-bold px-6 py-3 rounded-xl transition-all duration-300 text-sm whitespace-nowrap">
                View All Programs <FaArrowRight className="text-xs" />
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Programs grid — first card is large (featured) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {c.programs.map((p, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative rounded-2xl overflow-hidden cursor-pointer">

              {/* Image */}
              <div className="relative overflow-hidden h-56">
                <img src={p.image} alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(to top, ${p.color}60, transparent 60%)` }} />

                {/* Number watermark */}
                <div className="absolute top-4 left-4 text-5xl font-black leading-none opacity-20 text-white pointer-events-none select-none"
                  style={{ fontFamily: 'Oswald' }}>
                  {p.num}
                </div>

                {/* Category badge */}
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg text-[10px] font-black text-white tracking-wider"
                  style={{ backgroundColor: `${p.color}cc` }}>
                  {p.category}
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white font-black text-xl mb-1" style={{ fontFamily: 'Oswald' }}>{p.title}</h3>
                  <p className="text-gray-300 text-xs leading-relaxed mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {p.desc}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-gray-300">
                        <FaClock className="text-[10px]" style={{ color: p.color }} /> {p.duration}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-300">
                        <FaSignal className="text-[10px]" style={{ color: p.color }} /> {p.level}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 flex-shrink-0"
                      style={{ backgroundColor: p.color }}>
                      <FaArrowRight className="text-white text-xs" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
