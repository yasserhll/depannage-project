import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/auth.types';
import { Spinner } from '@/components/common/Spinner';

const ROLE_HOME: Record<UserRole, string> = {
  client:    '/client',
  depanneur: '/depanneur',
  admin:     '/admin',
};

export function GuestGuard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={ROLE_HOME[user.role]} replace />;
  }

  return <Outlet />;
}
