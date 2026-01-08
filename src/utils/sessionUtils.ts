import type { Session } from '../types/auth';
import { env } from '../config/env';

const SESSION_KEY = 'voice_ai_session';

export interface SessionValidationResult {
  isValid: boolean;
  session: Session | null;
  error?: string;
  backendReachable?: boolean;
}

export const storeSession = (session: Session | null) => {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

export const getStoredSession = (): Session | null => {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse stored session:', e);
    return null;
  }
};

export const getAuthToken = (): string | null => {
  const session = getStoredSession();
  return session?.access_token || null;
};

export const validateSession = async (): Promise<SessionValidationResult> => {
  const session = getStoredSession();

  if (!session) {
    return {
      isValid: false,
      session: null,
      error: 'No active session'
    };
  }

  // Backend validation - enforce backend dependency
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // Short timeout for backend check
    
    const response = await fetch(`${env.API_URL}/auth/validate`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'ngrok-skip-browser-warning': 'true'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('Backend session validation failed:', response.status);
      // If 401, session is definitely invalid
      if (response.status === 401) {
        storeSession(null);
        return {
          isValid: false,
          session: null,
          error: 'Session invalid or expired',
          backendReachable: true
        };
      }
      return {
        isValid: false,
        session: null,
        error: `Backend session validation failed (${response.status})`,
        backendReachable: response.status !== 502 && response.status !== 503 && response.status !== 504
      };
    }
    
    // Parse the validation response to get user data
    const validationData = await response.json();
    
    // If session is valid, ensure user object is populated
    if (!session.user && validationData.user_id) {
      session.user = {
        id: validationData.user_id,
        email: validationData.email || '',
        // Add other defaults as needed
      };
      // Update local storage with the user data
      storeSession(session);
    }
    
    // If it's valid, check local expiry just in case
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at;

    if (expiresAt && now >= expiresAt) {
        // Here we would normally refresh the session via backend
        // For now, let's just mark it invalid if expired
        storeSession(null);
        return {
          isValid: false,
          session: null,
          error: 'Session expired locally'
        };
    }

    return {
      isValid: true,
      session,
      backendReachable: true
    };

  } catch (e: unknown) {
    console.error('Backend unreachable during session validation:', e);
    return {
      isValid: false,
      session: null,
      error: 'Backend unreachable',
      backendReachable: false
    };
  }
};

export const isSessionExpired = (session: Session | null): boolean => {
  if (!session || !session.expires_at) return true;
  const now = Math.floor(Date.now() / 1000);
  return now >= session.expires_at;
};

export const getSessionTimeRemaining = (session: Session | null): number => {
  if (!session || !session.expires_at) return 0;
  const now = Math.floor(Date.now() / 1000);
  const remaining = session.expires_at - now;
  return Math.max(0, remaining);
};

export const formatSessionTimeRemaining = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};
