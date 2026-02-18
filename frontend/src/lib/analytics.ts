// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trackEvent = (action: string, params: Record<string, any>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window !== 'undefined' && (window as any).gtag) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).gtag('event', action, params);
  }
};

export const trackLeadGeneration = () => {
  trackEvent('generate_lead', {
    event_category: 'engagement',
    event_label: 'Contact Form'
  });
};

export const trackStartDemo = () => {
  trackEvent('start_demo', {
    event_category: 'engagement',
    event_label: 'Button Click'
  });
};

export const trackViewPricing = () => {
  trackEvent('view_pricing', {
    event_category: 'ecommerce',
    event_label: 'Pricing Page'
  });
};

export const trackSignupComplete = (value: number = 299) => {
  trackEvent('signup_complete', {
    event_category: 'conversion',
    event_label: 'Signup',
    value: value
  });
};
