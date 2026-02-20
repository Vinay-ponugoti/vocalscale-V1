import type { Session } from '../types/auth';
import { env } from '../config/env';
import { safeLocalStorage, safeSessionStorage } from './storageUtils';
import { safeDecrypt } from './cryptoUtils';
import { getDevelopmentHeaders } from '../lib/devHeaders';

const SESSION_KEY = 'voice_ai_session';
const LAST_ACTIVITY_KEY = 'voice_ai_last_activity';
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes idle timeout
const SESSION_WARNING_THRESHOLD = 5 * 60; // Show warning 5 minutes before expiry
const TOKEN_ROTATION_THRESHOLD = 15 * 60; // Rotate tokens every 15 minutes (if backend supports)

// Session metadata for security tracking
interface SessionMetadata {
  lastTokenRotation: number;
  createdAt: number;
  deviceFingerprint: string;
}

export interface SessionValidationResult {
  isValid: boolean;
  session: Session | null;
  error?: string;
  backendReachable?: boolean;
  warning?: string;
}

export interface SessionWarning {
  type: 'expiring' | 'idle' | 'rotating';
  message: string;
  timeRemaining?: number;
}

/**
 * Generate simple device fingerprint for session validation
 */
function getDeviceFingerprint(): string {
  try {
    const parts = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage,
    ];
    // Simple hash (not cryptographic, just for tracking)
    return parts.join('|').split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0).toString(36);
  } catch {
    return 'unknown';
  }
}

/**
 * Encrypt sensitive session data before storage
 *
 * DISABLED: Token encryption was causing 401 errors because the encryption
 * key is derived from browser-specific values (userAgent, screen size, etc.)
 * that can change between tabs, browser updates, or window resizes — causing
 * decryption to silently fail and send encrypted gibberish as the Bearer token.
 *
 * The Supabase JWT is already cryptographically signed. LocalStorage encryption
 * adds minimal security (XSS that reads localStorage can also read key material)
 * but causes real auth failures. Keeping functions for backward compatibility
 * with any sessions that were previously encrypted.
 */
async function encryptSensitiveSession(session: Session): Promise<Session> {
  // No longer encrypting — return session as-is
  return session;
}

/**
 * Decrypt sensitive session data after retrieval
 * Still handles previously-encrypted sessions for backward compatibility
 */
async function decryptSensitiveSession(session: Session): Promise<Session> {
  try {
    // If session was encrypted by old code, try to decrypt it
    if ((session as Session & { _encrypted?: boolean })._encrypted) {
      const decrypted: Session = { ...session };

      if (decrypted.access_token) {
        try {
          decrypted.access_token = await safeDecrypt(decrypted.access_token);
        } catch {
          // Decryption failed — token is corrupted. Clear session so user re-logs.
          console.error('Failed to decrypt access_token from old encrypted session. Clearing session.');
          await storeSession(null);
          return { ...session, access_token: '' };
        }
      }

      if (decrypted.refresh_token) {
        try {
          decrypted.refresh_token = await safeDecrypt(decrypted.refresh_token);
        } catch {
          // Non-critical — access_token is more important
          console.warn('Failed to decrypt refresh_token, continuing with access_token only');
        }
      }

      delete (decrypted as Session & { _encrypted?: boolean })._encrypted;

      // Re-store without encryption so future reads work cleanly
      const isInLocal = !!localStorage.getItem(SESSION_KEY);
      await storeSession(decrypted, isInLocal);

      return decrypted;
    }

    // Not encrypted — return as-is
    return session;
  } catch (e) {
    console.error('Failed to process session data:', e);
    // Clear corrupted session so user gets redirected to login
    await storeSession(null);
    return { ...session, access_token: '' };
  }
}

/**
 * Store session with encryption and metadata
 */
export const storeSession = async (session: Session | null, remember: boolean = true) => {
  if (session) {
    try {
      // Encrypt sensitive data
      const encryptedSession = await encryptSensitiveSession(session);

      // Add metadata
      const metadata: SessionMetadata = {
        lastTokenRotation: Date.now(),
        createdAt: Date.now(),
        deviceFingerprint: getDeviceFingerprint(),
      };

      // Combine session with metadata
      const sessionWithMeta = {
        ...encryptedSession,
        _metadata: metadata
      };

      const sessionJson = JSON.stringify(sessionWithMeta);

      if (remember) {
        safeLocalStorage.setItem(SESSION_KEY, sessionJson);
        safeSessionStorage.removeItem(SESSION_KEY);
      } else {
        safeSessionStorage.setItem(SESSION_KEY, sessionJson);
        safeLocalStorage.removeItem(SESSION_KEY);
      }

      // Update last activity timestamp
      updateLastActivity();
    } catch (e) {
      console.error('Failed to store session:', e);
    }
  } else {
    safeLocalStorage.removeItem(SESSION_KEY);
    safeSessionStorage.removeItem(SESSION_KEY);
    safeLocalStorage.removeItem(LAST_ACTIVITY_KEY);
    safeSessionStorage.removeItem(LAST_ACTIVITY_KEY);
  }
};

