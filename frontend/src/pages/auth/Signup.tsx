import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Building, Loader2, UserPlus } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { storeSession } from '../../utils/sessionUtils';
import { useQueryClient } from '@tanstack/react-query';
import { env } from '../../config/env';

const Signup = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isConfigured, securityMessage, setAuthSession } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    businessType: 'Restaurant',
  });

  const passwordStrength = useMemo(() => {
    const p = formData.password;
    if (!p) return { score: 0, color: 'bg-gray-200' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (score <= 1) return { score, color: 'bg-red-500' };
    if (score === 2) return { score, color: 'bg-orange-400' };
    if (score === 3) return { score, color: 'bg-yellow-400' };
    return { score, color: 'bg-green-500' };
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConfigured) {
      const msg = 'Service unavailable.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    // Basic frontend validation
    if (formData.password.length < 8) {
      const msg = 'Password must be at least 8 characters long';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting signup via backend:', formData.email);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          full_name: formData.full_name.trim(),
        }),
      });

      if (!response.ok) {
        let errorMsg = 'Could not create account.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorMsg;
        } catch {
          // Fallback to default error message if JSON parsing fails
        }
        throw new Error(errorMsg);
      }

      const responseData = await response.json();
      const { session } = responseData;

      if (session) {
        // Update auth context immediately
        setAuthSession(session);

        // Prefetch critical dashboard data immediately after signup
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const authHeaders = {
          'Authorization': `Bearer ${session.access_token}`,
          'ngrok-skip-browser-warning': 'true'
        };

        // Priority Loading: Prefetch critical queries
        const prefetchOptions = { staleTime: 1000 * 60 * 5 }; // 5 minutes

        // 1. Dashboard Stats
        queryClient.prefetchQuery({
          queryKey: ['dashboard', dateStr, 7],
          queryFn: async () => {
            const response = await fetch(`${env.API_URL}/dashboard/stats?date=${now.toISOString()}&days=7`, {
              headers: authHeaders
            });
            return response.json();
          },
          ...prefetchOptions
        });

        // 2. Business Profile
        queryClient.prefetchQuery({
          queryKey: ['business-profile'],
          queryFn: async () => {
            const response = await fetch(`${env.API_URL}/business/profile`, {
              headers: authHeaders
            });
            return response.json();
          },
          ...prefetchOptions
        });

        // 3. Recent Calls
        queryClient.prefetchQuery({
          queryKey: ['calls', 1, 10, null, null, null, null, null],
          queryFn: async () => {
            const response = await fetch(`${env.API_URL}/dashboard/calls?page=1&size=10`, {
              headers: authHeaders
            });
            return response.json();
          },
          ...prefetchOptions
        });

        showToast('Account created successfully!', 'success');

        // Use navigate for smoother transition
        navigate('/dashboard', { replace: true });
      } else {
        showToast('Account created! Please check your email for verification.', 'info');
        navigate('/login');
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An error occurred during signup.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!isConfigured) {
      const msg = 'Service unavailable.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google-url?redirect_to=${encodeURIComponent(redirectUrl)}`);
      if (!response.ok) throw new Error('Failed to get auth URL');

      const { url } = await response.json();
      window.location.href = url;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An error occurred during Google signup.';
      setError(message);
      showToast(message, 'error');
    }
  };

  return (
    <AuthLayout>
      {/* 
        Card with max-h-[90vh] ensures it never goes outside the screen. 
        overflow-y-auto handles scrolling on small phones.
      */}
      <div className="bg-white/95 md:bg-white/90 backdrop-blur-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white rounded-[1.5rem] md:rounded-[2rem] w-full max-w-[440px] p-6 md:p-10 flex flex-col items-center text-center transition-colors duration-300 max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar">

        {/* Icon - Hidden on Mobile */}
        <div className="hidden md:flex mb-6 bg-sky-50 p-3 rounded-2xl shadow-sm border border-sky-100">
          <UserPlus className="text-[#0ea5e9] w-8 h-8" />
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-2 md:mb-3">Create account</h1>

        {securityMessage && (
          <div className="mb-4 flex items-center gap-2 text-xs font-medium text-sky-600 animate-pulse bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100">
            <Loader2 className="w-3 h-3 animate-spin" />
            {securityMessage}
          </div>
        )}

        <p className="text-xs md:text-sm text-slate-500 mb-6 md:mb-8 leading-relaxed max-w-xs">
          Start your Vocal Scale journey today. For free.
        </p>

        {error && (
          <div className="mb-6 w-full p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form className="w-full space-y-4" onSubmit={handleSignup}>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="text-slate-400 w-5 h-5" />
            </div>
            <input
              type="text" name="full_name" value={formData.full_name} onChange={handleChange}
              placeholder="Full Name" required disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-sky-400 focus:bg-white focus:ring-0 rounded-xl text-sm text-slate-700 placeholder-slate-400 transition-all duration-200 shadow-sm"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="text-slate-400 w-5 h-5" />
            </div>
            <input
              type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="Email" required disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-sky-400 focus:bg-white focus:ring-0 rounded-xl text-sm text-slate-700 placeholder-slate-400 transition-all duration-200 shadow-sm"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="text-slate-400 w-5 h-5" />
            </div>
            <input
              type="password" name="password" value={formData.password} onChange={handleChange}
              placeholder="Password" required disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-sky-400 focus:bg-white focus:ring-0 rounded-xl text-sm text-slate-700 placeholder-slate-400 transition-all duration-200 shadow-sm"
            />
          </div>

          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-full ${passwordStrength.color} transition-all duration-300`} style={{ width: `${passwordStrength.score * 25}%` }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="text-slate-400 w-4.5 h-4.5" />
              </div>
              <input
                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="Phone" disabled={loading}
                className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 focus:border-sky-400 focus:bg-white focus:ring-0 rounded-xl text-sm text-slate-700 placeholder-slate-400 transition-all duration-200 shadow-sm"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="text-slate-400 w-4.5 h-4.5" />
              </div>
              <select
                name="businessType" value={formData.businessType} onChange={handleChange}
                disabled={loading}
                className="w-full pl-10 pr-8 py-3 bg-white border border-slate-200 focus:border-sky-400 focus:bg-white focus:ring-0 rounded-xl text-sm text-slate-700 appearance-none cursor-pointer transition-all duration-200 shadow-sm"
              >
                <option value="Restaurant">Restaurant</option>
                <option value="Medical">Medical</option>
                <option value="Legal">Legal</option>
                <option value="Salon">Salon</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium py-3 rounded-xl shadow-lg shadow-sky-200 transition-all duration-200 transform active:scale-[0.98] mt-2 flex justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Get Started'}
          </button>
        </form>

        <div className="w-full flex items-center justify-between my-8">
          <div className="h-px bg-slate-200 w-full opacity-70 border-t border-dashed"></div>
          <span className="px-3 text-xs text-slate-400 whitespace-nowrap">Or sign up with</span>
          <div className="h-px bg-slate-200 w-full opacity-70 border-t border-dashed"></div>
        </div>

        {/* Social signup */}
        <div className="w-full">
          <button
            onClick={handleGoogleSignup}
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

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0ea5e9] font-semibold hover:text-[#0284c7]">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Signup;
