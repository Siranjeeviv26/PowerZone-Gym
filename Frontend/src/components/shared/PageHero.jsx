import { motion } from 'framer-motion'

export default function PageHero({ badge, title, highlight, subtitle, image }) {
  return (
    <section className="relative pt-36 pb-24 overflow-hidden">
      <div className="absolute inset-0">
        <img src={image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/97 via-black/80 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />
      </div>
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary to-transparent z-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          {badge && (
            <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <span className="text-primary text-xs font-bold uppercase tracking-widest">{badge}</span>
            </div>
          )}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-5 leading-tight" style={{ fontFamily: 'Oswald' }}>
            {title}{' '}
            {highlight && (
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{highlight}</span>
            )}
          </h1>
          {subtitle && (
            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">{subtitle}</p>
          )}
        </motion.div>
      </div>
    </section>
  )
}
