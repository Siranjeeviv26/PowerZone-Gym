import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { FaDumbbell, FaBars, FaTimes, FaUser, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa'
import { logout } from '../../store/slices/authSlice'
import { useSiteContent } from '../../context/SiteContentContext'
import api from '../../utils/api'

const NAV_DEFAULTS = {
  brandName1: 'POWER',
  brandName2: 'ZONE',
  logoImage: '',
  joinBtnText: 'Join Now',
  loginBtnText: 'Login',
  links: [
    { to: '/', label: 'Home', visible: true },
    { to: '/about', label: 'About', visible: true },
    { to: '/trainers', label: 'Trainers', visible: true },
    { to: '/membership', label: 'Membership', visible: true },
    { to: '/workouts', label: 'Workouts', visible: true },
    { to: '/diet-plans', label: 'Diet Plans', visible: true },
    { to: '/gallery', label: 'Gallery', visible: true },
    { to: '/branches', label: 'Branches', visible: true },
    { to: '/contact', label: 'Contact', visible: true },
  ],
}

export default function Navbar() {
  const saved = useSiteContent('navbar')
  const nav = saved
    ? { ...NAV_DEFAULTS, ...saved, links: saved.links?.length ? saved.links : NAV_DEFAULTS.links }
    : NAV_DEFAULTS
  const navLinks = nav.links.filter(l => l.visible !== false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [hasActiveOffer, setHasActiveOffer] = useState(false)
  const { user } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    api.get('/offers').then(({ data }) => {
      setHasActiveOffer((data.offers || []).some((o) => o.isActive))
    }).catch(() => {})
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    setUserMenu(false)
    navigate('/')
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-dark-100/95 backdrop-blur-xl shadow-2xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            {nav.logoImage ? (
              <img src={nav.logoImage} alt="Logo"
                className="h-10 w-auto object-contain group-hover:scale-110 transition-transform duration-300" />
            ) : (
              <>
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaDumbbell className="text-white text-lg" />
                </div>
                <span className="text-2xl font-black tracking-wider text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  {nav.brandName1}<span className="text-primary">{nav.brandName2}</span>
                </span>
              </>
            )}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => { if (pathname === link.to) window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className={({ isActive }) =>
                  `relative px-2.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {link.label}
                {link.to === '/membership' && hasActiveOffer && (
                  <span className="absolute -top-1.5 -right-1 flex items-center gap-0.5 bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                    <span className="relative flex h-1.5 w-1.5 mr-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                    </span>
                    NEW
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-2 ml-2 pl-3 border-l border-white/10">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 bg-dark-300 border border-dark-500 hover:border-primary/50 rounded-full px-4 py-2 transition-all duration-200"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-xs font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-gray-300">{user.name?.split(' ')[0]}</span>
                </button>
                <AnimatePresence>
                  {userMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-dark-200 border border-dark-500 rounded-xl shadow-2xl overflow-hidden"
                    >
                      {user.role === 'admin' ? (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors"
                        >
                          <FaUser className="text-primary text-sm" />
                          <span className="text-sm">Admin Panel</span>
                        </Link>
                      ) : user.role === 'trainer' ? (
                        <Link
                          to="/trainer"
                          onClick={() => setUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors"
                        >
                          <FaTachometerAlt className="text-primary text-sm" />
                          <span className="text-sm">Trainer Dashboard</span>
                        </Link>
                      ) : (
                        <Link
                          to="/dashboard"
                          onClick={() => setUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-dark-300 hover:text-white transition-colors"
                        >
                          <FaTachometerAlt className="text-primary text-sm" />
                          <span className="text-sm">Dashboard</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <FaSignOutAlt className="text-sm" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white text-sm font-medium transition-colors px-4 py-2">
                  {nav.loginBtnText}
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-6">
                  {nav.joinBtnText}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
          >
            {mobileOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-dark-100/98 backdrop-blur-xl border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => { setMobileOpen(false); if (pathname === link.to) window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className={({ isActive }) =>
                    `relative flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'text-primary bg-primary/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {link.label}
                  {link.to === '/membership' && hasActiveOffer && (
                    <span className="flex items-center gap-1 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full leading-none">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                      </span>
                      NEW
                    </span>
                  )}
                </NavLink>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                {user ? (
                  <>
                    {user.role === 'admin' ? (
                      <Link to="/admin" onClick={() => setMobileOpen(false)} className="btn-secondary text-center text-sm">Admin Panel</Link>
                    ) : user.role === 'trainer' ? (
                      <Link to="/trainer" onClick={() => setMobileOpen(false)} className="btn-secondary text-center text-sm">Trainer Dashboard</Link>
                    ) : (
                      <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="btn-secondary text-center text-sm">Dashboard</Link>
                    )}
                    <button onClick={handleLogout} className="text-red-400 text-sm font-medium py-2">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-center text-sm">
                      {nav.loginBtnText}
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-center text-sm">
                      {nav.joinBtnText}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
