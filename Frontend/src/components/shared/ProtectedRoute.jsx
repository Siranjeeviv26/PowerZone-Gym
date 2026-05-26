import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function ProtectedRoute({ children }) {
  const { user } = useSelector((s) => s.auth)
  return user ? children : <Navigate to="/login" replace />
}
