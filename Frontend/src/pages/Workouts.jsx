import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaClock, FaFire, FaUsers, FaDumbbell, FaSignal } from 'react-icons/fa'
import PageHero from '../components/shared/PageHero'
import api from '../utils/api'
import { useSiteContent } from '../context/SiteContentContext'

const WORKOUTS_DEFAULTS = {
  heroBadge: 'Training Programs',
  heroTitle: 'WORKOUT',
  heroHighlight: 'PROGRAMS',
  heroSubtitle: 'Discover our comprehensive library of workout programs designed by certified trainers.',
  heroImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1920&q=80',
}

const categories = ['All', 'Strength', 'Cardio', 'HIIT', 'Flexibility', 'Combat', 'Dance']
const levelColors = { Beginner: '#22c55e', Intermediate: '#f59e0b', Advanced: '#ef4444', 'All Levels': '#6366f1' }

export default function Workouts() {
  const saved = useSiteContent('page_workouts')
  const c = saved ? { ...WORKOUTS_DEFAULTS, ...saved } : WORKOUTS_DEFAULTS
  const [active, setActive] = useState('All')
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/workouts').then(({ data }) => setWorkouts(data.workouts || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = active === 'All' ? workouts : workouts.filter((w) => w.category === active)

  return (
    <>
      <PageHero badge={c.heroBadge} title={c.heroTitle} highlight={c.heroHighlight} subtitle={c.heroSubtitle} image={c.heroImage} />

      <section className="py-24 px-4 md:px-8 lg:px-16 bg-dark">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((cat) => (
              <motion.button key={cat} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setActive(cat)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active === cat
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-dark-200 text-gray-400 hover:bg-dark-300 hover:text-white border border-dark-400'
                }`}>
                {cat}
              </motion.button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0,1,2,3,4,5].map((i) => (
                <div key={i} className="rounded-2xl bg-dark-200 border border-dark-400 overflow-hidden animate-pulse">
                  <div className="h-52 bg-dark-400" />
                  <div className="p-5 space-y-2">
                    <div className="h-5 bg-dark-400 rounded w-3/4" />
                    <div className="h-3 bg-dark-400 rounded w-full" />
                    <div className="h-3 bg-dark-400 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <FaDumbbell className="text-5xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">{workouts.length === 0 ? 'No workout programs available yet.' : `No ${active} workouts found.`}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((workout, i) => (
                <motion.div key={workout._id} layout
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group relative rounded-2xl overflow-hidden bg-dark-200 border border-dark-400 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer">
                  <div className="relative overflow-hidden h-52">
                    <img src={workout.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80'} alt={workout.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="text-xs font-bold bg-dark-200/90 backdrop-blur-sm text-gray-300 px-2.5 py-1 rounded-lg">{workout.category}</span>
                      {workout.level && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg text-white"
                          style={{ backgroundColor: `${levelColors[workout.level]}30`, border: `1px solid ${levelColors[workout.level]}60`, color: levelColors[workout.level] }}>
                          {workout.level}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-white font-black text-lg mb-1.5" style={{ fontFamily: 'Oswald' }}>{workout.title}</h3>
                    {workout.description && <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">{workout.description}</p>}
                    {workout.trainer && (
                      <p className="text-gray-500 text-xs mb-3">Coach: <span className="text-primary font-medium">{workout.trainer?.name || workout.trainer}</span></p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-dark-400">
                      {workout.duration && <span className="flex items-center gap-1"><FaClock className="text-primary" />{workout.duration} min</span>}
                      {workout.caloriesBurn && <span className="flex items-center gap-1"><FaFire className="text-orange-400" />{workout.caloriesBurn} cal</span>}
                      {workout.maxParticipants && <span className="flex items-center gap-1"><FaUsers className="text-blue-400" />Max {workout.maxParticipants}</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
