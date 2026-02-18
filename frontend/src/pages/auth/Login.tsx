import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import { isSessionExpired } from '../../utils/sessionUtils';
import Button from '../../components/ui/Button';
import TurnstileWidget from '../../components/ui/TurnstileWidget';
import ServiceStatusPage from '../../components/ui/ServiceStatusPage';
import { getDevelopmentHeaders } from '../../lib/devHeaders';

const Login = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isConfigured, securityMessage, session, setAuthSession } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (session && !isSessionExpired(session)) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, navigate]);

  // Form state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [serviceDown, setServiceDown] = useState(false);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // Rate limiting tracking
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lastFailedAttempt, setLastFailedAttempt] = useState<number>(0);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);

  // Form submission prevention
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const p = password;
    if (!p) return { score: 0, label: 'Weak', color: 'bg-slate-200', textColor: 'text-slate-400' };
    
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;

    // Max score is 4 for display
    const displayScore = Math.min(4, Math.floor(score / 1.5));

    const strengthMap = [
      { score: 0, label: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-500' },
      { score: 1, label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-500' },
      { score: 2, label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
      { score: 3, label: 'Good', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
      { score: 4, label: 'Strong', color: 'bg-green-600', textColor: 'text-green-600' }
    ];

    return strengthMap[displayScore];
  }, [password]);

  // Rate limit cooldown effect
  useEffect(() => {
    if (rateLimitCooldown > 0) {
      const timer = setInterval(() => {
        setRateLimitCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [rateLimitCooldown]);

  // Check rate limit
  const isRateLimited = useMemo(() => {
    if (rateLimitCooldown > 0) return true;
    
    // Lock out after 5 failed attempts for 5 minutes
    if (failedAttempts >= 5) {
      const timeSinceLastFail = Date.now() - lastFailedAttempt;
      if (timeSinceLastFail < 5 * 60 * 1000) {
        setRateLimitCooldown(Math.ceil((5 * 60 * 1000 - timeSinceLastFail) / 1000));
        return true;
      } else {
        // Reset after cooldown expires
        setFailedAttempts(0);
      }
    }
    return false;
  }, [failedAttempts, lastFailedAttempt, rateLimitCooldown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Prevent form resubmission
    if (isSubmitting || loading) {
      console.warn('Form submission already in progress');
      return;
    }

    // Check rate limit
    if (isRateLimited) {
      const msg = `Too many attempts. Please wait ${Math.ceil(rateLimitCooldown / 60)} minute${rateLimitCooldown > 60 ? 's' : ''}.`;
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    if (!isConfigured) {
      const msg = 'Service unavailable.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const msg = 'Please enter a valid email address.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    // Validate password
    if (!password || password.length < 6) {
      const msg = 'Password must be at least 6 characters.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    if (turnstileSiteKey && !turnstileToken) {
      const msg = 'Please complete the security verification.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    setServiceDown(false);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
          cf_turnstile_response: turnstileToken,
        }),
      });

      if (!response.ok) {
        // Detect service unavailable (500 from backend = likely Supabase down)
        if (response.status >= 500) {
          setServiceDown(true);
          return;
        }
        
        // Track failed attempts for rate limiting
        setFailedAttempts(prev => prev + 1);
        setLastFailedAttempt(Date.now());
        
        let errorMsg = 'Invalid email or password.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorMsg;
          
          // Check for rate limit message from server
          if (response.status === 429) {
            errorMsg = errorData.detail || 'Too many login attempts. Please try again later.';
          }
        } catch { /* ignore parse errors */ }
        
        throw new Error(errorMsg);
      }

      const responseData = await response.json();
      const { session } = responseData;

      if (session && (session.access_token || session.refresh_token)) {
        // Reset failed attempts on success
        setFailedAttempts(0);
        setLastFailedAttempt(0);
        
        setAuthSession(session, rememberMe);

        // Prefetch critical dashboard data
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const authHeaders = {
          'Authorization': `Bearer ${session.access_token}`,
          ...getDevelopmentHeaders()
        };

        queryClient.prefetchQuery({
          queryKey: ['dashboard', dateStr, 7],
          queryFn: async () => {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/stats?date=${now.toISOString()}&days=7`, {
              headers: authHeaders
            });
            return response.json();
          }
        });

        showToast('Welcome back!', 'success');
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error('Session could not be established.');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to connect to authentication server.';
      // Detect network errors that suggest service is down
      if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('timed out')) {
        setServiceDown(true);
      } else {
        setError(message);
        showToast(message, 'error');
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isRateLimited) {
      const msg = `Too many attempts. Please wait ${Math.ceil(rateLimitCooldown / 60)} minute${rateLimitCooldown > 60 ? 's' : ''}.`;
      showToast(msg, 'error');
      return;
    }

    if (!isConfigured) {
      showToast('Service unavailable.', 'error');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google-url?redirect_to=${encodeURIComponent(redirectUrl)}`);
      if (!response.ok) throw new Error('Failed to get auth URL');

      const { url } = await response.json();

      // Pre-flight check: verify Supabase auth is reachable before redirecting
      try {
        const supabaseOrigin = new URL(url).origin;
        await Promise.race([
          fetch(`${supabaseOrigin}/auth/v1/health`, { method: 'GET', mode: 'cors' }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 8000)
          )
        ]);
      } catch {
        setServiceDown(true);
        return;
      }

      window.location.href = url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during Google login.';
      if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('timed out')) {
        setServiceDown(true);
      } else {
        setError(message);
        showToast(message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {serviceDown ? (
        <ServiceStatusPage
          onRetry={async () => {
            setServiceDown(false);
            await handleGoogleLogin();
          }}
          onBack={() => {
            setServiceDown(false);
            setError(null);
          }}
        />
      ) : (
        <div className="flex flex-col w-full max-w-[440px] px-6 py-12 md:bg-white md:rounded-[2.5rem] md:shadow-[0_20px_50px_rgba(0,0,0,0.04)] md:border md:border-slate-100 items-center">

          {/* Design Match: Floating Icon at top */}
          <div className="mb-8 p-6 bg-white rounded-[1.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-slate-50">
            <LogIn className="w-8 h-8 text-slate-900" strokeWidth={1.5} />
          </div>

          {/* Design Match: Centered Text */}
          <div className="text-center mb-10 space-y-3">
            <h1 className="text-3xl font-bold text-slate-950 tracking-tight">
              Sign in with email
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed max-w-[320px] mx-auto">
              Step into your AI control center to bring your words, data, and teams together.
            </p>
          </div>

          {securityMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-100"
            >
              <div className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-pulse" />
              {securityMessage}
            </motion.div>
          )}

          {/* Rate Limit Warning */}
          {isRateLimited && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 w-full p-4 bg-amber-50 text-amber-700 text-xs font-bold rounded-2xl border border-amber-200 flex items-center gap-3"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>
                {rateLimitCooldown > 60 
                  ? `Too many attempts. Try again in ${Math.ceil(rateLimitCooldown / 60)} minutes.`
                  : `Too many attempts. Try again in ${rateLimitCooldown} seconds.`}
              </span>
            </motion.div>
          )}

          {/* Error Callout */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 w-full p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              {error}
            </motion.div>
          )}

          {/* Failed attempts indicator (when approaching rate limit) */}
          {failedAttempts >= 3 && failedAttempts < 5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 text-xs text-amber-600 font-medium flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              {5 - failedAttempts} attempt{5 - failedAttempts !== 1 ? 's' : ''} remaining before temporary lockout
            </motion.div>
          )}

          {/* Design Match: Minimalist Form */}
          <form className="w-full space-y-4" onSubmit={handleLogin}>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-950 transition-colors" strokeWidth={1.5} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={loading || isRateLimited}
                autoComplete="email"
                className="w-full pl-12 pr-4 h-14 bg-slate-50 border border-slate-100 focus:border-slate-300 focus:bg-white rounded-[1rem] text-[15px] text-slate-900 placeholder:text-slate-400 transition-all outline-none"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-950 transition-colors" strokeWidth={1.5} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={loading || isRateLimited}
                autoComplete="current-password"
                className="w-full pl-12 pr-4 h-14 bg-slate-50 border border-slate-100 focus:border-slate-300 focus:bg-white rounded-[1rem] text-[15px] text-slate-900 placeholder:text-slate-400 transition-all outline-none"
              />
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="px-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500">Password Strength</span>
                  <span className={`text-xs font-bold ${passwordStrength.textColor}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: `${(passwordStrength.score + 1) * 25}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading || isRateLimited}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer accent-slate-900"
                />
                <label htmlFor="remember-me" className="text-sm font-medium text-slate-600 cursor-pointer select-none">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm font-bold text-slate-900 hover:text-slate-600 transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              disabled={isRateLimited || isSubmitting}
              className="w-full h-14 bg-[#1e293b] hover:bg-[#020617] text-white rounded-[1rem] font-bold text-[16px] shadow-lg shadow-slate-950/20 active:scale-[0.98] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#1e293b]"
            >
              {isRateLimited ? 'Please Wait' : 'Get Started'}
            </Button>

            {turnstileSiteKey && (
              <TurnstileWidget
                siteKey={turnstileSiteKey}