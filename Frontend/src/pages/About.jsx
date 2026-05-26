import { motion } from 'framer-motion'
import { FaCheck, FaTrophy, FaHeart, FaUsers, FaDumbbell } from 'react-icons/fa'
import AnimatedSection from '../components/shared/AnimatedSection'
import StatsCounter from '../components/home/StatsCounter'
import CallToAction from '../components/home/CallToAction'
import PageHero from '../components/shared/PageHero'
import { useSiteContent } from '../context/SiteContentContext'

const VALUE_ICONS = [FaTrophy, FaHeart, FaUsers, FaDumbbell]

const ABOUT_DEFAULTS = {
  heroBadge: 'Our Story',
  heroTitle: 'ABOUT',
  heroHighlight: 'POWERZONE',
  heroSubtitle: 'More than a gym — we are a movement. A community united by the pursuit of strength, health, and transformation.',
  heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
  storyHeading: 'FROM SMALL BEGINNINGS TO',
  storyHighlight: 'GREAT HEIGHTS',
  storyP1: 'PowerZone was founded in 2014 with a simple vision: to create a fitness space where everyone—beginners and athletes alike—could feel welcomed, motivated, and empowered.',
  storyP2: "What started as a small gym with 20 machines has grown into the city's premier fitness destination, serving over 5,000 members with 50+ certified trainers and 100+ programs.",
  storyImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=700&q=80',
  storyBadge: '10+',
  storyBadgeLabel: 'Years of Excellence',
  certifications: [
    'Certified by National Fitness Association',
    'ISO 9001:2015 Certified Facility',
    'Award-winning training methodology',
    'Science-backed nutrition programs',
  ],
  values: [
    { title: 'Excellence', desc: 'We push boundaries and set the highest standards in fitness training.', color: '#f59e0b' },
    { title: 'Passion', desc: "We're driven by love for fitness and commitment to our members' wellbeing.", color: '#e63946' },
    { title: 'Community', desc: 'A supportive family that celebrates every milestone together.', color: '#4361ee' },
    { title: 'Dedication', desc: 'Unwavering commitment to helping every member achieve their goals.', color: '#52b788' },
  ],
  milestones: [
    { year: '2014', title: 'Founded', desc: 'Opened our first gym with 20 machines and 2 trainers.' },
    { year: '2016', title: 'Expansion', desc: 'Expanded to 5000 sq ft facility with 500+ members.' },
    { year: '2019', title: 'Awards', desc: 'Voted Best Gym in the city for 3 consecutive years.' },
    { year: '2022', title: 'Digital Launch', desc: 'Launched online coaching and nutrition programs.' },
    { year: '2024', title: 'Today', desc: '5000+ members, 50+ trainers, 100+ programs.' },
  ],
}

export default function About() {
  const saved = useSiteContent('page_about')
  const c = saved ? {
    ...ABOUT_DEFAULTS, ...saved,
    certifications: saved.certifications?.length ? saved.certifications : ABOUT_DEFAULTS.certifications,
    values: saved.values?.length ? saved.values.map((v, i) => ({ ...ABOUT_DEFAULTS.values[i], ...v })) : ABOUT_DEFAULTS.values,
    milestones: saved.milestones?.length ? saved.milestones : ABOUT_DEFAULTS.milestones,
  } : ABOUT_DEFAULTS
  return (
    <>
      <PageHero badge={c.heroBadge} title={c.heroTitle} highlight={c.heroHighlight} subtitle={c.heroSubtitle} image={c.heroImage} />

      {/* Story */}
      <section className="py-24 px-4 md:px-8 lg:px-16 bg-dark-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="right">
              <div className="relative">
                <img src={c.storyImage} alt="Gym" className="w-full rounded-2xl object-cover h-96 shadow-2xl shadow-black/50" />
                <div className="absolute -bottom-5 -right-5 bg-dark-200 border border-primary/30 rounded-2xl p-5 shadow-xl">
                  <div className="text-5xl font-black text-primary" style={{ fontFamily: 'Oswald' }}>{c.storyBadge}</div>
                  <div className="text-white font-medium text-sm">{c.storyBadgeLabel}</div>
                </div>
                <div className="absolute -top-3 -left-3 w-20 h-20 border-t-[3px] border-l-[3px] border-primary rounded-tl-2xl" />
              </div>
            </AnimatedSection>
            <AnimatedSection direction="left">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-5">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span className="text-primary text-xs font-bold uppercase tracking-widest">Our Story</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight" style={{ fontFamily: 'Oswald' }}>
                {c.storyHeading}{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{c.storyHighlight}</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">{c.storyP1}</p>
              <p className="text-gray-400 leading-relaxed mb-8">{c.storyP2}</p>
              <ul className="space-y-3">
                {c.certifications.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300 text-sm">
                    <div className="w-5 h-5 bg-primary/15 border border-primary/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-primary text-[9px]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4 md:px-8 lg:px-16 bg-dark">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex gap-6 items-start mb-14">
            <div className="w-1 self-stretch bg-gradient-to-b from-primary to-transparent rounded-full flex-shrink-0 min-h-[70px]" />
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-3">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span className="text-primary text-xs font-bold uppercase tracking-widest">Our Values</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'Oswald' }}>
                What Drives <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Us Forward</span>
              </h2>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {c.values.map((v, i) => {
              const Icon = VALUE_ICONS[i]
              return (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-dark-400 hover:border-primary/30 p-6 text-center cursor-default transition-all duration-300 hover:-translate-y-2"
                style={{ background: `linear-gradient(135deg, ${v.color}06 0%, #0a0a0a 60%)` }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: `${v.color}18`, border: `1px solid ${v.color}30` }}>
                  <Icon style={{ color: v.color }} className="text-2xl" />
                </div>
                <h3 className="text-white font-black text-lg mb-2" style={{ fontFamily: 'Oswald' }}>{v.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-4 md:px-8 lg:px-16 bg-dark-100">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span className="text-primary text-xs font-bold uppercase tracking-widest">Our Journey</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'Oswald' }}>
              The PowerZone <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Timeline</span>
            </h2>
          </motion.div>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-primary -translate-x-1/2" />
            {c.milestones.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative flex items-center mb-10 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                <div className={`w-5/12 ${i % 2 === 0 ? 'text-right pr-8' : 'pl-8'}`}>
                  <div className="bg-dark-200 border border-dark-400 hover:border-primary/30 rounded-2xl p-5 transition-all duration-300">
                    <div className="text-primary font-black text-2xl mb-1" style={{ fontFamily: 'Oswald' }}>{m.year}</div>
                    <div className="text-white font-bold text-sm mb-1">{m.title}</div>
                    <div className="text-gray-400 text-xs leading-relaxed">{m.desc}</div>
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full border-4 border-dark-100 z-10 shadow-lg shadow-primary/30" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <StatsCounter />
      <CallToAction />
    </>
  )
}
