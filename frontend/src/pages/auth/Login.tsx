import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, LogIn, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/ui/Button';

const ACCESS_REQUEST_ENDPOINT = 'https://formsubmit.co/ajax/ponugotivinay.v@gmail.com';

const Login = () => {
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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

    setLoading(true);
    try {
      const response = await fetch(ACCESS_REQUEST_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          source: 'Login page',
          _subject: 'VocalScale — Login access request',
          _template: 'table',
        }),
      });

      if (!response.ok) {
        throw new Error('Could not submit your request. Please try again.');
      }

      setSuccess(true);
      showToast('Request sent! We\'ll be in touch.', 'success');
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
          {success ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
          ) : (
            <LogIn className="w-8 h-8 text-slate-900" strokeWidth={1.5} />
          )}
        </div>

        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 mb-2">
            <ShieldCheck className="w-3 h-3" />
            Limited Access · Private Beta
          </div>
          <h1 className="text-3xl font-bold text-slate-950 tracking-tight">
            {success ? "You're on the list" : 'Request access'}
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed max-w-[340px] mx-auto">
            {success
              ? "Thanks — we received your email. Our team will reach out within 24 hours with next steps."
              : 'VocalScale is currently invite-only. Drop your email below and we\'ll get back to you with login access.'}
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

        {!success && (
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

            <Button
              type="submit"
              isLoading={loading}
              disabled={loading}
              className="w-full h-14 bg-[#1e293b] hover:bg-[#020617] text-white rounded-[1rem] font-bold text-[16px] shadow-lg shadow-slate-950/20 active:scale-[0.98] transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending…
                </span>
              ) : (
                'Request Access'
              )}
            </Button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            New to VocalScale?{' '}
            <Link to="/signup" className="text-slate-900 font-bold hover:underline underline-offset-4">
              Join the waitlist
            </Link>
          </p>
        </div>

        <p className="mt-6 text-[11px] text-slate-400 font-medium text-center max-w-[320px] leading-relaxed">
          By requesting access, you agree to our{' '}
          <Link to="/terms" className="text-slate-700 font-bold hover:underline underline-offset-2">Terms</Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-slate-700 font-bold hover:underline underline-offset-2">Privacy Policy</Link>.
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
