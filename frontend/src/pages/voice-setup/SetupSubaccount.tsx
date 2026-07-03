import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { env } from '../../config/env';
import { getAuthHeader } from '../../lib/api';

import type { Subaccount } from '../../types/voice';
import { billingApi } from '../../api/billing';
import { useAuth } from '../../context/AuthContext';

const PROVIDER_STORAGE_KEY = 'voice_ai_telephony_provider';

const SetupSubaccount = () => {
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState('');
  const [provider, setProvider] = useState<'telnyx' | 'signalwire'>(() => {
    const saved = sessionStorage.getItem(PROVIDER_STORAGE_KEY);
    return saved === 'telnyx' || saved === 'signalwire' ? saved : 'signalwire';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { profile } = useAuth();
  const [existingSubaccount, setExistingSubaccount] = useState<Subaccount | null>(null);
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const sub = await billingApi.getSubscription();
      if (sub && sub.status === 'active') {
        setHasSubscription(true);
      } else {
        setHasSubscription(false);
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      // If profile is still loading, wait
      if (!profile) return;
      setHasSubscription(false);
    }
  }, [profile]);

  const checkExistingSubaccount = useCallback(async () => {
    try {
      const apiUrl = env.API_URL;
      const headers = await getAuthHeader();

      const response = await fetch(`${apiUrl}/subaccounts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.has_subaccount && data.subaccount) {
          setExistingSubaccount(data.subaccount);
          setBusinessName(data.subaccount.friendly_name || '');
          if (data.subaccount.provider === 'telnyx' || data.subaccount.provider === 'signalwire') {
            setProvider(data.subaccount.provider);
            sessionStorage.setItem(PROVIDER_STORAGE_KEY, data.subaccount.provider);
          }

          const status = data.subaccount.status?.toLowerCase();

          if (!status || status === 'active') {
            setSuccess(true);
            setTimeout(() => {
              navigate('/dashboard/voice-setup/buy');
            }, 2000);
          }
        }
      }
    } catch (err) {
      console.error('Error checking subaccount:', err);
    }
  }, [navigate]);

  useEffect(() => {
    checkExistingSubaccount();
    checkSubscriptionStatus();
  }, [checkExistingSubaccount, checkSubscriptionStatus]);

  const handleCreateSubaccount = async () => {
    if (!businessName.trim()) {
      setError('A business name is required to initialize infrastructure.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = env.API_URL;
      const headers = await getAuthHeader();

      const response = await fetch(`${apiUrl}/subaccounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          friendly_name: businessName.trim(),
          provider
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 409) {
        if (data.sid) {
          sessionStorage.setItem(PROVIDER_STORAGE_KEY, provider);
          setSuccess(true);
          await checkExistingSubaccount();
          setTimeout(() => {
            navigate('/dashboard/voice-setup/buy');
          }, 800);
          return;
        }
        setError(data.detail || 'Infrastructure already allocated for this profile.');
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || data.error || "Couldn't finish setup. Please try again.");
      }

      sessionStorage.setItem(PROVIDER_STORAGE_KEY, provider);
      setExistingSubaccount(data);
      setSuccess(true);

      setTimeout(() => {
        navigate('/dashboard/voice-setup/buy');
      }, 1500);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Couldn't finish setup. Please try again.";
      console.error(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  return (
    <DashboardLayout fullWidth>
      <div className="flex min-h-screen flex-col bg-[#f7f8fb] text-slate-950">
        <header className="border-b border-slate-200 bg-white px-4 py-4 md:px-6 xl:px-8">
          <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-100 bg-cyan-50 text-cyan-700">
                <Building2 size={20} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-950">Provider Setup</h1>
                <p className="text-sm font-medium text-slate-500">Create the provider account used for phone numbers.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard/voice-setup')}
              className="hidden h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 sm:inline-flex"
            >
              Back to Numbers
            </button>
          </div>
        </header>

        <main className="scrollbar-hide flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-10">
          <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-cyan-700">
                  One-time setup
                </div>
                <h2 className="text-3xl font-black tracking-tight text-slate-950">Set up your AI phone line</h2>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
                  This creates the isolated provider account VocalScale uses to purchase and route numbers for your business.
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  {
                    icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
                    title: 'Private and secure',
                    desc: 'Provider resources stay isolated to your business.'
                  },
                  {
                    icon: <Zap className="h-5 w-5 text-cyan-700" />,
                    title: 'Ready in seconds',
                    desc: 'After setup, you can search inventory and activate a number.'
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-black tracking-tight text-slate-950">{item.title}</h4>
                      <p className="mt-1 text-sm font-medium text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
            {success ? (
              <div className="rounded-lg border border-emerald-100 bg-white p-8 text-center shadow-sm animate-in zoom-in-95 duration-300">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle size={34} />
                </div>
                <h3 className="mb-3 text-2xl font-black tracking-tight text-slate-950">Phone setup ready</h3>
                <p className="mb-8 text-sm font-medium leading-6 text-slate-500">
                  Your provider account is ready. Redirecting to number purchase...
                </p>
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-7 w-7 animate-spin text-cyan-700" />
                  <button
                    onClick={() => navigate('/dashboard/voice-setup/buy')}
                    className="inline-flex h-11 items-center gap-2 rounded-md bg-slate-950 px-5 text-xs font-bold text-white transition-colors hover:bg-slate-800"
                  >
                    Continue
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : existingSubaccount ? (
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm animate-in slide-in-from-right-4 duration-300">
                <div className="mb-6">
                  <h3 className="mb-1 text-2xl font-black tracking-tight text-slate-950">You are all set</h3>
                  <p className="text-sm font-medium text-slate-500">Your AI phone line provider account is ready.</p>
                </div>

                <div className="mb-6 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Business Name</p>
                    <p className="text-lg font-black tracking-tight text-slate-950">{existingSubaccount.friendly_name}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Provider Account</p>
                    <p className="break-all rounded-md border border-cyan-100 bg-white p-3 font-mono text-xs font-bold text-cyan-800">
                      {existingSubaccount.sid}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Provider</p>
                    <p className="text-sm font-black text-slate-950">
                      {provider === 'telnyx' ? 'Telnyx' : 'SignalWire'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/dashboard/voice-setup/buy')}
                  className="group flex h-11 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-xs font-bold text-white transition-colors hover:bg-slate-800"
                >
                  Choose Number
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm animate-in slide-in-from-bottom-8 duration-300">
                <div className="mb-6">
                  <h3 className="mb-1 text-2xl font-black tracking-tight text-slate-950">Create provider account</h3>
                  <p className="text-sm font-medium text-slate-500">Required before buying a number.</p>
                </div>

                <div className="mb-6 space-y-5">
                  <div className="space-y-3">
                    <label className="ml-1 text-xs font-bold text-slate-500">
                      Telephony Provider
                    </label>
                    <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-100 p-1">
                      {(['signalwire', 'telnyx'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setProvider(p);
                            sessionStorage.setItem(PROVIDER_STORAGE_KEY, p);
                          }}
                          className={`rounded-md px-4 py-2.5 text-xs font-bold transition-colors ${
                            provider === p ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {p === 'signalwire' ? 'SignalWire' : 'Telnyx'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="ml-1 text-xs font-bold text-slate-500">
                      Business Identity <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-cyan-700">
                        <ArrowRight size={16} />
                      </div>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Joe's Pizza"
                        className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-950 placeholder:text-slate-400 transition-all focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-3 rounded-lg border border-rose-100 bg-rose-50 p-4 animate-in fade-in slide-in-from-top-4">
                      <AlertCircle className="mt-0.5 shrink-0 text-rose-600" size={18} />
                      <p className="text-sm font-semibold leading-6 text-rose-700">{error}</p>
                    </div>
                  )}

                  {hasSubscription === false && (
                    <div className="space-y-4 rounded-lg border border-amber-100 bg-amber-50 p-5 text-center">
                      <p className="text-sm font-semibold leading-6 text-amber-700">
                        Active subscription required to create a phone provider account.
                      </p>
                      <button
                        onClick={() => navigate('/dashboard/plans')}
                        className="text-xs font-bold text-cyan-700 hover:underline"
                      >
                        Browse Plans
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCreateSubaccount}
                  disabled={loading || !businessName.trim() || hasSubscription === false}
                  className={`flex h-11 w-full items-center justify-center gap-2 rounded-md px-5 text-xs font-bold transition-colors ${hasSubscription === false
                    ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                    : 'bg-slate-950 text-white hover:bg-slate-800'
                    }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      {hasSubscription === false ? 'Subscription Required' : 'Create Account'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            )}
            </section>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default SetupSubaccount;
