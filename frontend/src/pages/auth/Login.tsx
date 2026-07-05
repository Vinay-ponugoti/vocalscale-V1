import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import TurnstileWidget from '../../components/ui/TurnstileWidget';
import { env } from '../../config/env';
import { getDevelopmentHeaders } from '../../lib/devHeaders';
import type { Session, User } from '../../types/auth';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

interface LoginResponse {
  user: User;
  session: Session;
}

type RedirectLocation = {
  pathname?: string;
  search?: string;
  hash?: string;
};

const Login = () => {
  const { showToast } = useToast();
  const { setAuthSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where to send the user after a successful login (honours a redirect origin).
  const redirectState = location.state as { from?: string | RedirectLocation } | null;
  const redirectTo = (() => {
    const from = redirectState?.from;
    if (typeof from === 'string') {
      return from === '/login' ? '/dashboard' : from;
    }
    if (from?.pathname) {
      const target = `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`;
      return target === '/login' ? '/dashboard' : target;
    }
    return '/dashboard';
  })();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const msg = 'Please enter a valid email address.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }
    if (!password) {
      const msg = 'Please enter your password.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      const msg = 'Please complete the CAPTCHA verification.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${env.API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...getDevelopmentHeaders(),
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          cf_turnstile_response: turnstileToken,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Backend returns { detail: "..." } on failure.
        const message =
          (data as { detail?: string; error?: string }).detail ||
          (data as { detail?: string; error?: string }).error ||
          'Invalid email or password.';
        throw new Error(message);
      }

      const { session } = data as LoginResponse;
      if (!session?.access_token || !session?.user?.id) {
        throw new Error('Login succeeded but no valid session was returned.');
      }

      setAuthSession(session, remember);
      showToast('Welcome back!', 'success');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col w-full max-w-[440px] px-6 py-12 md:bg-white md:rounded-[2.5rem] md:shadow-[0_20px_50px_rgba(0,0,0,0.04)] md:border md:border-slate-100 items-center">

        <div className="mb-8 p-6 bg-white rounded-[1.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-slate-50">
          <LogIn className="w-8 h-8 text-slate-900" strokeWidth={1.5} />
        </div>

        <div className="text-center mb-8 space-y-3">
          <h1 className="text-3xl font-bold text-slate-950 tracking-tight">
            Welcome back
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed max-w-[340px] mx-auto">
            Sign in to your VocalScale dashboard.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 w-full p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-3"
          >
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
            {error}
          </motion.div>
        )}

        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-950 transition-colors" strokeWidth={1.5} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.com"
              required
              disabled={loading}
              autoComplete="email"
              autoFocus
              className="w-full pl-12 pr-4 h-14 bg-slate-50 border border-slate-100 focus:border-slate-300 focus:bg-white rounded-[1rem] text-[15px] text-slate-900 placeholder:text-slate-400 transition-all outline-none"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-950 transition-colors" strokeWidth={1.5} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              disabled={loading}
              autoComplete="current-password"
              className="w-full pl-12 pr-12 h-14 bg-slate-50 border border-slate-100 focus:border-slate-300 focus:bg-white rounded-[1rem] text-[15px] text-slate-900 placeholder:text-slate-400 transition-all outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
            </button>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 text-sm text-slate-500 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-sm text-slate-900 font-bold hover:underline underline-offset-4">
              Forgot password?
            </Link>
          </div>

          {TURNSTILE_SITE_KEY && (
            <div className="flex justify-center pt-1">
              <TurnstileWidget
                siteKey={TURNSTILE_SITE_KEY}
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken('')}
                onError={() => setTurnstileToken('')}
              />
            </div>
          )}

          <Button
            type="submit"
            isLoading={loading}
            disabled={loading}
            className="w-full h-14 bg-[#1e293b] hover:bg-[#020617] text-white rounded-[1rem] font-bold text-[16px] shadow-lg shadow-slate-950/20 active:scale-[0.98] transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            New to VocalScale?{' '}
            <Link to="/signup" className="text-slate-900 font-bold hover:underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>

        <p className="mt-6 text-[11px] text-slate-400 font-medium text-center max-w-[320px] leading-relaxed">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="text-slate-700 font-bold hover:underline underline-offset-2">Terms</Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-slate-700 font-bold hover:underline underline-offset-2">Privacy Policy</Link>.
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
