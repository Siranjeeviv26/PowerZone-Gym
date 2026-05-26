import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaAppleAlt, FaCheck, FaChevronDown } from 'react-icons/fa'
import PageHero from '../components/shared/PageHero'
import api from '../utils/api'
import { useSiteContent } from '../context/SiteContentContext'

const DIETPLANS_DEFAULTS = {
  heroBadge: 'Nutrition',
  heroTitle: 'DIET',
  heroHighlight: 'PLANS',
  heroSubtitle: 'Science-backed nutrition plans crafted by certified dietitians for your specific goals.',
  heroImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1920&q=80',
}

const goals = ['All', 'Weight Loss', 'Muscle Gain', 'Maintenance', 'Vegan']
const goalColors = { 'Weight Loss': '#ef4444', 'Muscle Gain': '#e63946', 'Maintenance': '#22c55e', 'Vegan': '#16a34a' }
const macroColors = { protein: '#e63946', carbs: '#f4a261', fat: '#4361ee' }
const PLACEHOLDER = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&q=80'

export default function DietPlans() {
  const saved = useSiteContent('page_dietplans')
  const c = saved ? { ...DIETPLANS_DEFAULTS, ...saved } : DIETPLANS_DEFAULTS
  const [active, setActive] = useState('All')
  const [selected, setSelected] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/diet').then(({ data }) => setPlans(data.plans || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = active === 'All' ? plans : plans.filter((p) => p.goal === active)

  return (
    <>
      <PageHero badge={c.heroBadge} title={c.heroTitle} highlight={c.heroHighlight} subtitle={c.heroSubtitle} image={c.heroImage} />

      <section className="py-24 px-4 md:px-8 lg:px-16 bg-dark">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {goals.map((g) => (
              <motion.button key={g} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setActive(g)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  active === g ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-dark-200 text-gray-400 hover:bg-dark-300 hover:text-white border border-dark-400'
                }`}>
                {g}
              </motion.button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[0,1,2,3].map((i) => (
                <div key={i} className="rounded-2xl bg-dark-200 border border-dark-400 overflow-hidden animate-pulse">
                  <div className="h-52 bg-dark-400" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-dark-400 rounded w-1/2" />
                    <div className="h-3 bg-dark-400 rounded w-full" />
                    <div className="grid grid-cols-4 gap-3">{[0,1,2,3].map((j) => <div key={j} className="h-12 bg-dark-400 rounded-xl" />)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <FaAppleAlt className="text-5xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">{plans.length === 0 ? 'No diet plans available yet.' : `No ${active} plans found.`}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((plan, i) => {
                const color = goalColors[plan.goal] || '#e63946'
                const isOpen = selected?._id === plan._id
                return (
                  <motion.div key={plan._id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="group rounded-2xl overflow-hidden bg-dark-200 border border-dark-400 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                    onClick={() => setSelected(isOpen ? null : plan)}>
                    <div className="relative h-52 overflow-hidden">
                      <img src={plan.image || PLACEHOLDER} alt={plan.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { e.target.src = PLACEHOLDER }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="text-xs font-black px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: `${color}cc` }}>{plan.goal}</span>
                      </div>
                      {plan.duration && (
                        <div className="absolute bottom-3 right-3 text-xs text-white bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg font-medium">{plan.duration}</div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-white font-black text-lg leading-tight" style={{ fontFamily: 'Oswald' }}>{plan.title}</h3>
                        <FaChevronDown className={`text-gray-500 text-xs mt-1 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                      {plan.description && <p className="text-gray-400 text-sm mb-4 leading-relaxed">{plan.description}</p>}

                      <div className="grid grid-cols-4 gap-2 mb-1">
                        {[
                          { label: 'Calories', value: plan.totalCalories ? `${plan.totalCalories}` : '—', color: '#fff' },
                          { label: 'Protein', value: plan.totalProtein ? `${plan.totalProtein}g` : '—', color: macroColors.protein },
                          { label: 'Carbs', value: plan.totalCarbs ? `${plan.totalCarbs}g` : '—', color: macroColors.carbs },
                          { label: 'Fat', value: plan.totalFat ? `${plan.totalFat}g` : '—', color: macroColors.fat },
                        ].map((m) => (
                          <div key={m.label} className="bg-dark-300 rounded-xl p-2.5 text-center border border-dark-500">
                            <div className="font-black text-sm" style={{ color: m.color }}>{m.value}</div>
                            <div className="text-gray-500 text-[10px] mt-0.5">{m.label}</div>
                          </div>
                        ))}
                      </div>

                      <AnimatePresence>
                        {isOpen && plan.meals?.length > 0 && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-dark-400 mt-4 pt-4">
                            <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                              <FaAppleAlt className="text-primary text-xs" /> Sample Daily Meals
                            </h4>
                            <ul className="space-y-2">
                              {plan.meals.map((meal, j) => (
                                <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                                  <FaCheck className="text-primary text-[10px] flex-shrink-0" />
                                  {meal.name || meal}
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
