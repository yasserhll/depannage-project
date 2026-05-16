import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/auth.types';
import { Spinner } from '@/components/common/Spinner';

interface AuthGuardProps {
  requiredRole?: UserRole;
}

export function AuthGuard({ requiredRole }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/connexion" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    const roleHome: Record<UserRole, string> = {
      client:    '/client',
      depanneur: '/depanneur',
      admin:     '/admin',
    };
    return <Navigate to={roleHome[user.role]} replace />;
  }

  return <Outlet />;
}
