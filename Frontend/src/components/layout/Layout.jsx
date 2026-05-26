import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  const isAdmin = pathname.startsWith('/admin') || pathname === '/trainer' || pathname === '/dashboard' || pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname.startsWith('/reset-password')

  return (
    <div className="min-h-screen flex flex-col bg-dark">
      {!isAdmin && <Navbar />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isAdmin && <Footer />}
    </div>
  )
}
