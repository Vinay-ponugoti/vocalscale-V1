import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationGuardProps {
  isAuthenticated: boolean;
}

export const NavigationGuard = ({ isAuthenticated }: NavigationGuardProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    const handlePopState = (event: PopStateEvent) => {
      const currentPath = location.pathname;

      if (currentPath.startsWith('/dashboard') || currentPath.startsWith('/dashboard/')) {
        event.preventDefault();
        window.history.pushState(null, '', currentPath);
        return false;
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, location, navigate]);

  return null;
};
