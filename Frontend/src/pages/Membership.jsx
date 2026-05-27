import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaCheck, FaCrown, FaBolt, FaStar, FaChevronDown, FaTag, FaTimes } from 'react-icons/fa'
import PageHero from '../components/shared/PageHero'
import api from '../utils/api'
import { useSiteContent } from '../context/SiteContentContext'

const MEMBERSHIP_DEFAULTS = {
  heroBadge: 'Pricing Plans',
  heroTitle: 'CHOOSE YOUR',
  heroHighlight: 'PLAN',
  heroSubtitle: 'Flexible plans for every goal and budget. Start your transformation today.',
  heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
  faqs: [
    { q: 'Can I cancel my membership anytime?', a: 'Yes, monthly plans can be cancelled anytime. Annual plans can be cancelled with a 30-day notice.' },
    { q: 'Is there a joining fee?', a: 'No joining fee for the first month! Just pay the monthly/annual plan price.' },
    { q: 'Can I freeze my membership?', a: 'Yes, you can freeze your membership for up to 3 months per year on Pro and Elite plans.' },
    { q: 'Are personal training sessions bookable online?', a: 'Yes, all sessions can be booked through your dashboard after enrollment.' },
  ],
}

const ICON_MAP = [FaBolt, FaStar, FaCrown]

const BILLING_OPTIONS = [
  { value: 'monthly',     label: 'Monthly',     short: 'mo',  months: 1,  key: 'monthlyPrice',     saveBadge: null },
  { value: 'quarterly',   label: 'Quarterly',   short: 'qtr', months: 3,  key: 'quarterlyPrice',   saveBadge: 'Save 10%' },
  { value: 'half-yearly', label: 'Half-Yearly', short: '6mo', months: 6,  key: 'halfYearlyPrice',  saveBadge: 'Save 15%' },
  { value: 'yearly',      label: 'Yearly',      short: 'yr',  months: 12, key: 'yearlyPrice',      saveBadge: 'Save 17%' },
]

function PlanCard({ plan, billing, index }) {
  const Icon = ICON_MAP[index % ICON_MAP.length]
  const color = plan.color || '#e63946'
  const opt = BILLING_OPTIONS.find((b) => b.value === billing) || BILLING_OPTIONS[0]
  const price = plan[opt.key] || null
  const savingsAmt = price && opt.months > 1 ? (plan.monthlyPrice * opt.months - price) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 ${
        plan.isPopular ? 'border-2 shadow-2xl' : 'bg-dark-200 border border-dark-400 hover:border-primary/30'
      }`}
      style={plan.isPopular ? { borderColor: color, boxShadow: `0 25px 50px ${color}20`, background: `linear-gradient(160deg, ${color}08 0%, #1a1a1a 50%)` } : {}}
    >
      {plan.isPopular && (
        <div className="text-white text-center py-2 text-xs font-black tracking-widest uppercase" style={{ backgroundColor: color }}>
          ⭐ Most Popular
        </div>
      )}
      <div className="p-7">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18`, border: `1px solid ${color}28` }}>
            <Icon style={{ color }} className="text-xl" />
          </div>
          <div>
            <h3 className="text-white font-black text-xl" style={{ fontFamily: 'Oswald' }}>{plan.name}</h3>
            <p className="text-gray-500 text-xs">{plan.description || 'Perfect for commitment'}</p>
          </div>
        </div>

        <div className="mb-7">
          {price ? (
            <>
              <div className="flex items-end gap-1">
                <span className="text-gray-400 text-base mb-1">₹</span>
                <span className="text-5xl font-black text-white" style={{ fontFamily: 'Oswald' }}>{price.toLocaleString()}</span>
                <span className="text-gray-500 text-sm mb-1.5">/{opt.short}</span>
              </div>
              {savingsAmt > 0 && (
                <p className="text-green-400 text-xs mt-1 font-medium">
                  💰 Save ₹{savingsAmt.toLocaleString()} vs monthly!
                </p>
              )}
            </>
          ) : (
            <div className="py-3">
              <p className="text-gray-500 text-sm">Not available for this period.</p>
              <p className="text-gray-600 text-xs mt-1">
                Monthly: ₹{plan.monthlyPrice?.toLocaleString()}/mo
              </p>
            </div>
          )}
        </div>

        <ul className="space-y-2.5 mb-7">
          {(plan.features || []).map((feature, j) => (
            <li key={j} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
                <FaCheck style={{ color }} className="text-[8px]" />
              </div>
              <span className="text-sm text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>

        <Link to="/register">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${
              plan.isPopular ? 'text-white shadow-lg' : 'border border-dark-500 hover:border-primary text-gray-300 hover:text-white hover:bg-primary/10'
            }`}
            style={plan.isPopular ? { backgroundColor: color } : {}}>
            Get Started — {plan.name}
          </motion.button>
        </Link>
      </div>
    </motion.div>
  )
}

