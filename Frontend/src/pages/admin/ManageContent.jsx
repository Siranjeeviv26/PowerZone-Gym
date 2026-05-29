import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  FaEdit, FaSave, FaUpload, FaTimes, FaBars, FaUsers,
  FaUserTie, FaCrown, FaHome, FaSignOutAlt, FaMapMarkerAlt,
  FaDumbbell, FaImages, FaAppleAlt, FaExchangeAlt, FaGlobe,
  FaFileAlt, FaTachometerAlt, FaQuoteLeft, FaRunning, FaEye,
  FaChevronDown, FaChevronUp, FaLink, FaPlus, FaTrash,
  FaPalette,
  FaDatabase, FaTag,
} from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FaTachometerAlt },
  { to: '/admin/users', label: 'Members', icon: FaUsers },
  { to: '/admin/trainers', label: 'Trainers', icon: FaUserTie },
  { to: '/admin/plans', label: 'Plans', icon: FaCrown },
  { to: '/admin/branches', label: 'Branches', icon: FaMapMarkerAlt },
  { to: '/admin/transfer', label: 'Transfer', icon: FaExchangeAlt },
  { to: '/admin/activities', label: 'Activities', icon: FaRunning },
  { to: '/admin/content', label: 'Site Content', icon: FaEdit },
  { to: '/admin/navbar', label: 'Navbar', icon: FaLink },
  { to: '/admin/footer', label: 'Footer', icon: FaGlobe },
  { to: '/admin/theme', label: 'Theme', icon: FaPalette },
  { to: '/admin/master-data', label: 'Master Data', icon: FaDatabase },
  { to: '/admin/workouts', label: 'Workouts', icon: FaDumbbell },
  { to: '/admin/diet-plans', label: 'Diet Plans', icon: FaAppleAlt },
  { to: '/admin/gallery', label: 'Gallery', icon: FaImages },
  { to: '/admin/testimonials', label: 'Testimonials', icon: FaQuoteLeft },
  { to: '/admin/legal', label: 'Legal', icon: FaFileAlt },
  { to: '/', label: 'View Site', icon: FaHome },
]

const MAIN_TABS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'trainers', label: 'Trainers' },
  { id: 'membership', label: 'Membership' },
  { id: 'workouts', label: 'Workouts' },
  { id: 'dietplans', label: 'Diet Plans' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'branches', label: 'Branches' },
  { id: 'contact', label: 'Contact' },
  { id: 'auth', label: 'Auth Pages' },
]

const AUTH_TABS = [
  { id: 'login', label: 'Login' },
  { id: 'register', label: 'Register' },
  { id: 'forgot', label: 'Forgot Password' },
]

const HOME_TABS = [
  { id: 'hero', label: 'Hero' },
  { id: 'stats', label: 'Stats Counter' },
  { id: 'features', label: 'Features' },
  { id: 'programs', label: 'Programs' },
  { id: 'cta', label: 'Call to Action' },
]

const HERO_D = {
  badge: '#1 Rated Fitness Center In The City',
  headline1: 'FORGE', headline2: 'YOUR', headline3: 'BEST SELF',
  subtitle: 'Transform your body and mind with world-class equipment, expert trainers, and scientifically crafted programs. Your journey starts today.',
  cta1Text: 'START FREE TRIAL', cta2Text: 'Watch Tour',
  bgImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
  sideImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=700&q=80',
  videoUrl: 'https://www.youtube.com/embed/2pLT-olgUJs?autoplay=1&rel=0&modestbranding=1',
  stats: [
    { value: '5K+', label: 'Active Members' },
    { value: '50+', label: 'Expert Trainers' },
    { value: '100+', label: 'Programs' },
    { value: '10+', label: 'Years' },
  ],
}

const STATS_D = {
  bgImage: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1920&q=80',
  stats: [
    { value: 5000, suffix: '+', label: 'Active Members', desc: 'Growing community' },
    { value: 50, suffix: '+', label: 'Expert Trainers', desc: 'Certified professionals' },
    { value: 100, suffix: '+', label: 'Programs', desc: 'For every goal' },
    { value: 10, suffix: '+', label: 'Years of Excellence', desc: 'Proven track record' },
  ],
}

const FEATURES_D = {
  sectionTag: 'Why Choose Us',
  heading: 'Everything You Need to',
  headingHighlight: 'Succeed',
  subheading: 'World-class facilities combined with expert guidance to help you reach your fitness goals faster.',
  features: [
    { title: 'Premium Equipment', description: 'State-of-the-art machines and free weights from top brands, maintained to perfection.', color: '#e63946' },
    { title: 'Cardio Zone', description: 'Dedicated cardio area with treadmills, bikes, ellipticals and more for heart-pumping workouts.', color: '#f4a261' },
    { title: 'Nutrition Guidance', description: 'Personalized diet plans designed by certified nutritionists to fuel your transformation.', color: '#52b788' },
    { title: 'Group Classes', description: 'Energetic group sessions including HIIT, Yoga, Zumba, CrossFit and more — 50+ weekly.', color: '#4361ee' },
    { title: 'Expert Trainers', description: 'Certified personal trainers with 5+ years of experience, dedicated to your goals.', color: '#f72585' },
    { title: 'HIIT Programs', description: 'High-intensity interval training for maximum fat burn and endurance in minimum time.', color: '#a855f7' },
    { title: 'Safe Environment', description: '24/7 security, sanitized equipment, and trained staff to ensure a safe workout space.', color: '#2dc653' },
    { title: 'Flexible Hours', description: 'Open from 5 AM to 11 PM on weekdays. Weekend hours extended to accommodate your schedule.', color: '#fb8500' },
  ],
}

