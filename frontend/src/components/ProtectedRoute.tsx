import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSessionExpired } from '../utils/sessionUtils';
import { PageLoader } from './ui/PageLoader';

export default function ProtectedRoute() {
  const { user, loading, session } = useAuth();
  const location = useLocation();
  
  if (loading) return <PageLoader />;
  
  if (!user || !session || isSessionExpired(session)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