export default function Membership() {
  const saved = useSiteContent('page_membership')
  const c = saved ? {
    ...MEMBERSHIP_DEFAULTS, ...saved,
    faqs: saved.faqs?.length ? saved.faqs : MEMBERSHIP_DEFAULTS.faqs,
  } : MEMBERSHIP_DEFAULTS
  const [billing, setBilling] = useState('monthly')
  const [openFaq, setOpenFaq] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [offers, setOffers] = useState([])
  const [offerLightbox, setOfferLightbox] = useState(null)

  useEffect(() => {
    api.get('/plans').then(({ data }) => setPlans(data.plans || [])).catch(() => {}).finally(() => setLoading(false))
    api.get('/offers').then(({ data }) => setOffers((data.offers || []).filter((o) => o.isActive))).catch(() => {})
  }, [])

  return (
    <>
      <PageHero badge={c.heroBadge} title={c.heroTitle} highlight={c.heroHighlight} subtitle={c.heroSubtitle} image={c.heroImage} />

      {/* Billing toggle */}
      <div className="py-8 bg-dark-100 border-b border-dark-400">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 flex justify-center">
          <div className="inline-flex items-center bg-dark-300 rounded-xl p-1 border border-dark-500 flex-wrap gap-0.5">
            {BILLING_OPTIONS.map((b) => (
              <button key={b.value} onClick={() => setBilling(b.value)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                  billing === b.value ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-400 hover:text-white'
                }`}>
                {b.label}
                {b.saveBadge && <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-bold">{b.saveBadge}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Offers */}
      {offers.length > 0 && (
        <section className="py-12 px-4 md:px-8 lg:px-16 bg-dark border-b border-dark-400">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <FaTag className="text-orange-400" />
              <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Oswald' }}>CURRENT OFFERS</h2>
              <span className="flex items-center gap-1.5 text-[10px] bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full font-bold border border-orange-500/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-400" />
                </span>
                LIVE
              </span>
            </div>
            <div className={`grid grid-cols-1 gap-4 ${offers.length > 1 ? 'md:grid-cols-2' : 'max-w-md'} ${offers.length > 2 ? 'xl:grid-cols-3' : ''}`}>
              {offers.map((offer, i) => (
                <motion.button
                  key={offer._id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setOfferLightbox(offer)}
                  className="group relative rounded-2xl overflow-hidden border border-orange-500/20 hover:border-orange-500/50 transition-all text-left"
                >
                  <img src={offer.image} alt={offer.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-black text-lg leading-tight" style={{ fontFamily: 'Oswald' }}>{offer.title}</p>
                    {offer.description && <p className="text-gray-300 text-xs mt-1">{offer.description}</p>}
                    {offer.endDate && (
                      <p className="text-orange-400 text-xs mt-1.5 font-semibold">
                        Valid until {new Date(offer.endDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <FaTag className="text-[10px]" /> OFFER
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Plans */}
      <section className="py-24 px-4 md:px-8 lg:px-16 bg-dark">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0,1,2].map((i) => (
                <div key={i} className="bg-dark-200 border border-dark-400 rounded-2xl p-7 animate-pulse">
                  <div className="h-12 w-12 bg-dark-400 rounded-xl mb-5" />
                  <div className="h-7 bg-dark-400 rounded w-32 mb-3" />
                  <div className="h-12 bg-dark-400 rounded w-24 mb-6" />
                  {[0,1,2,3].map((j) => <div key={j} className="h-3.5 bg-dark-400 rounded mb-2" />)}
                </div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20">
              <FaCrown className="text-5xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No membership plans available yet. Check back soon!</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 gap-6 ${plans.length === 1 ? 'max-w-sm mx-auto' : plans.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' : 'md:grid-cols-3'}`}>
              {plans.map((plan, i) => <PlanCard key={plan._id} plan={plan} billing={billing} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* Offer Lightbox */}
      <AnimatePresence>
        {offerLightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setOfferLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setOfferLightbox(null)}
                className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm"
              >
                <FaTimes /> Close
              </button>
              <div className="rounded-2xl overflow-hidden border border-orange-500/30 shadow-2xl shadow-orange-500/10">
                <img src={offerLightbox.image} alt={offerLightbox.title || 'Offer'} className="w-full object-contain max-h-[85vh]" />
                {offerLightbox.title && (
                  <div className="bg-dark-200 px-5 py-4 flex items-center gap-3">
                    <FaTag className="text-orange-400 flex-shrink-0" />
                    <span className="text-white font-bold text-lg" style={{ fontFamily: 'Oswald' }}>{offerLightbox.title}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQs */}
      <section className="py-24 px-4 md:px-8 lg:px-16 bg-dark-100">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span className="text-primary text-xs font-bold uppercase tracking-widest">FAQs</span>
            </div>
            <h2 className="text-4xl font-black text-white" style={{ fontFamily: 'Oswald' }}>
              Frequently Asked <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Questions</span>
            </h2>
          </motion.div>
          <div className="space-y-3">
            {c.faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-dark-200 border border-dark-400 hover:border-primary/25 rounded-2xl overflow-hidden transition-colors duration-200">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left">
                  <span className="text-white font-medium text-sm">{faq.q}</span>
                  <FaChevronDown className={`text-primary text-xs ml-3 flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      className="px-6 pb-4 text-gray-400 text-sm leading-relaxed overflow-hidden border-t border-dark-400">
                      <div className="pt-3">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
