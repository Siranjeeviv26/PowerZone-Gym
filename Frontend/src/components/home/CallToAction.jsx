import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaCheck, FaBolt } from 'react-icons/fa'
import { useSiteContent } from '../../context/SiteContentContext'

const CTA_DEFAULTS = {
  badge: 'Limited Time Offer',
  headline1: 'START YOUR',
  headline2: 'JOURNEY',
  headline3: 'FOR FREE TODAY',
  subtitle: 'Join PowerZone and experience 7 days of unlimited access to all facilities. No commitment required — just results.',
  bgImage: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=1920&q=80',
  trialDays: '7',
  trialPrice: '999',
  benefits: [
    'No joining fee for first month',
    'Access to all equipment & classes',
    'Free personal training session',
    'Customized diet plan included',
  ],
}

export default function CallToAction() {
  const saved = useSiteContent('cta')
  const c = saved
    ? { ...CTA_DEFAULTS, ...saved, benefits: saved.benefits?.length ? saved.benefits : CTA_DEFAULTS.benefits }
    : CTA_DEFAULTS
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={c.bgImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/98 via-dark/88 to-dark/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/50 to-transparent" />
      </div>

      {/* Top red line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent z-10" />

      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-56 h-56 bg-secondary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-primary text-sm font-bold tracking-widest uppercase">{c.badge}</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-[0.95]" style={{ fontFamily: 'Oswald' }}>
              {c.headline1}<br />
              {c.headline2}<br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{c.headline3}</span>
            </h2>

            <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-md">
              {c.subtitle}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden h-14 flex items-center gap-2 bg-primary text-white font-black px-8 rounded-xl text-sm tracking-wider shadow-2xl shadow-primary/30">
                  <span className="relative z-10 flex items-center gap-2">
                    Claim Free Trial <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                </motion.button>
              </Link>
              <Link to="/membership">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="h-14 flex items-center gap-2 border border-white/20 hover:border-primary/50 text-white font-bold px-8 rounded-xl transition-all duration-300 text-sm backdrop-blur-sm">
                  View Plans
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Right — benefits card */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}>
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-xl" />

              <div className="relative bg-dark-100/80 backdrop-blur-md border border-primary/20 rounded-3xl p-8 overflow-hidden">
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-3xl" />
                <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-primary/30 to-transparent" />

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                    <FaBolt className="text-primary text-xl" />
                  </div>
                  <div>
                    <div className="text-white font-black text-lg" style={{ fontFamily: 'Oswald' }}>FREE TRIAL INCLUDES</div>
                    <div className="text-gray-400 text-sm">Everything you need to get started</div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-4 mb-8">
                  {c.benefits.map((b, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-4 group">
                      <div className="w-8 h-8 bg-primary/15 border border-primary/25 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/25 transition-colors duration-200">
                        <FaCheck className="text-primary text-xs" />
                      </div>
                      <span className="text-gray-200 text-sm">{b}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Duration badge */}
                <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                  <div>
                    <div className="text-white font-black text-2xl" style={{ fontFamily: 'Oswald' }}>{c.trialDays} DAYS</div>
                    <div className="text-gray-400 text-xs">Completely free, no credit card</div>
                  </div>
                  <div className="text-right">
                    <div className="text-primary font-black text-xl" style={{ fontFamily: 'Oswald' }}>FREE</div>
                    <div className="text-gray-500 text-xs line-through">₹{c.trialPrice}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
