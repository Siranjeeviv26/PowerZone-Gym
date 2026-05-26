import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaPlay, FaArrowRight, FaFire, FaDumbbell, FaUsers } from 'react-icons/fa'
import { useState } from 'react'
import { useSiteContent } from '../../context/SiteContentContext'

const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  duration: 3 + Math.random() * 4,
  delay: Math.random() * 5,
}))

const HERO_DEFAULTS = {
  badge: '#1 Rated Fitness Center In The City',
  headline1: 'FORGE', headline2: 'YOUR', headline3: 'BEST SELF',
  subtitle: 'Transform your body and mind with world-class equipment, expert trainers, and scientifically crafted programs. Your journey starts today.',
  cta1Text: 'START FREE TRIAL', cta2Text: 'Watch Tour',
  bgImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
  sideImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=700&q=80',
  videoUrl: 'https://www.youtube.com/embed/2pLT-olgUJs?autoplay=1&rel=0&modestbranding=1',
  stats: [
    { value: '5K+', label: 'Active Members' },
    { value: '50+', label: 'Expert Trainers' },
    { value: '100+', label: 'Programs' },
    { value: '10+', label: 'Years' },
  ],
}

export default function Hero() {
  const [videoOpen, setVideoOpen] = useState(false)
  const saved = useSiteContent('hero')
  const c = saved ? { ...HERO_DEFAULTS, ...saved, stats: saved.stats?.length ? saved.stats : HERO_DEFAULTS.stats } : HERO_DEFAULTS

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={c.bgImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/98 via-black/80 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-black/20" />
      </div>

      {/* Decorative oversized text */}
      <div className="absolute bottom-0 left-0 pointer-events-none select-none z-0 overflow-hidden">
        <div className="text-[30vw] font-black leading-none opacity-[0.025] text-white" style={{ fontFamily: 'Oswald' }}>
          PZ
        </div>
      </div>

      {/* Left red accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary to-transparent z-10" />

      {/* Particles */}
      <div className="absolute inset-0 z-1 pointer-events-none">
        {particles.map((p) => (
          <motion.div key={p.id}
            className="absolute w-1 h-1 bg-primary/50 rounded-full"
            style={{ left: p.left, top: p.top }}
            animate={{ y: [0, -40, 0], opacity: [0.1, 0.8, 0.1] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center pt-24 pb-20">

          {/* LEFT */}
          <div>
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 rounded-full px-4 py-2 mb-7">
              <FaFire className="text-primary text-xs animate-pulse" />
              <span className="text-orange-300 text-xs font-bold tracking-widest uppercase">{c.badge}</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <h1 className="leading-[0.88] mb-7" style={{ fontFamily: 'Oswald' }}>
                <span className="block text-[clamp(3.5rem,7.5vw,6.5rem)] font-black text-white tracking-tight">{c.headline1}</span>
                <span className="block text-[clamp(3.5rem,7.5vw,6.5rem)] font-black tracking-tight"
                  style={{ WebkitTextStroke: '2px #e63946', color: 'transparent' }}>
                  {c.headline2}
                </span>
                <span className="block text-[clamp(3.5rem,7.5vw,6.5rem)] font-black text-primary tracking-tight">{c.headline3}</span>
              </h1>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-gray-300 text-lg mb-9 max-w-lg leading-relaxed">
              {c.subtitle}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
              className="flex flex-wrap gap-3 mb-12">
              <Link to="/membership">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="group relative overflow-hidden h-14 flex items-center gap-2 bg-primary text-white font-black px-8 rounded-xl text-sm tracking-wider shadow-2xl shadow-primary/30 transition-all">
                  <span className="relative z-10 flex items-center gap-2">
                    {c.cta1Text} <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                </motion.button>
              </Link>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => setVideoOpen(true)}
                className="h-14 flex items-center gap-3 border border-white/15 hover:border-primary/50 text-white font-semibold px-6 rounded-xl transition-all duration-300 text-sm backdrop-blur-sm">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40 flex-shrink-0">
                  <FaPlay className="text-xs ml-0.5 text-white" />
                </div>
                {c.cta2Text}
              </motion.button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
              className="flex gap-8 pt-6 border-t border-white/10">
              {c.stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-black text-primary" style={{ fontFamily: 'Oswald' }}>{s.value}</div>
                  <div className="text-gray-500 text-[11px] tracking-wide mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT */}
          <div className="hidden lg:block relative">
            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.4 }}
              className="relative">
              {/* Main image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
                <img src={c.sideImage} alt="Training" className="w-full h-[530px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* Corner accents */}
              <div className="absolute -top-3 -left-3 w-20 h-20 border-t-[3px] border-l-[3px] border-primary rounded-tl-2xl" />
              <div className="absolute -bottom-3 -right-3 w-20 h-20 border-b-[3px] border-r-[3px] border-primary rounded-br-2xl" />

              {/* Floating members card */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-10 top-1/3 bg-dark-100/95 backdrop-blur-md border border-primary/25 rounded-2xl p-4 shadow-2xl shadow-black/50">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaUsers className="text-primary text-lg" />
                  </div>
                  <div>
                    <div className="text-white font-black text-xl leading-none" style={{ fontFamily: 'Oswald' }}>5,000+</div>
                    <div className="text-gray-400 text-xs mt-0.5">Active Members</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating elite badge */}
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -right-7 top-12 bg-primary rounded-2xl p-4 shadow-2xl shadow-primary/40">
                <div className="text-white text-center">
                  <FaDumbbell className="text-2xl mx-auto mb-1.5" />
                  <div className="text-[11px] font-black tracking-wider">ELITE GYM</div>
                </div>
              </motion.div>

              {/* Floating new members badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-dark-100/95 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 shadow-xl whitespace-nowrap">
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2">
                    {['A', 'B', 'C', 'D'].map((l) => (
                      <div key={l} className="w-6 h-6 bg-gradient-to-br from-primary to-orange-400 rounded-full border-2 border-dark-100 flex items-center justify-center text-white text-[8px] font-black">{l}</div>
                    ))}
                  </div>
                  <span className="text-gray-300 text-xs font-medium">+500 joined this month</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-gray-600 text-[10px] tracking-widest uppercase">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 border border-white/20 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-primary rounded-full" />
        </motion.div>
      </motion.div>

      {/* Video Modal */}
      {videoOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setVideoOpen(false)}>
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}
            className="w-full max-w-4xl relative rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition-colors">
              ×
            </button>
            <div className="aspect-video">
              <iframe
                src={c.videoUrl || 'https://www.youtube.com/embed/2pLT-olgUJs?autoplay=1&rel=0&modestbranding=1'}
                title="PowerZone Gym Tour"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