const PROGRAMS_D = {
  sectionTag: 'Our Programs',
  heading: 'Choose Your',
  headingHighlight: 'Training Path',
  programs: [
    { title: 'Strength Training', category: 'BUILD MUSCLE', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80', duration: '60 min', level: 'All Levels', desc: 'Build raw strength and muscle mass with progressive overload programs designed by elite coaches.' },
    { title: 'HIIT Cardio', category: 'BURN FAT', image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=600&q=80', duration: '45 min', level: 'Intermediate', desc: 'High-intensity intervals for maximum calorie burn and cardiovascular health.' },
    { title: 'Yoga & Flexibility', category: 'MIND & BODY', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80', duration: '75 min', level: 'Beginner', desc: 'Improve flexibility, balance and mental clarity through guided yoga practice.' },
    { title: 'CrossFit', category: 'FUNCTIONAL', image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&q=80', duration: '50 min', level: 'Advanced', desc: 'Constantly varied functional movements to build total body fitness.' },
    { title: 'Boxing', category: 'COMBAT', image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&q=80', duration: '60 min', level: 'All Levels', desc: 'Learn boxing fundamentals while burning calories and relieving stress.' },
    { title: 'Zumba', category: 'DANCE FITNESS', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80', duration: '55 min', level: 'Beginner', desc: 'Dance-based fitness program combining Latin rhythms with easy-to-follow moves.' },
  ],
}

const CTA_D = {
  badge: 'Limited Time Offer',
  headline1: 'START YOUR', headline2: 'JOURNEY', headline3: 'FOR FREE TODAY',
  subtitle: 'Join PowerZone and experience 7 days of unlimited access to all facilities. No commitment required — just results.',
  bgImage: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=1920&q=80',
  trialDays: '7', trialPrice: '999',
  benefits: ['No joining fee for first month', 'Access to all equipment & classes', 'Free personal training session', 'Customized diet plan included'],
}

const ABOUT_D = {
  heroBadge: 'Our Story', heroTitle: 'ABOUT', heroHighlight: 'POWERZONE',
  heroSubtitle: 'More than a gym — we are a movement. A community united by the pursuit of strength, health, and transformation.',
  heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
  storyHeading: 'FROM SMALL BEGINNINGS TO', storyHighlight: 'GREAT HEIGHTS',
  storyP1: 'PowerZone was founded in 2014 with a simple vision: to create a fitness space where everyone—beginners and athletes alike—could feel welcomed, motivated, and empowered.',
  storyP2: "What started as a small gym with 20 machines has grown into the city's premier fitness destination, serving over 5,000 members with 50+ certified trainers and 100+ programs.",
  storyImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=700&q=80',
  storyBadge: '10+', storyBadgeLabel: 'Years of Excellence',
  certifications: ['Certified by National Fitness Association', 'ISO 9001:2015 Certified Facility', 'Award-winning training methodology', 'Science-backed nutrition programs'],
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

const TRAINERS_D = {
  heroBadge: 'Expert Team', heroTitle: 'MEET OUR', heroHighlight: 'TRAINERS',
  heroSubtitle: 'Certified professionals dedicated to your transformation journey.',
  heroImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1920&q=80',
}

const MEMBERSHIP_D = {
  heroBadge: 'Pricing Plans', heroTitle: 'CHOOSE YOUR', heroHighlight: 'PLAN',
  heroSubtitle: 'Flexible plans for every goal and budget. Start your transformation today.',
  heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
  faqs: [
    { q: 'Can I cancel my membership anytime?', a: 'Yes, monthly plans can be cancelled anytime. Annual plans can be cancelled with a 30-day notice.' },
    { q: 'Is there a joining fee?', a: 'No joining fee for the first month! Just pay the monthly/annual plan price.' },
    { q: 'Can I freeze my membership?', a: 'Yes, you can freeze your membership for up to 3 months per year on Pro and Elite plans.' },
    { q: 'Are personal training sessions bookable online?', a: 'Yes, all sessions can be booked through your dashboard after enrollment.' },
  ],
}

const WORKOUTS_D = {
  heroBadge: 'Training Programs', heroTitle: 'WORKOUT', heroHighlight: 'PROGRAMS',
  heroSubtitle: 'Discover our comprehensive library of workout programs designed by certified trainers.',
  heroImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1920&q=80',
}

const DIETPLANS_D = {
  heroBadge: 'Nutrition', heroTitle: 'DIET', heroHighlight: 'PLANS',
  heroSubtitle: 'Science-backed nutrition plans crafted by certified dietitians for your specific goals.',
  heroImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1920&q=80',
}

const GALLERY_D = {
  heroBadge: 'Gallery', heroTitle: 'OUR', heroHighlight: 'GALLERY',
  heroSubtitle: 'A glimpse into the PowerZone experience — state-of-the-art facilities and vibrant community.',
  heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
}

const BRANCHES_D = {
  heroBadge: 'Our Locations', heroTitle: 'FIND YOUR', heroHighlight: 'BRANCH',
  heroSubtitle: 'Multiple locations across the city — find the PowerZone nearest to you and start your transformation.',
  heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
}

const CONTACT_D = {
  heroBadge: 'Contact Us', heroTitle: 'GET IN', heroHighlight: 'TOUCH',
  heroSubtitle: "Have questions? We'd love to hear from you. Our team responds within 24 hours.",
  heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
}

const LOGIN_D = {
  bgImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
  headline1: 'TRANSFORM', headline2: 'YOUR BODY.', headline3: 'TRANSFORM YOUR LIFE.',
  subtitle: 'Join thousands of members who have already achieved their fitness goals with PowerZone.',
  feature1: 'Personalized workout plans',
  feature2: 'Track your daily progress',
  feature3: 'Expert trainer guidance',
  quote: '"The body achieves what the mind believes."',
  formTitle: 'WELCOME BACK',
  formSubtitle: 'Sign in to continue your fitness journey',
}

const REGISTER_D = {
  bgImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1920&q=80',
  headline1: 'START YOUR', headline2: 'FITNESS', headline3: 'JOURNEY TODAY',
  subtitle: 'Join over 500+ members training at PowerZone.',
  perk1Title: '7-Day Free Trial', perk1Desc: 'Start with no commitment',
  perk2Title: 'Personalized Plans', perk2Desc: 'Workouts tailored to your goals',
  perk3Title: 'Expert Trainers', perk3Desc: 'Guidance every step of the way',
  memberCount: '500+ members already transforming',
  formTitle: 'CREATE ACCOUNT',
  formSubtitle: 'Start your transformation — 7 days free trial',
}

const FORGOT_D = {
  bgImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
  headline1: 'FORGOT YOUR', headline2: 'PASSWORD?',
  subtitle: "No worries — it happens to the best of us. Enter your email and we'll send you a reset link instantly.",
  quote: '"Every setback is a setup for a comeback."',
  formTitle: 'RESET PASSWORD',
  formSubtitle: "Enter your account email and we'll send you a reset link",
}

// ─── Helper Components ───────────────────────────────────────────────────────

function Field({ label, value, onChange, type = 'text', placeholder = '', small = false }) {
  if (type === 'textarea') return (
    <div>
      <label className="block text-gray-400 text-xs mb-1">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-dark-300 border border-dark-400 focus:border-primary/50 rounded-lg px-3 py-2 text-white text-sm min-h-[72px] resize-y outline-none transition-colors"
        placeholder={placeholder} />
    </div>
  )
  return (
    <div>
      <label className="block text-gray-400 text-xs mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className={`w-full bg-dark-300 border border-dark-400 focus:border-primary/50 rounded-lg px-3 py-2 text-white outline-none transition-colors ${small ? 'text-xs' : 'text-sm'}`}
        placeholder={placeholder} />
    </div>
  )
}

function ImageInput({ label, value, onChange, uploadKey, uploading, setUploading }) {
  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(u => ({ ...u, [uploadKey]: true }))
    try {
      const fd = new FormData()
      fd.append('image', file)
      const { data } = await api.post('/site-content/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onChange(data.url)
      toast.success('Image uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(u => ({ ...u, [uploadKey]: false }))
    }
  }
  return (
    <div>
      <label className="block text-gray-400 text-xs mb-1">{label}</label>
      <div className="flex gap-2">
        <input value={value} onChange={e => onChange(e.target.value)}
          className="flex-1 bg-dark-300 border border-dark-400 focus:border-primary/50 rounded-lg px-3 py-2 text-white text-sm outline-none transition-colors"
          placeholder="https://..." />
        <label className={`flex items-center gap-1.5 px-3 rounded-lg cursor-pointer text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0 ${uploading[uploadKey] ? 'bg-dark-300 text-gray-500' : 'bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25'}`}>
          <FaUpload className="text-xs" />
          {uploading[uploadKey] ? 'Uploading…' : 'Upload'}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading[uploadKey]} />
        </label>
      </div>
      {value && <img src={value} alt="" className="mt-2 h-16 w-full object-cover rounded-lg border border-dark-400" onError={e => { e.target.style.display = 'none' }} />}
    </div>
  )
}

function SectionCard({ title, children, onSave, saving }) {
  return (
    <div className="bg-dark-200 border border-dark-400 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-dark-400 flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <button onClick={onSave} disabled={saving}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
          <FaSave className="text-xs" />{saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function CollapsibleItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-dark-400 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left text-white text-sm font-medium hover:bg-dark-300 transition-colors">
        {title}
        {open ? <FaChevronUp className="text-xs text-gray-500" /> : <FaChevronDown className="text-xs text-gray-500" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3 border-t border-dark-400 pt-3">{children}</div>}
    </div>
  )
}

function PageHeroCard({ data, setField, section, onSave, saving, uploading, setUploading }) {
  return (
    <SectionCard title="Page Hero / Banner" onSave={onSave} saving={saving}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Badge Text" value={data.heroBadge || ''} onChange={v => setField('heroBadge', v)} placeholder="e.g. Our Story" />
        <Field label="Hero Title (white)" value={data.heroTitle || ''} onChange={v => setField('heroTitle', v)} placeholder="e.g. ABOUT" />
      </div>
      <Field label="Highlight Word (gradient color)" value={data.heroHighlight || ''} onChange={v => setField('heroHighlight', v)} placeholder="e.g. POWERZONE" />
      <Field label="Subtitle" value={data.heroSubtitle || ''} onChange={v => setField('heroSubtitle', v)} type="textarea" placeholder="Short descriptive text..." />
      <ImageInput label="Background Image" value={data.heroImage || ''} onChange={v => setField('heroImage', v)}
        uploadKey={`${section}_hero_bg`} uploading={uploading} setUploading={setUploading} />
    </SectionCard>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ManageContent() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024)
  const [mainTab, setMainTab] = useState('home')
  const [homeTab, setHomeTab] = useState('hero')
  const [authTab, setAuthTab] = useState('login')
  const [saving, setSaving] = useState({})
  const [uploading, setUploading] = useState({})
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Home section states
  const [hero, setHero] = useState(HERO_D)
  const [stats, setStats] = useState(STATS_D)
  const [features, setFeatures] = useState(FEATURES_D)
  const [programs, setPrograms] = useState(PROGRAMS_D)
  const [cta, setCta] = useState(CTA_D)

  // Page section states
  const [about, setAbout] = useState(ABOUT_D)
  const [trainers, setTrainers] = useState(TRAINERS_D)
  const [membership, setMembership] = useState(MEMBERSHIP_D)
  const [workouts, setWorkouts] = useState(WORKOUTS_D)
  const [dietplans, setDietplans] = useState(DIETPLANS_D)
  const [gallery, setGallery] = useState(GALLERY_D)
  const [branches, setBranches] = useState(BRANCHES_D)
  const [contact, setContact] = useState(CONTACT_D)
  const [loginPage, setLoginPage] = useState(LOGIN_D)
  const [registerPage, setRegisterPage] = useState(REGISTER_D)
  const [forgotPage, setForgotPage] = useState(FORGOT_D)

  useEffect(() => {
    api.get('/site-content').then(({ data }) => {
      if (!data.content) return
      const d = data.content
      if (d.hero) setHero(p => ({ ...p, ...d.hero, stats: d.hero.stats?.length ? d.hero.stats : p.stats }))
      if (d.stats) setStats(p => ({ ...p, ...d.stats, stats: d.stats.stats?.length ? d.stats.stats : p.stats }))
      if (d.features) setFeatures(p => ({ ...p, ...d.features, features: d.features.features?.length ? d.features.features : p.features }))
      if (d.programs) setPrograms(p => ({ ...p, ...d.programs, programs: d.programs.programs?.length ? d.programs.programs : p.programs }))
      if (d.cta) setCta(p => ({ ...p, ...d.cta, benefits: d.cta.benefits?.length ? d.cta.benefits : p.benefits }))
      if (d.page_about) setAbout(p => ({ ...p, ...d.page_about, certifications: d.page_about.certifications?.length ? d.page_about.certifications : p.certifications, values: d.page_about.values?.length ? d.page_about.values : p.values, milestones: d.page_about.milestones?.length ? d.page_about.milestones : p.milestones }))
      if (d.page_trainers) setTrainers(p => ({ ...p, ...d.page_trainers }))
      if (d.page_membership) setMembership(p => ({ ...p, ...d.page_membership, faqs: d.page_membership.faqs?.length ? d.page_membership.faqs : p.faqs }))
      if (d.page_workouts) setWorkouts(p => ({ ...p, ...d.page_workouts }))
      if (d.page_dietplans) setDietplans(p => ({ ...p, ...d.page_dietplans }))
      if (d.page_gallery) setGallery(p => ({ ...p, ...d.page_gallery }))
      if (d.page_branches) setBranches(p => ({ ...p, ...d.page_branches }))
      if (d.page_contact) setContact(p => ({ ...p, ...d.page_contact }))
      if (d.page_login) setLoginPage(p => ({ ...p, ...d.page_login }))
      if (d.page_register) setRegisterPage(p => ({ ...p, ...d.page_register }))
      if (d.page_forgot) setForgotPage(p => ({ ...p, ...d.page_forgot }))
    }).catch(() => {})
  }, [])

  const save = async (section, data) => {
    setSaving(s => ({ ...s, [section]: true }))
    try {
      await api.put(`/site-content/${section}`, data)
      toast.success('Saved successfully!')
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(s => ({ ...s, [section]: false }))
    }
  }

  // Home field setters
  const setHeroField = (f, v) => setHero(h => ({ ...h, [f]: v }))
  const setHeroStat = (i, f, v) => setHero(h => ({ ...h, stats: h.stats.map((s, idx) => idx === i ? { ...s, [f]: v } : s) }))
  const setStatField = (f, v) => setStats(s => ({ ...s, [f]: v }))
  const setStatRow = (i, f, v) => setStats(s => ({ ...s, stats: s.stats.map((r, idx) => idx === i ? { ...r, [f]: v } : r) }))
  const setFeatField = (f, v) => setFeatures(ft => ({ ...ft, [f]: v }))
  const setFeatItem = (i, f, v) => setFeatures(ft => ({ ...ft, features: ft.features.map((r, idx) => idx === i ? { ...r, [f]: v } : r) }))
  const setProgField = (f, v) => setPrograms(p => ({ ...p, [f]: v }))
  const setProgItem = (i, f, v) => setPrograms(p => ({ ...p, programs: p.programs.map((r, idx) => idx === i ? { ...r, [f]: v } : r) }))
  const setCtaField = (f, v) => setCta(c => ({ ...c, [f]: v }))
  const setCtaBenefit = (i, v) => setCta(c => ({ ...c, benefits: c.benefits.map((b, idx) => idx === i ? v : b) }))

  // Page field setters
  const setAboutField = (f, v) => setAbout(a => ({ ...a, [f]: v }))
  const setAboutCert = (i, v) => setAbout(a => ({ ...a, certifications: a.certifications.map((c, idx) => idx === i ? v : c) }))
  const setAboutValue = (i, f, v) => setAbout(a => ({ ...a, values: a.values.map((val, idx) => idx === i ? { ...val, [f]: v } : val) }))
  const setAboutMilestone = (i, f, v) => setAbout(a => ({ ...a, milestones: a.milestones.map((m, idx) => idx === i ? { ...m, [f]: v } : m) }))
  const addMilestone = () => setAbout(a => ({ ...a, milestones: [...a.milestones, { year: '', title: '', desc: '' }] }))
  const removeMilestone = (i) => setAbout(a => ({ ...a, milestones: a.milestones.filter((_, idx) => idx !== i) }))

  const setTrainersField = (f, v) => setTrainers(t => ({ ...t, [f]: v }))
  const setMemberField = (f, v) => setMembership(m => ({ ...m, [f]: v }))
  const setFaq = (i, f, v) => setMembership(m => ({ ...m, faqs: m.faqs.map((fq, idx) => idx === i ? { ...fq, [f]: v } : fq) }))
  const addFaq = () => setMembership(m => ({ ...m, faqs: [...m.faqs, { q: '', a: '' }] }))
  const removeFaq = (i) => setMembership(m => ({ ...m, faqs: m.faqs.filter((_, idx) => idx !== i) }))

  const setWorkoutsField = (f, v) => setWorkouts(w => ({ ...w, [f]: v }))
  const setDietField = (f, v) => setDietplans(d => ({ ...d, [f]: v }))
  const setGalleryField = (f, v) => setGallery(g => ({ ...g, [f]: v }))
  const setBranchesField = (f, v) => setBranches(b => ({ ...b, [f]: v }))
  const setContactField = (f, v) => setContact(c => ({ ...c, [f]: v }))
  const setLoginField = (f, v) => setLoginPage(l => ({ ...l, [f]: v }))
  const setRegisterField = (f, v) => setRegisterPage(r => ({ ...r, [f]: v }))
  const setForgotField = (f, v) => setForgotPage(fp => ({ ...fp, [f]: v }))

  return (
    <div className="h-screen bg-dark flex overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto flex-shrink-0 flex flex-col bg-dark-100 border-r border-dark-400 transition-all duration-300 ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64 lg:translate-x-0 lg:w-16'}`}>
        <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-6' : 'justify-center px-3'} py-5 border-b border-dark-400`}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <FaDumbbell className="text-white text-sm" />
          </div>
          {sidebarOpen && <span className="text-lg font-black text-white" style={{ fontFamily: 'Oswald' }}>ADMIN PANEL</span>}
        </div>
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}
              onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
              className={`flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl mb-1 text-sm font-medium transition-all ${pathname === item.to ? 'bg-primary/15 text-primary border border-primary/20' : 'text-gray-400 hover:bg-dark-300 hover:text-white'}`}>
              <item.icon className="text-base flex-shrink-0" />{sidebarOpen && item.label}
            </Link>
          ))}
        </nav>
        <div className="px-2 pb-4">
          <button onClick={() => { dispatch(logout()); navigate('/') }}
            className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm`}>
            <FaSignOutAlt className="flex-shrink-0" />{sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-dark-100 border-b border-dark-400 px-4 md:px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors">
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="flex items-center gap-3">
            <Link to="/" target="_blank" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors">
              <FaEye className="text-xs" /> Preview Site
            </Link>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">
            <div className="mb-5">
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Oswald' }}>SITE CONTENT</h1>
              <p className="text-gray-400 text-sm">Edit any page's content and images. Changes go live immediately after saving.</p>
            </div>

            {/* Main Page Tabs */}
            <div className="flex gap-1 mb-6 bg-dark-200 border border-dark-400 rounded-xl p-1 w-fit flex-wrap">
              {MAIN_TABS.map(tab => (
                <button key={tab.id} onClick={() => setMainTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mainTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── HOME ─────────────────────────────────────────── */}
            {mainTab === 'home' && (
              <>
                <div className="flex gap-1 mb-5 flex-wrap">
                  {HOME_TABS.map(tab => (
                    <button key={tab.id} onClick={() => setHomeTab(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${homeTab === tab.id ? 'bg-primary/15 border-primary/30 text-primary' : 'border-dark-500 text-gray-500 hover:text-white hover:border-dark-300'}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4 max-w-3xl">
                  {homeTab === 'hero' && (
                    <>
                      <SectionCard title="Badge & Headlines" onSave={() => save('hero', hero)} saving={saving.hero}>
                        <Field label="Badge Text" value={hero.badge} onChange={v => setHeroField('badge', v)} />
                        <div className="grid grid-cols-3 gap-3">
                          <Field label="Headline 1" value={hero.headline1} onChange={v => setHeroField('headline1', v)} />
                          <Field label="Headline 2" value={hero.headline2} onChange={v => setHeroField('headline2', v)} />
                          <Field label="Headline 3 (gradient)" value={hero.headline3} onChange={v => setHeroField('headline3', v)} />
                        </div>
                        <Field label="Subtitle" value={hero.subtitle} onChange={v => setHeroField('subtitle', v)} type="textarea" />
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Primary Button" value={hero.cta1Text} onChange={v => setHeroField('cta1Text', v)} />
                          <Field label="Secondary Button" value={hero.cta2Text} onChange={v => setHeroField('cta2Text', v)} />
                        </div>
                      </SectionCard>
                      <SectionCard title="Images & Video" onSave={() => save('hero', hero)} saving={saving.hero}>
                        <ImageInput label="Background Image" value={hero.bgImage} onChange={v => setHeroField('bgImage', v)}
                          uploadKey="hero_bg" uploading={uploading} setUploading={setUploading} />
                        <ImageInput label="Side Image (right panel)" value={hero.sideImage} onChange={v => setHeroField('sideImage', v)}
                          uploadKey="hero_side" uploading={uploading} setUploading={setUploading} />
                        <Field label="Video URL (YouTube embed)" value={hero.videoUrl} onChange={v => setHeroField('videoUrl', v)}
                          placeholder="https://www.youtube.com/embed/VIDEO_ID?autoplay=1" />
                      </SectionCard>
                      <SectionCard title="Stats Bar (4 counters)" onSave={() => save('hero', hero)} saving={saving.hero}>
                        <div className="grid grid-cols-2 gap-3">
                          {hero.stats.map((s, i) => (
                            <div key={i} className="bg-dark-300 rounded-xl p-3 space-y-2">
                              <div className="text-gray-500 text-xs font-medium">Stat {i + 1}</div>
                              <Field label="Value" value={s.value} onChange={v => setHeroStat(i, 'value', v)} small />
                              <Field label="Label" value={s.label} onChange={v => setHeroStat(i, 'label', v)} small />
                            </div>
                          ))}
                        </div>
                      </SectionCard>
                    </>
                  )}

                  {homeTab === 'stats' && (
                    <SectionCard title="Stats Counter Section" onSave={() => save('stats', stats)} saving={saving.stats}>
                      <ImageInput label="Background Image" value={stats.bgImage} onChange={v => setStatField('bgImage', v)}
                        uploadKey="stats_bg" uploading={uploading} setUploading={setUploading} />
                      <div className="grid grid-cols-2 gap-3">
                        {stats.stats.map((s, i) => (
                          <div key={i} className="bg-dark-300 rounded-xl p-3 space-y-2">
                            <div className="text-gray-500 text-xs font-medium">Counter {i + 1}</div>
                            <div className="grid grid-cols-2 gap-2">
                              <Field label="Number" value={String(s.value)} onChange={v => setStatRow(i, 'value', Number(v) || v)} small />
                              <Field label="Suffix" value={s.suffix} onChange={v => setStatRow(i, 'suffix', v)} small placeholder="+" />
                            </div>
                            <Field label="Label" value={s.label} onChange={v => setStatRow(i, 'label', v)} small />
                            <Field label="Description" value={s.desc} onChange={v => setStatRow(i, 'desc', v)} small />
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}

                  {homeTab === 'features' && (
                    <>
                      <SectionCard title="Section Header" onSave={() => save('features', features)} saving={saving.features}>
                        <Field label="Section Tag" value={features.sectionTag} onChange={v => setFeatField('sectionTag', v)} />
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Heading" value={features.heading} onChange={v => setFeatField('heading', v)} />
                          <Field label="Heading Highlight (gradient)" value={features.headingHighlight} onChange={v => setFeatField('headingHighlight', v)} />
                        </div>
                        <Field label="Subheading" value={features.subheading} onChange={v => setFeatField('subheading', v)} type="textarea" />
                      </SectionCard>
                      <SectionCard title="Feature Cards (8 items — icons fixed)" onSave={() => save('features', features)} saving={saving.features}>
                        <div className="space-y-2">
                          {features.features.map((f, i) => (
                            <CollapsibleItem key={i} title={`${String(i + 1).padStart(2, '0')} — ${f.title}`} defaultOpen={i === 0}>
                              <Field label="Title" value={f.title} onChange={v => setFeatItem(i, 'title', v)} small />
                              <Field label="Description" value={f.description} onChange={v => setFeatItem(i, 'description', v)} type="textarea" />
                              <Field label="Accent Color (hex)" value={f.color} onChange={v => setFeatItem(i, 'color', v)} small placeholder="#e63946" />
                            </CollapsibleItem>
                          ))}
                        </div>
                      </SectionCard>
                    </>
                  )}

                  {homeTab === 'programs' && (
                    <>
                      <SectionCard title="Section Header" onSave={() => save('programs', programs)} saving={saving.programs}>
                        <Field label="Section Tag" value={programs.sectionTag} onChange={v => setProgField('sectionTag', v)} />
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Heading" value={programs.heading} onChange={v => setProgField('heading', v)} />
                          <Field label="Heading Highlight (gradient)" value={programs.headingHighlight} onChange={v => setProgField('headingHighlight', v)} />
                        </div>
                      </SectionCard>
                      <SectionCard title="Program Cards (6 items)" onSave={() => save('programs', programs)} saving={saving.programs}>
                        <div className="space-y-2">
                          {programs.programs.map((p, i) => (
                            <CollapsibleItem key={i} title={`${String(i + 1).padStart(2, '0')} — ${p.title}`} defaultOpen={i === 0}>
                              <div className="grid grid-cols-2 gap-2">
                                <Field label="Title" value={p.title} onChange={v => setProgItem(i, 'title', v)} small />
                                <Field label="Category Badge" value={p.category} onChange={v => setProgItem(i, 'category', v)} small placeholder="BUILD MUSCLE" />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <Field label="Duration" value={p.duration} onChange={v => setProgItem(i, 'duration', v)} small placeholder="60 min" />
                                <Field label="Level" value={p.level} onChange={v => setProgItem(i, 'level', v)} small placeholder="All Levels" />
                              </div>
                              <Field label="Description" value={p.desc} onChange={v => setProgItem(i, 'desc', v)} type="textarea" />
                              <ImageInput label="Card Image" value={p.image} onChange={v => setProgItem(i, 'image', v)}
                                uploadKey={`prog_img_${i}`} uploading={uploading} setUploading={setUploading} />
                            </CollapsibleItem>
                          ))}
                        </div>
                      </SectionCard>
                    </>
                  )}

                  {homeTab === 'cta' && (
                    <>
                      <SectionCard title="Call to Action Section" onSave={() => save('cta', cta)} saving={saving.cta}>
                        <Field label="Badge Text" value={cta.badge} onChange={v => setCtaField('badge', v)} />
                        <div className="grid grid-cols-3 gap-3">
                          <Field label="Headline Line 1" value={cta.headline1} onChange={v => setCtaField('headline1', v)} />
                          <Field label="Headline Line 2" value={cta.headline2} onChange={v => setCtaField('headline2', v)} />
                          <Field label="Headline Line 3 (gradient)" value={cta.headline3} onChange={v => setCtaField('headline3', v)} />
                        </div>
                        <Field label="Subtitle" value={cta.subtitle} onChange={v => setCtaField('subtitle', v)} type="textarea" />
                        <ImageInput label="Background Image" value={cta.bgImage} onChange={v => setCtaField('bgImage', v)}
                          uploadKey="cta_bg" uploading={uploading} setUploading={setUploading} />
                      </SectionCard>
                      <SectionCard title="Free Trial Box" onSave={() => save('cta', cta)} saving={saving.cta}>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Trial Days" value={cta.trialDays} onChange={v => setCtaField('trialDays', v)} placeholder="7" />
                          <Field label="Original Price (₹)" value={cta.trialPrice} onChange={v => setCtaField('trialPrice', v)} placeholder="999" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-gray-400 text-xs">Benefits (4 items)</label>
                          {cta.benefits.map((b, i) => (
                            <input key={i} value={b} onChange={e => setCtaBenefit(i, e.target.value)}
                              className="w-full bg-dark-300 border border-dark-400 focus:border-primary/50 rounded-lg px-3 py-2 text-white text-sm outline-none transition-colors"
                              placeholder={`Benefit ${i + 1}`} />
                          ))}
                        </div>
                      </SectionCard>
                    </>
                  )}
                </div>
              </>
            )}

            {/* ── ABOUT ─────────────────────────────────────────── */}
            {mainTab === 'about' && (
              <div className="space-y-4 max-w-3xl">
                <PageHeroCard data={about} setField={setAboutField} section="page_about"
                  onSave={() => save('page_about', about)} saving={saving.page_about}
                  uploading={uploading} setUploading={setUploading} />

                <SectionCard title="Our Story" onSave={() => save('page_about', about)} saving={saving.page_about}>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Heading" value={about.storyHeading} onChange={v => setAboutField('storyHeading', v)} />
                    <Field label="Heading Highlight (gradient)" value={about.storyHighlight} onChange={v => setAboutField('storyHighlight', v)} />
                  </div>
                  <Field label="Paragraph 1" value={about.storyP1} onChange={v => setAboutField('storyP1', v)} type="textarea" />
                  <Field label="Paragraph 2" value={about.storyP2} onChange={v => setAboutField('storyP2', v)} type="textarea" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Badge Number (e.g. 10+)" value={about.storyBadge} onChange={v => setAboutField('storyBadge', v)} small />
                    <Field label="Badge Label (e.g. Years of Excellence)" value={about.storyBadgeLabel} onChange={v => setAboutField('storyBadgeLabel', v)} small />
                  </div>
                  <ImageInput label="Story Image" value={about.storyImage} onChange={v => setAboutField('storyImage', v)}
                    uploadKey="about_story_img" uploading={uploading} setUploading={setUploading} />
                </SectionCard>

                <SectionCard title="Certifications (4 bullet points)" onSave={() => save('page_about', about)} saving={saving.page_about}>
                  <div className="space-y-2">
                    {about.certifications.map((cert, i) => (
                      <input key={i} value={cert} onChange={e => setAboutCert(i, e.target.value)}
                        className="w-full bg-dark-300 border border-dark-400 focus:border-primary/50 rounded-lg px-3 py-2 text-white text-sm outline-none transition-colors"
                        placeholder={`Certification ${i + 1}`} />
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Values (4 cards — icons fixed by position)" onSave={() => save('page_about', about)} saving={saving.page_about}>
                  <div className="space-y-2">
                    {about.values.map((v, i) => (
                      <CollapsibleItem key={i} title={`${String(i + 1).padStart(2, '0')} — ${v.title}`} defaultOpen={i === 0}>
                        <Field label="Title" value={v.title} onChange={val => setAboutValue(i, 'title', val)} small />
                        <Field label="Description" value={v.desc} onChange={val => setAboutValue(i, 'desc', val)} type="textarea" />
                        <Field label="Accent Color (hex)" value={v.color} onChange={val => setAboutValue(i, 'color', val)} small placeholder="#e63946" />
                      </CollapsibleItem>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Timeline / Milestones" onSave={() => save('page_about', about)} saving={saving.page_about}>
                  <div className="space-y-2">
                    {about.milestones.map((m, i) => (
                      <CollapsibleItem key={i} title={`${m.year || '????'} — ${m.title || 'Milestone'}`} defaultOpen={i === 0}>
                        <div className="flex items-start gap-2">
                          <div className="flex-1 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Field label="Year" value={m.year} onChange={v => setAboutMilestone(i, 'year', v)} small placeholder="2024" />
                              <Field label="Title" value={m.title} onChange={v => setAboutMilestone(i, 'title', v)} small placeholder="Founded" />
                            </div>
                            <Field label="Description" value={m.desc} onChange={v => setAboutMilestone(i, 'desc', v)} type="textarea" />
                          </div>
                          {about.milestones.length > 1 && (
                            <button onClick={() => removeMilestone(i)} className="mt-5 w-7 h-7 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
                              <FaTrash className="text-xs" />
                            </button>
                          )}
                        </div>
                      </CollapsibleItem>
                    ))}
                  </div>
                  <button onClick={addMilestone}
                    className="flex items-center gap-2 px-4 py-2 border border-dashed border-dark-500 hover:border-primary/40 text-gray-400 hover:text-primary rounded-xl text-xs transition-all w-full justify-center">
                    <FaPlus className="text-xs" /> Add Milestone
                  </button>
                </SectionCard>
              </div>
            )}

            {/* ── TRAINERS ─────────────────────────────────────── */}
            {mainTab === 'trainers' && (
              <div className="space-y-4 max-w-3xl">
                <PageHeroCard data={trainers} setField={setTrainersField} section="page_trainers"
                  onSave={() => save('page_trainers', trainers)} saving={saving.page_trainers}
                  uploading={uploading} setUploading={setUploading} />
                <p className="text-gray-500 text-xs pl-1">Trainer cards are managed via the <Link to="/admin/trainers" className="text-primary hover:underline">Trainers page</Link>.</p>
              </div>
            )}

            {/* ── MEMBERSHIP ───────────────────────────────────── */}
            {mainTab === 'membership' && (
              <div className="space-y-4 max-w-3xl">
                <PageHeroCard data={membership} setField={setMemberField} section="page_membership"
                  onSave={() => save('page_membership', membership)} saving={saving.page_membership}
                  uploading={uploading} setUploading={setUploading} />

                <SectionCard title="FAQs (Frequently Asked Questions)" onSave={() => save('page_membership', membership)} saving={saving.page_membership}>
                  <div className="space-y-3">
                    {membership.faqs.map((faq, i) => (
                      <div key={i} className="bg-dark-300 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-xs font-medium">FAQ {i + 1}</span>
                          {membership.faqs.length > 1 && (
                            <button onClick={() => removeFaq(i)} className="w-6 h-6 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                              <FaTrash className="text-[10px]" />
                            </button>
                          )}
                        </div>
                        <Field label="Question" value={faq.q} onChange={v => setFaq(i, 'q', v)} small placeholder="e.g. Can I cancel anytime?" />
                        <Field label="Answer" value={faq.a} onChange={v => setFaq(i, 'a', v)} type="textarea" placeholder="Answer..." />
                      </div>
                    ))}
                  </div>
                  <button onClick={addFaq}
                    className="flex items-center gap-2 px-4 py-2 border border-dashed border-dark-500 hover:border-primary/40 text-gray-400 hover:text-primary rounded-xl text-xs transition-all w-full justify-center">
                    <FaPlus className="text-xs" /> Add FAQ
                  </button>
                </SectionCard>
                <p className="text-gray-500 text-xs pl-1">Membership plan cards are managed via the <Link to="/admin/plans" className="text-primary hover:underline">Plans page</Link>.</p>
              </div>
            )}

            {/* ── WORKOUTS ─────────────────────────────────────── */}
            {mainTab === 'workouts' && (
              <div className="space-y-4 max-w-3xl">
                <PageHeroCard data={workouts} setField={setWorkoutsField} section="page_workouts"
                  onSave={() => save('page_workouts', workouts)} saving={saving.page_workouts}
                  uploading={uploading} setUploading={setUploading} />
                <p className="text-gray-500 text-xs pl-1">Workout cards are managed via the <Link to="/admin/workouts" className="text-primary hover:underline">Workouts page</Link>.</p>
              </div>
            )}

            {/* ── DIET PLANS ───────────────────────────────────── */}
            {mainTab === 'dietplans' && (
              <div className="space-y-4 max-w-3xl">
                <PageHeroCard data={dietplans} setField={setDietField} section="page_dietplans"
                  onSave={() => save('page_dietplans', dietplans)} saving={saving.page_dietplans}
                  uploading={uploading} setUploading={setUploading} />
                <p className="text-gray-500 text-xs pl-1">Diet plan cards are managed via the <Link to="/admin/diet-plans" className="text-primary hover:underline">Diet Plans page</Link>.</p>
              </div>
            )}

            {/* ── GALLERY ──────────────────────────────────────── */}
            {mainTab === 'gallery' && (
              <div className="space-y-4 max-w-3xl">
                <PageHeroCard data={gallery} setField={setGalleryField} section="page_gallery"
                  onSave={() => save('page_gallery', gallery)} saving={saving.page_gallery}
                  uploading={uploading} setUploading={setUploading} />
                <p className="text-gray-500 text-xs pl-1">Gallery images are managed via the <Link to="/admin/gallery" className="text-primary hover:underline">Gallery page</Link>.</p>
              </div>
            )}

            {/* ── BRANCHES ─────────────────────────────────────── */}
            {mainTab === 'branches' && (
              <div className="space-y-4 max-w-3xl">
                <PageHeroCard data={branches} setField={setBranchesField} section="page_branches"
                  onSave={() => save('page_branches', branches)} saving={saving.page_branches}
                  uploading={uploading} setUploading={setUploading} />
                <p className="text-gray-500 text-xs pl-1">Branch cards are managed via the <Link to="/admin/branches" className="text-primary hover:underline">Branches page</Link>.</p>
              </div>
            )}

            {/* ── CONTACT ──────────────────────────────────────── */}
            {mainTab === 'contact' && (
              <div className="space-y-4 max-w-3xl">
                <PageHeroCard data={contact} setField={setContactField} section="page_contact"
                  onSave={() => save('page_contact', contact)} saving={saving.page_contact}
                  uploading={uploading} setUploading={setUploading} />
                <p className="text-gray-500 text-xs pl-1">Contact details (address, phone, email, hours) are managed via the <Link to="/admin/footer" className="text-primary hover:underline">Footer settings page</Link>.</p>
              </div>
            )}

            {/* ── AUTH PAGES ───────────────────────────────────── */}
            {mainTab === 'auth' && (
              <>
                <div className="flex gap-1 mb-5 flex-wrap">
                  {AUTH_TABS.map(tab => (
                    <button key={tab.id} onClick={() => setAuthTab(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${authTab === tab.id ? 'bg-primary/15 border-primary/30 text-primary' : 'border-dark-500 text-gray-500 hover:text-white hover:border-dark-300'}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4 max-w-3xl">
                  {/* LOGIN */}
                  {authTab === 'login' && (
                    <>
                      <SectionCard title="Left Panel — Branding" onSave={() => save('page_login', loginPage)} saving={saving.page_login}>
                        <ImageInput label="Background Image" value={loginPage.bgImage} onChange={v => setLoginField('bgImage', v)}
                          uploadKey="login_bg" uploading={uploading} setUploading={setUploading} />
                        <div className="grid grid-cols-3 gap-3">
                          <Field label="Headline Line 1" value={loginPage.headline1} onChange={v => setLoginField('headline1', v)} />
                          <Field label="Headline Line 2" value={loginPage.headline2} onChange={v => setLoginField('headline2', v)} />
                          <Field label="Headline Line 3" value={loginPage.headline3} onChange={v => setLoginField('headline3', v)} />
                        </div>
                        <Field label="Subtitle" value={loginPage.subtitle} onChange={v => setLoginField('subtitle', v)} type="textarea" />
                        <Field label="Quote (bottom)" value={loginPage.quote} onChange={v => setLoginField('quote', v)} placeholder='"Your motivational quote here."' />
                      </SectionCard>
                      <SectionCard title="Features List (3 items — icons fixed)" onSave={() => save('page_login', loginPage)} saving={saving.page_login}>
                        <Field label="Feature 1" value={loginPage.feature1} onChange={v => setLoginField('feature1', v)} />
                        <Field label="Feature 2" value={loginPage.feature2} onChange={v => setLoginField('feature2', v)} />
                        <Field label="Feature 3" value={loginPage.feature3} onChange={v => setLoginField('feature3', v)} />
                      </SectionCard>
                      <SectionCard title="Right Panel — Form Text" onSave={() => save('page_login', loginPage)} saving={saving.page_login}>
                        <Field label="Form Title" value={loginPage.formTitle} onChange={v => setLoginField('formTitle', v)} placeholder="WELCOME BACK" />
                        <Field label="Form Subtitle" value={loginPage.formSubtitle} onChange={v => setLoginField('formSubtitle', v)} placeholder="Sign in to continue your fitness journey" />
                      </SectionCard>
                    </>
                  )}

                  {/* REGISTER */}
                  {authTab === 'register' && (
                    <>
                      <SectionCard title="Left Panel — Branding" onSave={() => save('page_register', registerPage)} saving={saving.page_register}>
                        <ImageInput label="Background Image" value={registerPage.bgImage} onChange={v => setRegisterField('bgImage', v)}
                          uploadKey="register_bg" uploading={uploading} setUploading={setUploading} />
                        <div className="grid grid-cols-3 gap-3">
                          <Field label="Headline Line 1" value={registerPage.headline1} onChange={v => setRegisterField('headline1', v)} />
                          <Field label="Headline Line 2 (primary color)" value={registerPage.headline2} onChange={v => setRegisterField('headline2', v)} />
                          <Field label="Headline Line 3" value={registerPage.headline3} onChange={v => setRegisterField('headline3', v)} />
                        </div>
                        <Field label="Subtitle" value={registerPage.subtitle} onChange={v => setRegisterField('subtitle', v)} type="textarea" />
                        <Field label="Member Count Text" value={registerPage.memberCount} onChange={v => setRegisterField('memberCount', v)} placeholder="500+ members already transforming" />
                      </SectionCard>
                      <SectionCard title="Perks List (3 items — icons fixed)" onSave={() => save('page_register', registerPage)} saving={saving.page_register}>
                        <div className="space-y-3">
                          {[1, 2, 3].map(n => (
                            <div key={n} className="bg-dark-300 rounded-xl p-3 space-y-2">
                              <div className="text-gray-500 text-xs font-medium">Perk {n}</div>
                              <div className="grid grid-cols-2 gap-2">
                                <Field label="Title" value={registerPage[`perk${n}Title`]} onChange={v => setRegisterField(`perk${n}Title`, v)} small />
                                <Field label="Description" value={registerPage[`perk${n}Desc`]} onChange={v => setRegisterField(`perk${n}Desc`, v)} small />
                              </div>
                            </div>
                          ))}
                        </div>
                      </SectionCard>
                      <SectionCard title="Right Panel — Form Text" onSave={() => save('page_register', registerPage)} saving={saving.page_register}>
                        <Field label="Form Title" value={registerPage.formTitle} onChange={v => setRegisterField('formTitle', v)} placeholder="CREATE ACCOUNT" />
                        <Field label="Form Subtitle" value={registerPage.formSubtitle} onChange={v => setRegisterField('formSubtitle', v)} placeholder="Start your transformation — 7 days free trial" />
                      </SectionCard>
                    </>
                  )}

                  {/* FORGOT PASSWORD */}
                  {authTab === 'forgot' && (
                    <>
                      <SectionCard title="Left Panel — Branding" onSave={() => save('page_forgot', forgotPage)} saving={saving.page_forgot}>
                        <ImageInput label="Background Image" value={forgotPage.bgImage} onChange={v => setForgotField('bgImage', v)}
                          uploadKey="forgot_bg" uploading={uploading} setUploading={setUploading} />
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Headline Line 1" value={forgotPage.headline1} onChange={v => setForgotField('headline1', v)} />
                          <Field label="Headline Line 2 (primary color)" value={forgotPage.headline2} onChange={v => setForgotField('headline2', v)} />
                        </div>
                        <Field label="Subtitle" value={forgotPage.subtitle} onChange={v => setForgotField('subtitle', v)} type="textarea" />
                        <Field label="Quote (bottom)" value={forgotPage.quote} onChange={v => setForgotField('quote', v)} placeholder='"Your motivational quote here."' />
                      </SectionCard>
                      <SectionCard title="Right Panel — Form Text" onSave={() => save('page_forgot', forgotPage)} saving={saving.page_forgot}>
                        <Field label="Form Title" value={forgotPage.formTitle} onChange={v => setForgotField('formTitle', v)} placeholder="RESET PASSWORD" />
                        <Field label="Form Subtitle" value={forgotPage.formSubtitle} onChange={v => setForgotField('formSubtitle', v)} placeholder="Enter your account email and we'll send you a reset link" />
                      </SectionCard>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
