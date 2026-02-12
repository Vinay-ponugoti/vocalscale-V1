import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import { isSessionExpired } from '../../utils/sessionUtils';
import Button from '../../components/ui/Button';
import TurnstileWidget from '../../components/ui/TurnstileWidget';

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConfigured) {
      const msg = 'Service unavailable.';
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

    setLoading(true);
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
        let errorMsg = 'Invalid email or password.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorMsg;
        } catch { /* ignore parse errors */ }
        throw new Error(errorMsg);
      }

      const responseData = await response.json();
      const { session } = responseData;

      if (session && (session.access_token || session.refresh_token)) {
        setAuthSession(session, rememberMe);

        // Prefetch critical dashboard data
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const authHeaders = {
          'Authorization': `Bearer ${session.access_token}`,
          'ngrok-skip-browser-warning': 'true'
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
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
      // We check the health endpoint instead of the OAuth URL (which redirects to Google)
      try {
        const supabaseOrigin = new URL(url).origin;
        const healthCheck = await Promise.race([
          fetch(`${supabaseOrigin}/auth/v1/health`, { method: 'GET', mode: 'cors' }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 8000)
          )
        ]);
      } catch {
        throw new Error('Authentication service is temporarily unavailable. Please try again in a moment.');
      }

      window.location.href = url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during Google login.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
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
              disabled={loading}
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
              disabled={loading}
              className="w-full pl-12 pr-4 h-14 bg-slate-50 border border-slate-100 focus:border-slate-300 focus:bg-white rounded-[1rem] text-[15px] text-slate-900 placeholder:text-slate-400 transition-all outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
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
            className="w-full h-14 bg-[#1e293b] hover:bg-[#020617] text-white rounded-[1rem] font-bold text-[16px] shadow-lg shadow-slate-950/20 active:scale-[0.98] transition-all mt-4"
          >
            Get Started
          </Button>

          {turnstileSiteKey && (
            <TurnstileWidget
              siteKey={turnstileSiteKey}
              onVerify={(token) => setTurnstileToken(token)}
            />
          )}
        </form>

        {/* Design Match: Custom Divider */}
        <div className="relative w-full my-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100/50 border-dashed"></div>
          </div>
          <div className="relative flex justify-center text-[12px] font-medium tracking-tight">
            <span className="bg-white px-4 text-slate-400">Or sign in with</span>
          </div>
        </div>

        {/* Design Match: Bottom Logo Options (Google Only) */}
        <div className="w-full flex justify-center">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-32 h-16 bg-white hover:bg-slate-50 border border-slate-200 rounded-[1rem] flex items-center justify-center transition-all active:scale-[0.95] shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
            ) : (
              <img
                alt="Google"
                className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              />
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm font-medium text-slate-400">
            Fresh here?{' '}
            <Link to="/signup" className="text-slate-900 font-bold hover:underline underline-offset-4">
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
