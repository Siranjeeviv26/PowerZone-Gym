import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function AdminRoute({ children }) {
  const { user } = useSelector((s) => s.auth)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}
