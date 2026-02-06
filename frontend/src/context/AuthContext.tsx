import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Session, User } from '../types/auth';
import {
  validateSession as validateSessionUtil,
  storeSession
} from '../utils/sessionUtils';
import { safeLocalStorage, safeSessionStorage } from '../utils/storageUtils';
import { env } from '../config/env';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  isSigningOut: boolean;
  securityMessage: string | null;
  signOut: () => Promise<void>;
  isConfigured: boolean;
  refreshSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  validateSession: () => Promise<void>;
  setAuthSession: (session: Session) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isSigningOut: false,
  securityMessage: null,
  signOut: async () => { },
  isConfigured: true,
  refreshSession: async () => { },
  refreshProfile: async () => { },
  validateSession: async () => { },
  setAuthSession: () => { }
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const mounted = useRef(true);
  const sessionRef = useRef<Session | null>(null);

  // Sync sessionRef with session state
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const refreshProfile = useCallback(async (manualSession?: Session) => {
    const currentSession = manualSession || sessionRef.current;
    if (!currentSession?.access_token) return;

    try {
      const response = await fetch(`${env.API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${currentSession.access_token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (mounted.current) {
          setProfile(data);
          setProfile(data);
        }
      }
    } catch (err) {
      console.error("Error refreshing profile:", err);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    setSecurityMessage("Refreshing security session...");
    try {
      const { isValid, session: validatedSession } = await validateSessionUtil();

      if (mounted.current) {
        // Keep session if valid, regardless of backend reachability
        if (isValid && validatedSession) {
          setSession(validatedSession);
          setUser(validatedSession.user ?? null);
          storeSession(validatedSession);
          refreshProfile(validatedSession);
        } else {
          setSession(null);
          setUser(null);
          storeSession(null);
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      if (mounted.current) {
        setSession(null);
        setUser(null);
        storeSession(null);
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
        setSecurityMessage(null);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;

    const syncGoogleTokens = async (session: Session) => {
      // Only sync if we have a provider token (indicates OAuth login)
      if (!session.provider_token) return;


      try {
        const response = await fetch(`${env.API_URL}/auth/google-sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({
            access_token: session.provider_token,
            refresh_token: session.provider_refresh_token,
            expires_in: session.expires_in,
            full_name: session.user?.user_metadata?.full_name,
            avatar_url: session.user?.user_metadata?.avatar_url
          })
        });

        if (!response.ok) {
          // Silent failure for sync is acceptable
        }
      } catch {
        // Silent
      }
    };

    const initializeAuth = async () => {
      setSecurityMessage("Verifying security credentials...");
      try {
        const { isValid, session: validatedSession } = await validateSessionUtil();

        if (mounted.current) {
          // CRITICAL FIX: Keep session if valid, even if backend temporarily unreachable
          // This prevents logout on fast refresh when backend is slow to respond
          if (isValid && validatedSession) {
            setSession(validatedSession);
            setUser(validatedSession.user ?? null);

            // Sync tokens if this is a fresh login or session check
            syncGoogleTokens(validatedSession);

            // Unified profile refresh for all users
            refreshProfile(validatedSession);

            // Unified profile refresh for all users
            refreshProfile(validatedSession);
          } else {
            // Only clear session if explicitly invalid (401 from backend)
            setSession(null);
            setUser(null);
            storeSession(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted.current) {
          setSession(null);
          setUser(null);
          storeSession(null);
        }
      } finally {
        if (mounted.current) {
          setLoading(false);
          setSecurityMessage(null);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted.current = false;
    };
  }, []); // Run only once on mount

  // Heartbeat interval for security + Window Focus Re-validation
  useEffect(() => {
    if (!session) return;

    let lastCheck = 0;
    const checkSession = async (force = false) => {
      const now = Date.now();
      // Debounce: don't check more than once every 10 seconds unless forced
      if (!force && now - lastCheck < 10000) return;
      lastCheck = now;

      if (mounted.current && session) {
        try {
          // Verify with backend directly
          const { isValid } = await validateSessionUtil();

          // Only logout if session is explicitly invalid (not just unreachable)
          if (mounted.current && !isValid) {
            console.warn('Security check detected invalid session. Redirecting to login.');
            setSession(null);
            setUser(null);
            storeSession(null);
          }
        } catch (error) {
          console.error('Error during security check:', error);
        }
      }
    };

    // 1. Regular heartbeat (every minute)
    const interval = setInterval(() => checkSession(), 60000);

    // 2. Proactive check on window focus or visibility change
    const handleFocus = () => {
      // Use standard debounce (false) to prevent 429 spam on rapid switching
      checkSession(false);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Use standard debounce (false) to prevent 429 spam
        checkSession(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [session]); // Restart heartbeat only when session changes

  const signOut = async () => {
    if (mounted.current) {
      setIsSigningOut(true);
      setLoading(true);
      setSecurityMessage("Signing out safely...");
    }

    try {
      const token = session?.access_token;

      // Call backend to invalidate session if needed
      if (token) {
        await fetch(`${env.API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        }).catch(() => null);
      }

      if (mounted.current) {
        // 1. Clear React state
        setSession(null);
        setUser(null);

        // 2. Clear ALL localStorage safely
        safeLocalStorage.clear();

        // 3. Clear sessionStorage safely
        safeSessionStorage.clear();

        // 4. Clear React Query cache completely
        const queryClient = (window as any).__reactQueryClient;
        if (queryClient) {
          queryClient.clear();
        }
      }
    } catch (error) {
      console.error('Error signing out:', error);
      // Still clear data even on error
      if (mounted.current) {
        safeLocalStorage.clear();
        safeSessionStorage.clear();
        setSession(null);
        setUser(null);
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
        setSecurityMessage(null);
        setIsSigningOut(false);
      }
    }
  };

  const validateSession = useCallback(async () => {
    setSecurityMessage("Verifying session...");
    try {
      const { isValid, session: validatedSession, backendReachable } = await validateSessionUtil();

      if (mounted.current) {
        if (!isValid || !validatedSession || !backendReachable) {
          setSession(null);
          setUser(null);
          storeSession(null);
        } else {
          setSession(validatedSession);
          setUser(validatedSession.user ?? null);
          storeSession(validatedSession);
        }
      }
    } catch (error) {
      console.error('Error validating session:', error);
    } finally {
      if (mounted.current) {
        setSecurityMessage(null);
      }
    }
  }, []);

  const setAuthSession = useCallback((newSession: Session) => {
    if (mounted.current) {
      setSession(newSession);
      setUser(newSession.user ?? null);
      storeSession(newSession);
      setLoading(false);
      setSecurityMessage(null);

      // Trigger token sync immediately on explicit session set (e.g. after login)
      if (newSession.provider_token) {
        // We redefine the sync function here or reuse a memoized version if we lifted it up.
        // For simplicity and to avoid stale closures, we can re-implement the fetch here or useCallback the sync function.
        // Let's implement the fetch directly to be safe.
        (async () => {
          try {
            await fetch(`${env.API_URL}/auth/google-sync`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${newSession.access_token}`,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
              },
              body: JSON.stringify({
                access_token: newSession.provider_token,
                refresh_token: newSession.provider_refresh_token,
                expires_in: newSession.expires_in,
                full_name: newSession.user?.user_metadata?.full_name,
                avatar_url: newSession.user?.user_metadata?.avatar_url
              })
            });
            refreshProfile(newSession);
          } catch (e) {
            console.error("Background token sync failed", e);
            refreshProfile(newSession);
          }
        })();
      } else {
        refreshProfile(newSession);
      }
    }
  }, [refreshProfile]);

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      loading,
      isSigningOut,
      securityMessage,
      signOut,
      isConfigured: true,
      refreshSession,
      refreshProfile,
      validateSession,
      setAuthSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use this context easily
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};
