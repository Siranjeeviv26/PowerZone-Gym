import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export default function TrainerRoute({ children }) {
  const { user } = useSelector((s) => s.auth)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'trainer' && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}