/**
 * Retrieve and decrypt session
 */
export const getStoredSession = async (): Promise<Session | null> => {
  // Check sessionStorage first (current tab session)
  let stored = safeSessionStorage.getItem(SESSION_KEY);

  // If not in session, check local (persistent)
  if (!stored) {
    stored = safeLocalStorage.getItem(SESSION_KEY);
  }

  if (!stored) return null;

  try {
    const sessionData = JSON.parse(stored);

    // Extract and validate metadata
    const metadata = sessionData._metadata;
    if (metadata) {
      // DISABLED fingerprint check — it was causing false "theft" detections
      // and logging users out on browser updates, window resizes, and tab switches.
      // The fingerprint uses navigator.userAgent + screen.colorDepth + timezoneOffset
      // which all change frequently. The JWT itself is signed and validated server-side,
      // making client-side fingerprint checks redundant and harmful.

      // Check if session is too old (stale)
      const age = Date.now() - metadata.createdAt;
      const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days
      if (age > maxAge) {
        console.warn('Session is too old, clearing');
        await storeSession(null);
        return null;
      }

      delete sessionData._metadata;
    }

    // Decrypt sensitive data
    const decryptedSession = await decryptSensitiveSession(sessionData);

    return decryptedSession;
  } catch (e) {
    console.error('Failed to parse stored session:', e);
    // Determine where it came from to remove it
    if (safeSessionStorage.getItem(SESSION_KEY)) {
      safeSessionStorage.removeItem(SESSION_KEY);
    } else {
      safeLocalStorage.removeItem(SESSION_KEY);
    }
    return null;
  }
};

/**
 * Get stored session synchronously (for use during initial load)
 * Note: This won't decrypt tokens - use getStoredSession() for full decryption
 */
export const getStoredSessionSync = (): Session | null => {
  let stored = safeSessionStorage.getItem(SESSION_KEY);
  if (!stored) {
    stored = safeLocalStorage.getItem(SESSION_KEY);
  }
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

/**
 * Get auth token (deprecated - use getAuthTokenAsync for decrypted token)
 */
export const getAuthToken = (): string | null => {
  const session = getStoredSessionSync();
  return session?.access_token || null;
};

/**
 * Get auth token asynchronously (properly decrypted)
 */
export const getAuthTokenAsync = async (): Promise<string | null> => {
  const session = await getStoredSession();
  return session?.access_token || null;
};

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  [key: string]: unknown;
}

interface ValidationResponse {
  user_id?: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    picture?: string;
  };
}

export const fetchUserProfile = async (accessToken: string): Promise<UserProfile | null> => {
  try {
    const response = await fetch(`${env.API_URL}/auth/validate`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        ...getDevelopmentHeaders()
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.status}`);
    }

    const data: ValidationResponse = await response.json();

    if (!data.user_id) {
      console.warn('[fetchUserProfile] No user_id in validation response:', Object.keys(data));
      return null;
    }

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

/**
 * Update last activity timestamp
 */
export const updateLastActivity = () => {
  const timestamp = Date.now();
  safeSessionStorage.setItem(LAST_ACTIVITY_KEY, timestamp.toString());

  // Also update in localStorage if using persistent session
  const stored = safeLocalStorage.getItem(SESSION_KEY);
  if (stored) {
    safeLocalStorage.setItem(LAST_ACTIVITY_KEY, timestamp.toString());
  }
};

/**
 * Get time since last activity
 */
export const getIdleTime = (): number => {
  const sessionTime = safeSessionStorage.getItem(LAST_ACTIVITY_KEY);
  const localTime = safeLocalStorage.getItem(LAST_ACTIVITY_KEY);

  const latestTime = sessionTime || localTime;
  if (!latestTime) return 0;

  try {
    return Date.now() - parseInt(latestTime, 10);
  } catch {
    return 0;
  }
};

/**
 * Check if session is idle (user inactive for too long)
 */
export const isSessionIdle = (timeoutMs: number = IDLE_TIMEOUT_MS): boolean => {
  return getIdleTime() > timeoutMs;
};

/**
 * Get session warning if any
 */
export const getSessionWarning = async (): Promise<SessionWarning | null> => {
  const session = await getStoredSession();

  if (!session) {
    return null;
  }

  // Check idle timeout
  const idleTime = getIdleTime();
  const idleWarningThreshold = IDLE_TIMEOUT_MS - (5 * 60 * 1000); // 5 minutes before timeout

  if (idleTime > idleWarningThreshold) {
    const remainingMinutes = Math.max(0, Math.ceil((IDLE_TIMEOUT_MS - idleTime) / 60000));
    return {
      type: 'idle',
      message: `You've been inactive. Your session will expire in ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}.`,
      timeRemaining: IDLE_TIMEOUT_MS - idleTime
    };
  }

  // Check session expiry warning
  const remainingSeconds = getSessionTimeRemaining(session);
  if (remainingSeconds > 0 && remainingSeconds < SESSION_WARNING_THRESHOLD) {
    const minutes = Math.floor(remainingSeconds / 60);
    return {
      type: 'expiring',
      message: `Your session will expire in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
      timeRemaining: remainingSeconds * 1000
    };
  }

  return null;
};

/**
 * Validate session with enhanced security checks
 */
export const validateSession = async (): Promise<SessionValidationResult> => {
  const session = await getStoredSession();

  if (!session) {
    return {
      isValid: false,
      session: null,
      error: 'No active session'
    };
  }

  // Check idle timeout
  if (isSessionIdle()) {
    console.warn('Session idle timeout exceeded. Clearing session.');
    await storeSession(null);
    return {
      isValid: false,
      session: null,
      error: 'Session expired due to inactivity',
      backendReachable: true
    };
  }

  // Update activity timestamp on validation
  updateLastActivity();

  // Check local expiration first
  if (isSessionExpired(session)) {
    console.warn('Session expired (local check). Clearing storage.');
    await storeSession(null);
    return {
      isValid: false,
      session: null,
      error: 'Session expired',
      backendReachable: true
    };
  }

  // Backend validation
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${env.API_URL}/auth/validate`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        ...getDevelopmentHeaders()
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('Backend session validation failed:', response.status);

      if (response.status === 401) {
        console.error('Session expired (401). Clearing stored session.');
        await storeSession(null);
        return {
          isValid: false,
          session: null,
          error: 'Session expired',
          backendReachable: true
        };
      }

      return {
        isValid: true,
        session,
        error: `Backend error (${response.status})`,
        backendReachable: false
      };
    }

    const validationData = await response.json();

    if (validationData.user_id) {
      session.user = {
        ...session.user,
        id: validationData.user_id,
        email: validationData.email || session.user?.email || '',
        full_name: validationData.user_metadata?.full_name || session.user?.full_name || '',
        avatar_url: validationData.user_metadata?.avatar_url || validationData.user_metadata?.picture || '',
      };

      // Check if token needs rotation
      const shouldRotate = shouldRotateToken();
      if (shouldRotate) {
        console.log('Token rotation advised (backend support required)');
        // Note: Actual rotation requires backend endpoint support
      }

      await storeSession(session, safeLocalStorage.getItem(SESSION_KEY) === JSON.stringify(session));
    }

    return {
      isValid: true,
      session,
      backendReachable: true
    };

  } catch (e: unknown) {
    const isAbort = e instanceof Error && e.name === 'AbortError';
    console.error(isAbort ? 'Session validation timed out' : 'Backend unreachable:', e);

    return {
      isValid: true,
      session,
      error: isAbort ? 'Validation timeout' : 'Network error',
      backendReachable: false
    };
  }
};

