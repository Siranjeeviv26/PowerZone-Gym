import { useInView } from 'react-intersection-observer'
import CountUp from 'react-countup'
import { motion } from 'framer-motion'
import { useSiteContent } from '../../context/SiteContentContext'

const STATS_DEFAULTS = {
  bgImage: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1920&q=80',
  stats: [
    { value: 5000, suffix: '+', label: 'Active Members', desc: 'Growing community' },
    { value: 50, suffix: '+', label: 'Expert Trainers', desc: 'Certified professionals' },
    { value: 100, suffix: '+', label: 'Programs', desc: 'For every goal' },
    { value: 10, suffix: '+', label: 'Years of Excellence', desc: 'Proven track record' },
  ],
}

export default function StatsCounter() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 })
  const saved = useSiteContent('stats')
  const c = saved
    ? { ...STATS_DEFAULTS, ...saved, stats: saved.stats?.length ? saved.stats : STATS_DEFAULTS.stats }
    : STATS_DEFAULTS

  return (
    <section className="relative overflow-hidden py-0">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={c.bgImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-dark/92" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/8 to-transparent" />
      </div>

      {/* Top red edge */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {c.stats.map((stat, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="relative group py-14 px-8 text-center">
              {/* Vertical separator */}
              {i < c.stats.length - 1 && (
                <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block" />
              )}
              {i === 1 && (
                <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent lg:hidden" />
              )}

              {/* Number */}
              <div className="relative mb-2">
                <div className="text-7xl md:text-8xl font-black leading-none"
                  style={{ fontFamily: 'Oswald' }}>
                  <span className="bg-gradient-to-b from-white to-primary bg-clip-text text-transparent">
                    {inView ? <CountUp end={stat.value} duration={2.5} delay={i * 0.15} /> : 0}
                  </span>
                  <span className="text-primary text-5xl md:text-6xl">{stat.suffix}</span>
                </div>
              </div>

              {/* Label */}
              <div className="text-white font-bold text-base mb-1">{stat.label}</div>
              <div className="text-gray-500 text-xs tracking-wide">{stat.desc}</div>

              {/* Hover bottom glow */}
              <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary/0 group-hover:bg-primary/40 transition-all duration-500 rounded-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
