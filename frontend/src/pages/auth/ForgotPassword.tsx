import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, KeyRound, Lock, Mail } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { useToast } from '../../hooks/useToast';
import { env } from '../../config/env';
import Button from '../../components/ui/Button';

const recoveryTokenFromURL = () => {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return hash.get('type') === 'recovery' ? hash.get('access_token') || '' : '';
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const initialToken = useMemo(recoveryTokenFromURL, []);
  const [accessToken] = useState(initialToken);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  useEffect(() => {
    if (initialToken) {
      // Remove credentials from browser history and screenshots immediately.
      window.history.replaceState({}, document.title, '/forgot-password?mode=reset');
    }
  }, [initialToken]);

  const requestRecovery = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${env.API_URL}/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Recovery is temporarily unavailable.');
      setEmailSent(true);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not send the recovery email.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      showToast('Use at least 8 characters.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${env.API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken, new_password: newPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'This recovery link is invalid or has expired.');
      setResetComplete(true);
      window.setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not update your password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const title = accessToken ? (resetComplete ? 'Password updated' : 'Choose a new password') : emailSent ? 'Check your inbox' : 'Reset your password';

  return (
    <AuthLayout>
      <div className="flex w-full max-w-[440px] flex-col items-center rounded-[2rem] border border-slate-100 bg-white px-6 py-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
        <div className="mb-7 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          {emailSent || resetComplete ? <CheckCircle2 className="h-8 w-8 text-emerald-600" /> : <KeyRound className="h-8 w-8 text-slate-900" />}
        </div>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
          <p className="mx-auto mt-3 max-w-[340px] text-sm font-medium leading-6 text-slate-500">
            {accessToken
              ? resetComplete ? 'Your password is ready. Taking you back to sign in…' : 'Use at least 8 characters and avoid reusing an old password.'
              : emailSent ? 'If an account exists for that address, a secure recovery link is on its way.' : 'We will email you a secure, short-lived recovery link.'}
          </p>
        </div>

        {!accessToken && !emailSent && (
          <form onSubmit={requestRecovery} className="w-full space-y-4">
            <label className="relative block">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
              <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@business.com" className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" />
            </label>
            <Button type="submit" isLoading={loading} disabled={loading} className="h-14 w-full rounded-2xl bg-slate-900 text-base font-bold text-white hover:bg-slate-800">
              Send recovery link
            </Button>
          </form>
        )}

        {accessToken && !resetComplete && (
          <form onSubmit={resetPassword} className="w-full space-y-4">
            <label className="relative block">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
              <input type="password" required minLength={8} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="New password" className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="relative block">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
              <input type="password" required minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" />
            </label>
            <Button type="submit" isLoading={loading} disabled={loading} className="h-14 w-full rounded-2xl bg-slate-900 text-base font-bold text-white hover:bg-slate-800">
              Update password
            </Button>
          </form>
        )}

        {emailSent && !accessToken && (
          <button type="button" onClick={() => setEmailSent(false)} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            Try another email
          </button>
        )}

        <Link to="/login" className="mt-8 text-sm font-semibold text-slate-600 hover:text-slate-950">Back to sign in</Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
