import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBullhorn, FaBolt } from 'react-icons/fa'
import Hero from '../components/home/Hero'
import Features from '../components/home/Features'
import StatsCounter from '../components/home/StatsCounter'
import Programs from '../components/home/Programs'
import TrainerPreview from '../components/home/TrainerPreview'
import Testimonials from '../components/home/Testimonials'
import CallToAction from '../components/home/CallToAction'
import api from '../utils/api'

export default function Home() {
  const [offers, setOffers] = useState([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    api.get('/offers')
      .then(({ data }) => setOffers((data.offers || []).filter((o) => o.isActive)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (offers.length <= 1) return
    const t = setInterval(() => setCurrent((c) => (c + 1) % offers.length), 5000)
    return () => clearInterval(t)
  }, [offers.length])

  const offer = offers[current] || null

  return (
    <>
      {/* Hero with offer badge overlaid inside */}
      <div className="relative">
        <Hero />

        {/* Offer floating badge — bottom-right inside the hero */}
        <AnimatePresence>
          {offer && (
            <motion.div
              key={offer._id}
              initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.6, delay: 1.2, type: 'spring', stiffness: 200 }}
              className="absolute top-28 right-4 md:right-16 lg:right-20 z-20"
            >
              <Link to="/membership">
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 3, 0, -3, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative group cursor-pointer"
                >
                  {/* Outer pulsing ring */}
                  <div className="absolute -inset-3 rounded-full border-2 border-yellow-400/40 animate-ping opacity-50 pointer-events-none" />
                  <div className="absolute -inset-1 rounded-full border-2 border-yellow-400/30 pointer-events-none" />

                  {/* Badge circle */}
                  <div className="relative w-24 h-24 md:w-36 md:h-36 rounded-full bg-[#0f1535] border-4 border-yellow-400/80 shadow-2xl shadow-yellow-400/20 flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">

                    {/* inner glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                    {/* decorative bolts */}
                    <FaBolt className="absolute top-2 left-3 text-yellow-400 text-[10px] opacity-80" />
                    <FaBolt className="absolute top-2 right-3 text-yellow-400 text-[10px] opacity-80" />
                    <FaBolt className="absolute bottom-3 left-2 text-yellow-400 text-[8px] opacity-60" />
                    <FaBolt className="absolute bottom-3 right-2 text-yellow-400 text-[8px] opacity-60" />

                    {/* megaphone icon */}
                    <FaBullhorn className="text-white text-base md:text-xl mb-0.5 md:mb-1 drop-shadow" />

                    {/* SPECIAL text */}
                    <span className="text-white text-[9px] md:text-[11px] font-black tracking-[0.2em] uppercase leading-none">
                      SPECIAL
                    </span>

                    {/* OFFER text */}
                    <span className="text-yellow-400 text-sm md:text-lg font-black tracking-wider uppercase leading-none mt-0.5 drop-shadow-sm">
                      OFFER
                    </span>

                    {/* offer title */}
                    <span className="text-white/70 text-[8px] md:text-[9px] font-semibold mt-0.5 md:mt-1 px-2 text-center leading-tight line-clamp-2">
                      {offer.title}
                    </span>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Features />
      <StatsCounter />
      <Programs />
      <TrainerPreview />
      <Testimonials />
      <CallToAction />
    </>
  )
}
