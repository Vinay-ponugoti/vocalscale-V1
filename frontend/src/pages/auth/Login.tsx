import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, LogIn } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { storeSession } from '../../utils/sessionUtils';

import { useQueryClient } from '@tanstack/react-query';
import { env } from '../../config/env';

const Login = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isConfigured, securityMessage, session } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (session) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, navigate]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConfigured) {
      const msg = 'Service unavailable.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    setLoading(true);
    try {
      // Check backend reachability first
      try {
        const pingResponse = await fetch(`${import.meta.env.VITE_API_URL}/health`, { 
          method: 'GET',
          headers: { 'ngrok-skip-browser-warning': 'true' }
        }).catch(() => null);
        
        if (!pingResponse || !pingResponse.ok) {
          throw new Error('Backend is currently offline. Please try again later.');
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Service unavailable. Backend is down.';
        throw new Error(message);
      }

      // Call Python backend for login
      console.log('Attempting login via backend:', email);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      console.log('Backend login response status:', response.status);

      if (!response.ok) {
        let errorMsg = 'Invalid email or password.';
        try {
          const errorData = await response.json();
          console.error('Backend login error details:', errorData);
          errorMsg = errorData.detail || errorMsg;
        } catch (parseErr) {
          console.error('Failed to parse error response:', parseErr);
        }
        throw new Error(errorMsg);
      }

      const responseData = await response.json();
      console.log('Login successful, received data:', { ...responseData, session: !!responseData.session });
      const { session } = responseData;

      if (session && (session.access_token || session.refresh_token)) {
        console.log('Storing session and navigating...');
        
        // Store session locally
        storeSession(session);
        
        // Prefetch critical dashboard data immediately after login
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const authHeaders = { 
          'Authorization': `Bearer ${session.access_token}`,
          'ngrok-skip-browser-warning': 'true' 
        };

        // 1. Dashboard Stats
        queryClient.prefetchQuery({
          queryKey: ['dashboard', dateStr, 7],
          queryFn: async () => {
            const response = await fetch(`${env.API_URL}/dashboard/stats?date=${now.toISOString()}&days=7`, {
              headers: authHeaders
            });
            return response.json();
          }
        });

        // 2. Notifications
        queryClient.prefetchQuery({
          queryKey: ['notifications'],
          queryFn: async () => {
            const response = await fetch(`${env.API_URL}/dashboard/notifications`, {
              headers: authHeaders
            });
            return response.json();
          }
        });

        // 3. Business Profile
        queryClient.prefetchQuery({
          queryKey: ['business-profile'],
          queryFn: async () => {
            const response = await fetch(`${env.API_URL}/business/profile`, {
              headers: authHeaders
            });
            return response.json();
          }
        });

        // 4. Recent Calls (Page 1)
        queryClient.prefetchQuery({
          queryKey: ['calls', 1, 10, null, null, null, null, null],
          queryFn: async () => {
            const response = await fetch(`${env.API_URL}/dashboard/calls?page=1&size=10`, {
              headers: authHeaders
            });
            return response.json();
          }
        });

        // 5. Appointments (Page 1)
        queryClient.prefetchQuery({
          queryKey: ['appointments', 1, 10],
          queryFn: async () => {
            const response = await fetch(`${env.API_URL}/dashboard/appointments?page=1&size=10`, {
              headers: authHeaders
            });
            return response.json();
          }
        });

        showToast('Login successful!', 'success');
        
        // Force navigate to dashboard every time for production consistency
        console.log('Redirecting to dashboard...');
        window.location.href = '/dashboard';
      } else {
        console.warn('Login successful but no valid session/token received');
        const msg = 'Login successful, but session could not be established. Please try again.';
        setError(msg);
        showToast(msg, 'error');
      }
    } catch (e) {
      console.error('Login process error:', e);
      const message = e instanceof Error ? e.message : 'Failed to connect to authentication server.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isConfigured) {
      const msg = 'Service unavailable.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    try {
      // Call Python backend to get the secure Google OAuth URL
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google-url?redirect_to=${encodeURIComponent(redirectUrl)}`);
      if (!response.ok) throw new Error('Failed to get auth URL');
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An error occurred during Google login.';
      setError(message);
      showToast(message, 'error');
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white/95 md:bg-white/90 backdrop-blur-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white rounded-[1.5rem] md:rounded-[2rem] w-full max-w-[440px] p-6 md:p-10 flex flex-col items-center text-center transition-colors duration-300 max-h-[calc(100vh-7rem)] overflow-y-auto">

        {/* Icon - Hidden on Mobile */}
        <div className="hidden md:flex mb-6 bg-sky-50 p-3 rounded-2xl shadow-sm border border-sky-100">
          <LogIn className="text-[#0ea5e9] w-8 h-8" />
        </div>

        {/* Title */}
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-2 md:mb-3">
          Sign in to your Voice Agent
        </h1>

        {securityMessage && (
          <div className="mb-4 flex items-center gap-2 text-xs font-medium text-sky-600 animate-pulse bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100">
            <Loader2 className="w-3 h-3 animate-spin" />
            {securityMessage}
          </div>
        )}

        {/* Subtitle */}
        <p className="text-xs md:text-sm text-slate-500 mb-6 md:mb-8 leading-relaxed max-w-xs">
          Manage calls, phone numbers, and AI voice agents for your business.
        </p>

        {/* Error */}
        {error && (
          <div className="mb-6 w-full p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="w-full space-y-4" onSubmit={handleLogin}>

          {/* Email */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="text-slate-400 w-5 h-5" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Business email"
              required
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-sky-400 focus:ring-0 rounded-xl text-sm text-slate-700 placeholder-slate-400 shadow-sm"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="text-slate-400 w-5 h-5" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-sky-400 focus:ring-0 rounded-xl text-sm text-slate-700 placeholder-slate-400 shadow-sm"
            />
          </div>

          {/* Forgot password */}
          <div className="flex justify-end w-full pt-1">
            <a
              href="#"
              className="text-xs font-medium text-slate-500 hover:text-[#0ea5e9]"
            >
              Forgot your password?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium py-3 rounded-xl shadow-lg shadow-sky-200 transition-all active:scale-[0.98] flex justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="w-full flex items-center justify-between my-8">
          <div className="h-px bg-slate-200 w-full opacity-70 border-t border-dashed"></div>
          <span className="px-3 text-xs text-slate-400 whitespace-nowrap">
            Or continue with
          </span>
          <div className="h-px bg-slate-200 w-full opacity-70 border-t border-dashed"></div>
        </div>

        {/* Social login */}
        <div className="w-full">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-xl py-3 flex items-center justify-center gap-3 shadow-sm transition-all active:scale-[0.98]"
          >
            <img
              alt="Google"
              className="w-5 h-5"
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            />
            <span className="text-sm font-semibold text-slate-700">Continue with Google</span>
          </button>
        </div>

        {/* Signup */}
        <p className="text-center text-sm text-slate-600 mt-6">
          New to the platform?{' '}
          <Link to="/signup" className="text-[#0ea5e9] font-semibold hover:text-[#0284c7]">
            Create an account
          </Link>
        </p>

      </div>
    </AuthLayout>
  );
};

export default Login;
