import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaChevronLeft, FaChevronRight, FaImages, FaExpand } from 'react-icons/fa'
import PageHero from '../components/shared/PageHero'
import api from '../utils/api'
import { useSiteContent } from '../context/SiteContentContext'

const GALLERY_DEFAULTS = {
  heroBadge: 'Gallery',
  heroTitle: 'OUR',
  heroHighlight: 'GALLERY',
  heroSubtitle: 'A glimpse into the PowerZone experience — state-of-the-art facilities and vibrant community.',
  heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
}

const categories = ['All', 'Gym Floor', 'Classes', 'Trainers', 'Members', 'Events']

export default function Gallery() {
  const saved = useSiteContent('page_gallery')
  const c = saved ? { ...GALLERY_DEFAULTS, ...saved } : GALLERY_DEFAULTS
  const [active, setActive] = useState('All')
  const [lightbox, setLightbox] = useState(null)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/gallery').then(({ data }) => setImages(data.images || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = active === 'All' ? images : images.filter((img) => img.category === active)

  const navLightbox = (dir) => {
    const idx = filtered.findIndex((img) => img._id === lightbox._id)
    setLightbox(filtered[(idx + dir + filtered.length) % filtered.length])
  }

  return (
    <>
      <PageHero badge={c.heroBadge} title={c.heroTitle} highlight={c.heroHighlight} subtitle={c.heroSubtitle} image={c.heroImage} />

      <section className="py-24 px-4 md:px-8 lg:px-16 bg-dark">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((cat) => (
              <motion.button key={cat} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setActive(cat)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  active === cat ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-dark-200 text-gray-400 hover:bg-dark-300 hover:text-white border border-dark-400'
                }`}>
                {cat}
              </motion.button>
            ))}
          </div>

          {loading ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {[0,1,2,3,4,5].map((i) => (
                <div key={i} className="break-inside-avoid rounded-2xl bg-dark-400 animate-pulse" style={{ height: `${180 + (i % 3) * 60}px` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <FaImages className="text-5xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">{images.length === 0 ? 'No gallery images yet.' : `No ${active} images found.`}</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {filtered.map((img, i) => (
                <motion.div key={img._id} layout
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="break-inside-avoid group relative overflow-hidden rounded-2xl cursor-pointer border border-dark-400 hover:border-primary/30 transition-colors duration-300"
                  onClick={() => setLightbox(img)}>
                  <img src={img.imageUrl} alt={img.title}
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                    <FaExpand className="text-white text-xs" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-bold text-sm">{img.title}</p>
                    <p className="text-gray-300 text-xs">{img.category}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/96 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}>
            <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-10 h-10 bg-dark-300 hover:bg-dark-400 border border-dark-400 rounded-xl flex items-center justify-center text-gray-400 hover:text-white z-50 transition-colors">
              <FaTimes />
            </button>
            <button onClick={(e) => { e.stopPropagation(); navLightbox(-1) }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-dark-300 hover:bg-dark-400 border border-dark-400 rounded-xl flex items-center justify-center text-gray-400 hover:text-white z-50 transition-colors">
              <FaChevronLeft />
            </button>
            <button onClick={(e) => { e.stopPropagation(); navLightbox(1) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-dark-300 hover:bg-dark-400 border border-dark-400 rounded-xl flex items-center justify-center text-gray-400 hover:text-white z-50 transition-colors">
              <FaChevronRight />
            </button>
            <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
              className="max-w-4xl max-h-[85vh] relative rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <img src={lightbox.imageUrl} alt={lightbox.title} className="w-full h-full object-contain" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-bold">{lightbox.title}</p>
                <p className="text-gray-400 text-sm">{lightbox.category}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
