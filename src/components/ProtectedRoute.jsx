import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) return <p className="p-8">Checking auth...</p>
  if (!session) return <Navigate to="/login" replace />

  return children
}

export default ProtectedRoute