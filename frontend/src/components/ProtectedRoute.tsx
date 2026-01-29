import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

interface ProtectedRouteProps {
    children: React.ReactNode
    adminOnly?: boolean
}

export function ProtectedRoute({ children, adminOnly }: ProtectedRouteProps) {
    const { isAuthenticated, isAdmin } = useAuthStore()
    const location = useLocation()

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace />
    }

    return <>{children}</>
}

export default ProtectedRoute
