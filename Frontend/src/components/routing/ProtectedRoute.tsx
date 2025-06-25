import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { UserRole } from '@/types';
import { ROUTES } from '@/config/routes';
import { LoadingSpinner } from '../ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, isAuthenticated, isLoading, selectedEvent } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />;
  }

  // Admin panel permission logic (same as Header)
  if (
    location.pathname === ROUTES.ADMIN.DASHBOARD &&
    (!user || !selectedEvent)
  ) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // if (roles && (!user?.role || !roles.includes(user.role))) {
  //   return <Navigate to={ROUTES.HOME} replace />;
  // }

  return <>{children}</>;
};

export default ProtectedRoute;
