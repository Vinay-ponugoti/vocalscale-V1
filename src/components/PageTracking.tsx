import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { metrics } from '../lib/metrics';

export const PageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    metrics.trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
};
