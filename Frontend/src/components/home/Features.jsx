import { motion } from 'framer-motion'
import {
  FaDumbbell, FaHeartbeat, FaAppleAlt, FaUsers,
  FaStar, FaBolt, FaShieldAlt, FaClock
} from 'react-icons/fa'
import { useSiteContent } from '../../context/SiteContentContext'

const FEATURE_ICONS = [FaDumbbell, FaHeartbeat, FaAppleAlt, FaUsers, FaStar, FaBolt, FaShieldAlt, FaClock]

const FEATURES_DEFAULTS = {
  sectionTag: 'Why Choose Us',
  heading: 'Everything You Need to',
  headingHighlight: 'Succeed',
  subheading: 'World-class facilities combined with expert guidance to help you reach your fitness goals faster.',
  features: [
    { title: 'Premium Equipment', description: 'State-of-the-art machines and free weights from top brands, maintained to perfection.', color: '#e63946', num: '01' },
    { title: 'Cardio Zone', description: 'Dedicated cardio area with treadmills, bikes, ellipticals and more for heart-pumping workouts.', color: '#f4a261', num: '02' },
    { title: 'Nutrition Guidance', description: 'Personalized diet plans designed by certified nutritionists to fuel your transformation.', color: '#52b788', num: '03' },
    { title: 'Group Classes', description: 'Energetic group sessions including HIIT, Yoga, Zumba, CrossFit and more — 50+ weekly.', color: '#4361ee', num: '04' },
    { title: 'Expert Trainers', description: 'Certified personal trainers with 5+ years of experience, dedicated to your goals.', color: '#f72585', num: '05' },
    { title: 'HIIT Programs', description: 'High-intensity interval training for maximum fat burn and endurance in minimum time.', color: '#a855f7', num: '06' },
    { title: 'Safe Environment', description: '24/7 security, sanitized equipment, and trained staff to ensure a safe workout space.', color: '#2dc653', num: '07' },
    { title: 'Flexible Hours', description: 'Open from 5 AM to 11 PM on weekdays. Weekend hours extended to accommodate your schedule.', color: '#fb8500', num: '08' },
  ],
}

export default function Features() {
  const saved = useSiteContent('features')
  const c = saved
    ? { ...FEATURES_DEFAULTS, ...saved, features: saved.features?.length ? saved.features.map((f, i) => ({ ...FEATURES_DEFAULTS.features[i], ...f })) : FEATURES_DEFAULTS.features }
    : FEATURES_DEFAULTS
  return (
    <section className="py-24 px-4 md:px-8 lg:px-16 bg-dark-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">

        {/* Section header — left aligned with red line */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex gap-8 items-start mb-16">
          <div className="w-1 self-stretch bg-gradient-to-b from-primary to-transparent rounded-full flex-shrink-0 min-h-[80px]" />
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span className="text-primary text-xs font-bold uppercase tracking-widest">{c.sectionTag}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-3" style={{ fontFamily: 'Oswald' }}>
              {c.heading}{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{c.headingHighlight}</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
              {c.subheading}
            </p>
          </div>
        </motion.div>

        {/* First 2: large spotlight cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {c.features.slice(0, 2).map((f, i) => {
            const Icon = FEATURE_ICONS[i]
            return (
              <motion.div key={f.num}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-dark-400 hover:border-primary/30 transition-all duration-300 p-7 cursor-default"
                style={{ background: `linear-gradient(135deg, ${f.color}08 0%, #0a0a0a 60%)` }}>
                <div className="absolute top-4 right-5 text-[5rem] font-black leading-none pointer-events-none select-none"
                  style={{ fontFamily: 'Oswald', color: `${f.color}10` }}>
                  {f.num}
                </div>
                <div className="relative z-10 flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                    <Icon style={{ color: f.color }} className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-xl mb-2" style={{ fontFamily: 'Oswald' }}>{f.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${f.color}, transparent)` }} />
              </motion.div>
            )
          })}
        </div>

        {/* Remaining 6: compact grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {c.features.slice(2).map((f, i) => {
            const Icon = FEATURE_ICONS[i + 2]
            return (
              <motion.div key={f.num}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}
                className="group relative overflow-hidden bg-dark-200 border border-dark-400 hover:border-primary/25 rounded-2xl p-5 cursor-default transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${f.color}18`, border: `1px solid ${f.color}28` }}>
                    <Icon style={{ color: f.color }} className="text-base" />
                  </div>
                  <span className="text-xs font-bold tabular-nums" style={{ color: `${f.color}60`, fontFamily: 'Oswald' }}>{f.num}</span>
                </div>
                <h3 className="text-white font-bold text-sm mb-1.5">{f.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
