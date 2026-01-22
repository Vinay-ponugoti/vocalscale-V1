import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSessionExpired } from '../utils/sessionUtils';
import { DashboardSkeleton } from './ui/DashboardSkeleton';

export default function ProtectedRoute() {
  const { user, loading, session, isSigningOut } = useAuth();
  const location = useLocation();

  if (isSigningOut) return null; // Prevent flash during signout
  if (loading) return <DashboardSkeleton />;

  if (!user || !session || isSessionExpired(session)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
