import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { metrics } from '../lib/metrics';

export const PageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    metrics.trackPageView(location.pathname);

    // GA4 page_view for SPA route changes (initial load is tracked by the
    // gtag('config') call in index.html)
    const gtag = (window as any).gtag;
    if (typeof gtag === 'function') {
      gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location.pathname, location.search]);

  return null;
};
