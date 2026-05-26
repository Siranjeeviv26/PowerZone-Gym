import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return null
}
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Trainers from './pages/Trainers'
import Membership from './pages/Membership'
import BMICalculator from './pages/BMICalculator'
import Workouts from './pages/Workouts'
import DietPlans from './pages/DietPlans'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import UserDashboard from './pages/UserDashboard'
import TrainerDashboard from './pages/TrainerDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsers from './pages/admin/ManageUsers'
import ManageTrainers from './pages/admin/ManageTrainers'
import ManagePlans from './pages/admin/ManagePlans'
import ManageBranches from './pages/admin/ManageBranches'
import ManageWorkouts from './pages/admin/ManageWorkouts'
import ManageDietPlans from './pages/admin/ManageDietPlans'
import ManageGallery from './pages/admin/ManageGallery'
import ManageTransfer from './pages/admin/ManageTransfer'
import ManageFooter from './pages/admin/ManageFooter'
import ManageLegal from './pages/admin/ManageLegal'
import ManageTestimonials from './pages/admin/ManageTestimonials'
import ManageActivities from './pages/admin/ManageActivities'
import ManageContent from './pages/admin/ManageContent'
import ManageNavbar from './pages/admin/ManageNavbar'
import ManageTheme from './pages/admin/ManageTheme'
import ManageMasterData from './pages/admin/ManageMasterData'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Branches from './pages/Branches'
import ProtectedRoute from './components/shared/ProtectedRoute'
import AdminRoute from './components/shared/AdminRoute'
import TrainerRoute from './components/shared/TrainerRoute'

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a1a1a', color: '#fff', border: '1px solid #333' },
          success: { iconTheme: { primary: 'rgb(var(--color-primary))', secondary: '#fff' } },
        }}
      />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="trainers" element={<Trainers />} />
          <Route path="membership" element={<Membership />} />
          <Route path="bmi-calculator" element={<BMICalculator />} />
          <Route path="workouts" element={<Workouts />} />
          <Route path="diet-plans" element={<DietPlans />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="branches" element={<Branches />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="trainer" element={<TrainerRoute><TrainerDashboard /></TrainerRoute>} />
          <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
          <Route path="admin/trainers" element={<AdminRoute><ManageTrainers /></AdminRoute>} />
          <Route path="admin/plans" element={<AdminRoute><ManagePlans /></AdminRoute>} />
          <Route path="admin/branches" element={<AdminRoute><ManageBranches /></AdminRoute>} />
          <Route path="admin/workouts" element={<AdminRoute><ManageWorkouts /></AdminRoute>} />
          <Route path="admin/diet-plans" element={<AdminRoute><ManageDietPlans /></AdminRoute>} />
          <Route path="admin/gallery" element={<AdminRoute><ManageGallery /></AdminRoute>} />
          <Route path="admin/transfer" element={<AdminRoute><ManageTransfer /></AdminRoute>} />
          <Route path="admin/footer" element={<AdminRoute><ManageFooter /></AdminRoute>} />
          <Route path="admin/legal" element={<AdminRoute><ManageLegal /></AdminRoute>} />
          <Route path="admin/testimonials" element={<AdminRoute><ManageTestimonials /></AdminRoute>} />
          <Route path="admin/activities" element={<AdminRoute><ManageActivities /></AdminRoute>} />
          <Route path="admin/content" element={<AdminRoute><ManageContent /></AdminRoute>} />
          <Route path="admin/navbar" element={<AdminRoute><ManageNavbar /></AdminRoute>} />
          <Route path="admin/theme" element={<AdminRoute><ManageTheme /></AdminRoute>} />
          <Route path="admin/master-data" element={<AdminRoute><ManageMasterData /></AdminRoute>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
