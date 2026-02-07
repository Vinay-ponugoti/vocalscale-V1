import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Building, Loader2, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/ui/Button';
import TurnstileWidget from '../../components/ui/TurnstileWidget';

const Signup = () => {
  const navigate = useNavigate();
  const { securityMessage, setAuthSession } = useAuth();
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
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const passwordStrength = useMemo(() => {
    const p = formData.password;
    if (!p) return { score: 0, color: 'bg-slate-200' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (score <= 1) return { score, color: 'bg-red-400' };
    if (score === 2) return { score, color: 'bg-amber-400' };
    return { score, color: 'bg-emerald-500' };
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          full_name: formData.full_name.trim(),
          cf_turnstile_response: turnstileToken,
        }),
      });

      if (!response.ok) {
        let errorMsg = 'Could not create account.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorMsg;
        } catch { /* ignore parse errors */ }
        throw new Error(errorMsg);
      }

      const responseData = await response.json();
      const { session } = responseData;

      if (session) {
        setAuthSession(session);
        showToast('Created successfully!', 'success');
        navigate('/dashboard', { replace: true });
      } else {
        showToast('Account created! Please sign in.', 'info');
        navigate('/login');
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred during signup.');
      showToast(error instanceof Error ? error.message : 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google-url?redirect_to=${encodeURIComponent(redirectUrl)}`);
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();
      window.location.href = url;
    } catch {
      showToast('An error occurred during Google signup.', 'error');
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col w-full max-w-[480px] px-6 py-10 md:bg-white md:rounded-[2.5rem] md:shadow-[0_20px_50px_rgba(0,0,0,0.04)] md:border md:border-slate-100 items-center">

        {/* Design Match: Floating Top Icon */}
        <div className="mb-8 p-6 bg-white rounded-[1.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-slate-50">
          <UserPlus className="w-8 h-8 text-slate-900" strokeWidth={1.5} />
        </div>

        {/* Design Match: Centered Text */}
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-3xl font-bold text-slate-950 tracking-tight">
            Create an account
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed max-w-[320px] mx-auto">
            Join the elite club of businesses using human-like AI to scale faster.
          </p>
        </div>

        {securityMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-100"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            {securityMessage}
          </motion.div>
        )}

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

        <form className="w-full space-y-4" onSubmit={handleSignup}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group col-span-full">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-950 transition-colors" strokeWidth={1.5} />
              <input
                type="text" name="full_name" value={formData.full_name} onChange={handleChange}
                placeholder="Full Name" required disabled={loading}
                className="w-full pl-12 pr-4 h-14 bg-slate-50 border border-slate-100 focus:border-slate-300 focus:bg-white rounded-[1rem] text-[15px] text-slate-900 placeholder:text-slate-400 transition-all outline-none"
              />
            </div>

            <div className="relative group col-span-full">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-950 transition-colors" strokeWidth={1.5} />
              <input
                type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="Email Address" required disabled={loading}
                className="w-full pl-12 pr-4 h-14 bg-slate-50 border border-slate-100 focus:border-slate-300 focus:bg-white rounded-[1rem] text-[15px] text-slate-900 placeholder:text-slate-400 transition-all outline-none"
              />
            </div>

            <div className="relative group col-span-full">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-950 transition-colors" strokeWidth={1.5} />
              <input
                type="password" name="password" value={formData.password} onChange={handleChange}
                placeholder="Secure Password" required disabled={loading}
                className="w-full pl-12 pr-4 h-14 bg-slate-50 border border-slate-100 focus:border-slate-300 focus:bg-white rounded-[1rem] text-[15px] text-slate-900 placeholder:text-slate-400 transition-all outline-none"
              />
              <div className="h-1 w-[calc(100%-2rem)] bg-slate-100 rounded-full mt-2 mx-4 overflow-hidden">
                <div className={`h-full ${passwordStrength.color} transition-all duration-500`} style={{ width: `${(passwordStrength.score + 1) * 33.33}%` }} />
              </div>
            </div>

            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-slate-950 transition-colors" strokeWidth={1.5} />
              <input
                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="Phone" disabled={loading}
                className="w-full pl-11 pr-4 h-14 bg-slate-50 border border-slate-100 focus:border-slate-300 focus:bg-white rounded-[1rem] text-[14px] text-slate-900 placeholder:text-slate-400 transition-all outline-none"
              />
            </div>

            <div className="relative group">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-slate-950 transition-colors" strokeWidth={1.5} />
              <select
                name="businessType" value={formData.businessType} onChange={handleChange}
                disabled={loading}
                className="w-full pl-11 pr-4 h-14 bg-slate-50 border border-slate-100 focus:border-slate-300 focus:bg-white rounded-[1rem] text-[14px] text-slate-900 transition-all outline-none appearance-none font-medium"
              >
                <option value="Restaurant">Restaurant</option>
                <option value="Medical">Medical</option>
                <option value="Legal">Legal</option>
                <option value="Salon">Salon</option>
              </select>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start gap-3 px-1 mt-4">
            <div className="relative flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-5 h-5 rounded border-slate-200 bg-slate-50 text-slate-900 focus:ring-slate-900 transition-all cursor-pointer accent-slate-900"
              />
            </div>
            <label htmlFor="terms" className="text-xs font-medium text-slate-500 leading-relaxed cursor-pointer select-none">
              I agree to the{' '}
              <Link to="/terms" className="text-slate-900 font-bold hover:underline underline-offset-4">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-slate-900 font-bold hover:underline underline-offset-4">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            disabled={!agreedToTerms || loading}
            className="w-full h-14 bg-[#1e293b] hover:bg-[#020617] text-white rounded-[1rem] font-bold text-[16px] shadow-lg shadow-slate-950/20 active:scale-[0.98] transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale disabled:scale-100"
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

        {/* Divider */}
        <div className="relative w-full my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100/50 border-dashed"></div>
          </div>
          <div className="relative flex justify-center text-[12px] font-medium tracking-tight">
            <span className="bg-white px-4 text-slate-400">Or sign up with</span>
          </div>
        </div>

        {/* Google Only Option */}
        <div className="w-full flex justify-center">
          <button
            onClick={handleGoogleSignup}
            className="w-32 h-16 bg-white hover:bg-slate-50 border border-slate-200 rounded-[1rem] flex items-center justify-center transition-all active:scale-[0.95] shadow-sm group"
          >
            <img
              alt="Google"
              className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all"
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            />
          </button>
        </div>

        <p className="text-center text-sm font-medium text-slate-400 mt-10">
          Already a member?{' '}
          <Link to="/login" className="text-slate-900 font-bold hover:underline underline-offset-4">
            Sign in here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Signup;
