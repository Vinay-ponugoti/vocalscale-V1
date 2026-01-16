import posthog from 'posthog-js';
import { env } from '../config/env';

// Initialize PostHog
export const initPostHog = () => {
    if (env.POSTHOG_KEY && typeof window !== 'undefined') {
        posthog.init(env.POSTHOG_KEY, {
            api_host: env.POSTHOG_HOST,
            capture_pageview: true,
            capture_pageleave: true,
            autocapture: true,
            persistence: 'localStorage',
            // Session recording (optional - enable if you want recordings)
            enable_recording_console_log: false,
            // Privacy settings
            mask_all_text: false,
            mask_all_element_attributes: false,
        });
    }
};

// Identify user (call after login)
export const identifyUser = (userId: string, properties?: Record<string, unknown>) => {
    if (env.POSTHOG_KEY) {
        posthog.identify(userId, properties);
    }
};

// Reset user (call on logout)
export const resetUser = () => {
    if (env.POSTHOG_KEY) {
        posthog.reset();
    }
};

// Track custom events
export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
    if (env.POSTHOG_KEY) {
        posthog.capture(eventName, properties);
    }
};

// Common events for VocalScale
export const analytics = {
    // Auth events
    userSignedUp: (method: string) => trackEvent('user_signed_up', { method }),
    userLoggedIn: (method: string) => trackEvent('user_logged_in', { method }),
    userLoggedOut: () => trackEvent('user_logged_out'),

    // Business setup
    businessSetupStarted: () => trackEvent('business_setup_started'),
    businessSetupCompleted: (businessType: string) =>
        trackEvent('business_setup_completed', { business_type: businessType }),
    businessSetupStepCompleted: (step: string) =>
        trackEvent('business_setup_step_completed', { step }),

    // Subscription events
    subscriptionViewed: () => trackEvent('subscription_viewed'),
    subscriptionStarted: (plan: string, amount: number) =>
        trackEvent('subscription_started', { plan, amount }),
    subscriptionUpgraded: (from: string, to: string) =>
        trackEvent('subscription_upgraded', { from_plan: from, to_plan: to }),
    subscriptionCanceled: (plan: string) =>
        trackEvent('subscription_canceled', { plan }),

    // Call events
    callStarted: (businessId: string) => trackEvent('call_started', { business_id: businessId }),
    callCompleted: (duration: number, outcome: string) =>
        trackEvent('call_completed', { duration_seconds: duration, outcome }),
    callLogViewed: () => trackEvent('call_log_viewed'),

    // Appointment events
    appointmentBooked: (source: string) => trackEvent('appointment_booked', { source }),
    appointmentCanceled: (reason?: string) => trackEvent('appointment_canceled', { reason }),
    appointmentListViewed: () => trackEvent('appointment_list_viewed'),

    // Voice setup
    voiceSetupStarted: () => trackEvent('voice_setup_started'),
    voiceSetupCompleted: (voiceId: string) => trackEvent('voice_setup_completed', { voice_id: voiceId }),
    voiceTestPlayed: (voiceId: string) => trackEvent('voice_test_played', { voice_id: voiceId }),

    // Review events
    reviewsViewed: () => trackEvent('reviews_viewed'),
    reviewResponseGenerated: () => trackEvent('review_response_generated'),

    // Feature usage
    featureUsed: (feature: string) => trackEvent('feature_used', { feature }),
    dashboardViewed: () => trackEvent('dashboard_viewed'),
    settingsUpdated: (setting: string) => trackEvent('settings_updated', { setting }),
};

export default posthog;
