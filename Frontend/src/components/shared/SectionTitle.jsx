import { motion } from 'framer-motion'

export default function SectionTitle({ badge, title, highlight, subtitle, center = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`mb-16 ${center ? 'text-center' : ''}`}
    >
      {badge && (
        <div className={`inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4 ${center ? 'mx-auto' : ''}`}>
          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
          <span className="text-primary text-xs font-semibold uppercase tracking-widest">{badge}</span>
        </div>
      )}
      <h2
        className="text-4xl md:text-5xl font-black text-white mb-4"
        style={{ fontFamily: 'Oswald, sans-serif' }}
      >
        {title}{' '}
        {highlight && (
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {highlight}
          </span>
        )}
      </h2>
      {subtitle && (
        <p className={`text-gray-400 text-lg leading-relaxed max-w-2xl ${center ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
