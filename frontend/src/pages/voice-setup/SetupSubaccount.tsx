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

const SetupSubaccount = () => {
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState('');
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
          friendly_name: businessName.trim()
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 409) {
        setError(data.detail || 'Infrastructure already allocated for this profile.');
        if (data.sid) {
          checkExistingSubaccount();
        }
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Infrastructure provisioning failure');
      }

      setExistingSubaccount(data);
      setSuccess(true);

      setTimeout(() => {
        navigate('/dashboard/voice-setup/buy');
      }, 1500);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Fatal error during infrastructure provisioning.';
      console.error(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  return (
    <DashboardLayout fullWidth>
      <div className="flex-1 flex flex-col items-center justify-center bg-background dark:bg-slate-950 p-6 sm:p-12 min-h-screen relative overflow-hidden scrollbar-premium">

        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 items-center">

          {/* Left Column: Vision & Trust */}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center shadow-glow-blue rotate-3 hover:rotate-0 transition-transform duration-500">
                <Building2 size={32} />
              </div>
              <h1 className="text-5xl font-black text-foreground tracking-tighter leading-[0.9]">
                Provision <span className="text-primary italic">Enterprise</span> Infrastructure.
              </h1>
              <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-md italic opacity-80">
                Setup your dedicated voice subaccount. A one-time initialization to unlock global telecommunication nodes.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: <ShieldCheck className="text-success" />,
                  title: 'Secure Isolation',
                  desc: 'Dedicated SID for isolated voice data processing.'
                },
                {
                  icon: <Zap className="text-primary" />,
                  title: 'Instant Activation',
                  desc: 'Zero-latency infrastructure provisioning.'
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-premium-sm">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Panel */}
          <div className="relative">
            {success ? (
              <div className="bg-card rounded-[3rem] border border-border shadow-premium-2xl p-12 text-center relative overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="absolute top-0 inset-x-0 h-2 bg-success shadow-glow-green" />
                <div className="w-24 h-24 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-8 animate-bounce">
                  <CheckCircle size={48} />
                </div>
                <h3 className="text-3xl font-black text-foreground tracking-tight mb-4">Infrastructure Ready</h3>
                <p className="text-muted-foreground font-medium mb-10 text-sm leading-relaxed">
                  Authentication successful. Redirecting to number acquisition module...
                </p>
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <button
                    onClick={() => navigate('/dashboard/voice-setup/buy')}
                    className="flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-[1.25rem] shadow-glow-blue transition-all hover:-translate-y-1 active:scale-95"
                  >
                    Proceed Now
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : existingSubaccount ? (
              <div className="bg-card rounded-[3rem] border border-border shadow-premium-2xl p-12 relative overflow-hidden animate-in slide-in-from-right-4 duration-500">
                <div className="absolute top-0 inset-x-0 h-2 bg-primary shadow-glow-blue" />
                <div className="mb-10">
                  <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">Node Detected</h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Active Subaccount session located</p>
                </div>

                <div className="bg-muted/30 rounded-[2rem] p-8 border border-border/50 mb-10 space-y-6">
                  <div>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-2 opacity-60">Provisioned Title</p>
                    <p className="text-xl font-black text-foreground tracking-tight">{existingSubaccount.friendly_name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-2 opacity-60">System Identifier (SID)</p>
                    <p className="text-[10px] font-mono font-bold text-primary break-all bg-primary/5 p-3 rounded-xl border border-primary/10">
                      {existingSubaccount.sid}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/dashboard/voice-setup/buy')}
                  className="w-full flex items-center justify-center gap-4 px-10 py-5 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-[1.5rem] shadow-glow-blue transition-all hover:-translate-y-1 active:scale-95 group"
                >
                  Enter Marketplace
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="bg-card rounded-[3rem] border border-border shadow-premium-2xl p-12 relative overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
                <div className="absolute top-0 inset-x-0 h-2 bg-primary/20" />

                <div className="mb-10">
                  <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">Initialize Instance</h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Required System Parameter</p>
                </div>

                <div className="space-y-8 mb-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                      Business Identity <span className="text-destructive">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                        <ArrowRight size={18} />
                      </div>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Nexus Corp"
                        className="w-full h-18 pl-14 pr-6 rounded-[1.25rem] border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-[1.25rem] p-5 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                      <AlertCircle className="text-destructive shrink-0 mt-0.5" size={18} />
                      <p className="text-[10px] font-black text-destructive uppercase tracking-wide leading-relaxed">{error}</p>
                    </div>
                  )}

                  {hasSubscription === false && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-[1.25rem] p-6 text-center space-y-4">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-relaxed">
                        Active quota required to initialize nodes.
                      </p>
                      <button
                        onClick={() => navigate('/dashboard/plans')}
                        className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
                      >
                        Browse Infrastructure Tiers
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCreateSubaccount}
                  disabled={loading || !businessName.trim() || hasSubscription === false}
                  className={`w-full flex items-center justify-center gap-4 px-10 py-5 font-black uppercase tracking-widest text-xs rounded-[1.5rem] transition-all ${hasSubscription === false
                    ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border opacity-50'
                    : 'bg-primary text-primary-foreground shadow-glow-blue hover:-translate-y-1 active:scale-95'
                    }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Provisioning Node...
                    </>
                  ) : (
                    <>
                      {hasSubscription === false ? 'Quota Required' : 'Initialize Infrastructure'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Action Bar Background Glow */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px] -z-10" />
          </div>
        </div>

        {/* Footer Integrity */}
        <div className="mt-20 flex items-center gap-2 opacity-40">
          <ShieldAlert size={14} className="text-primary" />
          <span className="text-[9px] font-black text-foreground uppercase tracking-[0.3em]">
            AES-256 Cloud Infrastructure Encryption Active
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SetupSubaccount;
