import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Session, User } from '../types/auth';
import {
  validateSession as validateSessionUtil,
  storeSession
} from '../utils/sessionUtils';
import { env } from '../config/env';
import { identifyUser, resetUser, analytics } from '../lib/posthog';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  securityMessage: string | null;
  signOut: () => Promise<void>;
  isConfigured: boolean;
  refreshSession: () => Promise<void>;
  validateSession: () => Promise<void>;
  setAuthSession: (session: Session) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  securityMessage: null,
  signOut: async () => { },
  isConfigured: true,
  refreshSession: async () => { },
  validateSession: async () => { },
  setAuthSession: () => { }
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const mounted = useRef(true);

  const refreshSession = useCallback(async () => {
    setSecurityMessage("Refreshing security session...");
    try {
      const { isValid, session: validatedSession, backendReachable } = await validateSessionUtil();

      if (mounted.current) {
        if (isValid && validatedSession && backendReachable) {
          setSession(validatedSession);
          setUser(validatedSession.user ?? null);
          storeSession(validatedSession);
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

    const initializeAuth = async () => {
      setSecurityMessage("Verifying security credentials...");
      try {
        const { isValid, session: validatedSession, backendReachable } = await validateSessionUtil();

        if (mounted.current) {
          if (isValid && validatedSession && backendReachable) {
            setSession(validatedSession);
            setUser(validatedSession.user ?? null);
            // Identify user in PostHog
            if (validatedSession.user?.id) {
              identifyUser(validatedSession.user.id, {
                email: validatedSession.user.email,
                name: validatedSession.user.full_name,
              });
            }
            console.log("Auth initialized successfully with backend validation");
          } else {
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

  // Heartbeat interval for security
  useEffect(() => {
    if (!session) return;

    const sessionCheckInterval = setInterval(async () => {
      if (mounted.current && session) {
        try {
          // Verify with backend directly
          const { isValid, backendReachable } = await validateSessionUtil();

          if (mounted.current && (!isValid || !backendReachable)) {
            console.warn('Security heartbeat failed. Logging out.');
            setSession(null);
            setUser(null);
            storeSession(null);
          }
        } catch (error) {
          console.error('Error during security heartbeat:', error);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(sessionCheckInterval);
  }, [session]); // Restart heartbeat only when session changes

  const signOut = async () => {
    setLoading(true);
    setSecurityMessage("Signing out safely...");
    try {
      // Call backend to invalidate session if needed
      await fetch(`${env.API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      }).catch(() => null);

      if (mounted.current) {
        setSession(null);
        setUser(null);
        storeSession(null);
        // Reset PostHog user
        resetUser();
        analytics.userLoggedOut();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      if (mounted.current) {
        setLoading(false);
        setSecurityMessage(null);
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
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      session,
      user,
      loading,
      securityMessage,
      signOut,
      isConfigured: true,
      refreshSession,
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