/**
 * Check if token should be rotated
 */
function shouldRotateToken(): boolean {
  // Try to get metadata from stored data
  const stored = safeSessionStorage.getItem(SESSION_KEY) || safeLocalStorage.getItem(SESSION_KEY);
  if (!stored) return false;

  try {
    const sessionData = JSON.parse(stored);
    const metadata = sessionData._metadata as SessionMetadata | undefined;

    if (metadata?.lastTokenRotation) {
      const age = Date.now() - metadata.lastTokenRotation;
      return age > TOKEN_ROTATION_THRESHOLD * 1000;
    }
  } catch {
    // Ignore parse errors
  }

  return false;
}

/**
 * Rotate access token (requires backend support)
 * Call this after a successful API response that returns a new token
 */
export const rotateAccessToken = async (newToken: string, newRefreshToken?: string): Promise<void> => {
  const session = await getStoredSession();
  if (!session) return;

  const now = Date.now();
  const stored = safeSessionStorage.getItem(SESSION_KEY) || safeLocalStorage.getItem(SESSION_KEY);
  const remember = !!safeLocalStorage.getItem(SESSION_KEY);

  try {
    const sessionData = JSON.parse(stored || '{}') as Record<string, unknown>;
    const metadata = sessionData._metadata as SessionMetadata | undefined;

    const updatedSession = {
      ...session,
      access_token: newToken,
      refresh_token: newRefreshToken || session.refresh_token,
      _metadata: {
        lastTokenRotation: now,
        createdAt: metadata?.createdAt || now,
        deviceFingerprint: metadata?.deviceFingerprint || getDeviceFingerprint()
      }
    };

    await storeSession(updatedSession, remember);
    console.log('Access token rotated successfully');
  } catch (e) {
    console.error('Failed to rotate token:', e);
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

/**
 * Hook-like function to set up activity tracking
 * Call this in your app root or auth context
 */
export const setupActivityTracking = (onIdle?: () => void, checkInterval: number = 60000) => {
  // Update activity on various user actions
  const activityEvents = [
    'mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'
  ];

  const handler = () => updateLastActivity();

  activityEvents.forEach(event => {
    document.addEventListener(event, handler, { passive: true });
  });

  // Periodic idle check
  const intervalId = setInterval(() => {
    if (isSessionIdle() && onIdle) {
      onIdle();
    }
  }, checkInterval);

  // Return cleanup function
  return () => {
    activityEvents.forEach(event => {
      document.removeEventListener(event, handler);
    });
    clearInterval(intervalId);
  };
};
