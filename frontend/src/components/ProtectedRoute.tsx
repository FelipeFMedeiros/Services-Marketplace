import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireRole?: 'CLIENT' | 'PROVIDER';
    redirectTo?: string;
}

export function ProtectedRoute({ 
    children, 
    requireAuth = true, 
    requireRole,
    redirectTo = '/login' 
}: ProtectedRouteProps) {
    const { user, loading, isAuthenticated } = useAuth();

    // Mostra loading enquanto verifica autenticação
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Verifica se requer autenticação
    if (requireAuth && !isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    // Verifica se requer role específica
    if (requireRole && user?.role !== requireRole) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
