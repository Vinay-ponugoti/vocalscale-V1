import type { Session } from '../types/auth';
import { env } from '../config/env';
import { safeLocalStorage } from './storageUtils';

const SESSION_KEY = 'voice_ai_session';

export interface SessionValidationResult {
  isValid: boolean;
  session: Session | null;
  error?: string;
  backendReachable?: boolean;
}

export const storeSession = (session: Session | null) => {
  if (session) {
    safeLocalStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    safeLocalStorage.removeItem(SESSION_KEY);
  }
};

export const getStoredSession = (): Session | null => {
  const stored = safeLocalStorage.getItem(SESSION_KEY);
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
  console.log(`DEBUG: getAuthToken - session exists: ${!!session}, access_token exists: ${!!session?.access_token}`);
  return session?.access_token || null;
};

export const fetchUserProfile = async (accessToken: string): Promise<any> => {
  try {
    const response = await fetch(`${env.API_URL}/auth/validate`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.status}`);
    }

    const data = await response.json();
    return {
      id: data.user_id,
      email: data.email || '',
      full_name: data.user_metadata?.full_name || '',
      avatar_url: data.user_metadata?.avatar_url || data.user_metadata?.picture || '',
    };
  } catch (e) {
    console.error('Error fetching user profile:', e);
    return null;
  }
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

  // Check local expiration first for immediate feedback
  if (isSessionExpired(session)) {
    console.warn('Session expired (local check). Clearing storage.');
    storeSession(null);
    return {
      isValid: false,
      session: null,
      error: 'Session expired',
      backendReachable: true
    };
  }

  // Backend validation - enforce backend dependency
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout for backend check (increased from 2s)

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

      // CRITICAL: If 401, session is definitely invalid/expired.
      // We MUST clear it to trigger a redirect.
      if (response.status === 401) {
        console.error('Session expired (401). Clearing stored session.');
        storeSession(null);
        return {
          isValid: false,
          session: null,
          error: 'Session expired',
          backendReachable: true
        };
      }

      // For other errors (5xx, etc), we might be in a temporary glitch.
      // We keep the local session but flag the backend status.
      return {
        isValid: true,
        session,
        error: `Backend error (${response.status})`,
        backendReachable: false
      };
    }

    // Parse the validation response to get user data
    const validationData = await response.json();

    if (validationData.user_id) {
      session.user = {
        ...session.user,
        id: validationData.user_id,
        email: validationData.email || session.user?.email || '',
        full_name: validationData.user_metadata?.full_name || session.user?.full_name || '',
        avatar_url: validationData.user_metadata?.avatar_url || validationData.user_metadata?.picture || '',
      };
      storeSession(session);
    }

    return {
      isValid: true,
      session,
      backendReachable: true
    };

  } catch (e: unknown) {
    // Handle network errors (offline, etc)
    const isAbort = e instanceof Error && e.name === 'AbortError';
    console.error(isAbort ? 'Session validation timed out' : 'Backend unreachable:', e);

    return {
      isValid: true, // Keep session alive - don't logout if internet is just flaky
      session,
      error: isAbort ? 'Validation timeout' : 'Network error',
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
