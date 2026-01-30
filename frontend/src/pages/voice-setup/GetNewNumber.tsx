import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Check,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShieldAlert,
  Info
} from 'lucide-react';
import { env } from '../../config/env';
import { getAuthHeader } from '../../lib/api';
import { billingApi } from '../../api/billing';
import { Link } from 'react-router-dom';

interface PhoneNumber {
  phone_number: string;
  number: string;
  location: string;
  monthly_cost: number;
  badge?: string;
}

const GetNewNumber = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter] = useState('local');
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [checkingSubaccount, setCheckingSubaccount] = useState(true);
  const [checkingLimits, setCheckingLimits] = useState(true);
  const [limitReached, setLimitReached] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');

  const checkLimits = useCallback(async () => {
    try {
      const apiUrl = env.API_URL;
      const headers = await getAuthHeader();

      const subscription = await billingApi.getSubscription().catch(() => null);

      const numbersResp = await fetch(`${apiUrl}/phone-numbers`, {
        headers: { 'Content-Type': 'application/json', ...headers }
      });

      let currentCount = 0;
      if (numbersResp.ok) {
        const numbersData = await numbersResp.json();
        currentCount = Array.isArray(numbersData) ? numbersData.length : 0;
      }

      let maxNumbers = 1;
      let planName = 'Starter';

      if (subscription && subscription.plan) {
        planName = subscription.plan.name;
        if (subscription.plan.limits && typeof subscription.plan.limits.max_phone_numbers === 'number') {
          maxNumbers = subscription.plan.limits.max_phone_numbers;
        }
      }

      if (currentCount >= maxNumbers) {
        setLimitReached(true);
        setLimitMessage(`Your ${planName} plan allows ${maxNumbers} phone number${maxNumbers === 1 ? '' : 's'}. You currently have ${currentCount}.`);
      } else {
        setLimitReached(false);
      }

    } catch (err) {
      console.error('Error checking limits:', err);
    } finally {
      setCheckingLimits(false);
    }
  }, []);

  const checkSubaccountStatus = useCallback(async () => {
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
        if (!data.has_subaccount) {
          navigate('/dashboard/voice-setup/setup-subaccount');
          return;
        }

        const status = data.subaccount?.status?.toLowerCase();
        if (data.subaccount && status && status !== 'active') {
          setError(`Your business account status is currently "${data.subaccount.status}". Please contact support if this persists.`);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.detail || 'Failed to verify business account status');
      }
    } catch (err) {
      console.error('Error checking subaccount:', err);
      const message = err instanceof Error ? err.message : 'Error connecting to server';
      setError(message);
    } finally {
      setCheckingSubaccount(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkSubaccountStatus();
    checkLimits();
  }, [checkSubaccountStatus, checkLimits]);

  // Loading state
  if (checkingSubaccount) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div className="absolute -bottom-1 -right-1 size-4 bg-success rounded-full border-2 border-background animate-bounce" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-black uppercase tracking-widest text-foreground mb-1">Authenticating</h3>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em] opacity-60">Verifying enterprise subaccount status</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state for business account
  if (error && error.includes('business account')) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <div className="max-w-md w-full bg-card rounded-[2.5rem] border border-border shadow-premium p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-destructive" />
            <div className="w-20 h-20 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-8 shadow-sm">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-foreground mb-3 tracking-tight leading-none">Status Mismatch</h2>
            <p className="text-muted-foreground font-medium mb-10 leading-relaxed text-sm">{error}</p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  setError(null);
                  setCheckingSubaccount(true);
                  checkSubaccountStatus();
                }}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-glow-blue flex items-center justify-center gap-2"
              >
                Retry Verification
              </button>
              <button
                onClick={() => navigate('/dashboard/voice-setup')}
                className="w-full py-4 bg-muted text-muted-foreground font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-muted/80 transition-all border border-border"
              >
                Return to Overview
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const searchNumbers = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a location");
      return;
    }
    setSearching(true);
    setHasSearched(true);
    setError(null);
    try {
      const apiUrl = env.API_URL;
      const headers = await getAuthHeader();

      const response = await fetch(`${apiUrl}/phone-numbers/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          location: searchQuery,
          type_filter: typeFilter === 'toll-free' ? 'tollfree' : typeFilter,
          limit: 12
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to fetch numbers');
      }

      const data = await response.json();

      const mappedNumbers: PhoneNumber[] = (data.available || []).map((item: any) => ({
        phone_number: item.phone_number,
        number: item.friendly_name,
        location: data.location || searchQuery,
        monthly_cost: item.monthly_cost,
        badge: item.item_badge
      }));

      setNumbers(mappedNumbers);

      if (mappedNumbers.length > 0) {
        setSelectedNumber(mappedNumbers[0]);
      } else {
        setSelectedNumber(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to find numbers. Please try a different location.");
      setNumbers([]);
    } finally {
      setSearching(false);
    }
  };

  const handleActivate = async () => {
    if (!selectedNumber) return;

    setLoading(true);
    try {
      const apiUrl = env.API_URL;
      const headers = await getAuthHeader();

      const response = await fetch(`${apiUrl}/phone-numbers/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          phone_number: selectedNumber.phone_number
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to purchase number');
      }

      const result = await response.json();
      if (result.success) {
        navigate('/dashboard/voice-setup');
      } else {
        throw new Error(result.error || 'Failed to purchase number');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to activate number. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col bg-background dark:bg-slate-950 min-h-screen scrollbar-premium">
        {/* Progress Header */}
        <header className="border-b border-border bg-card px-8 py-5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/dashboard/voice-setup')}
              className="p-2.5 rounded-xl hover:bg-muted transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-active:-translate-x-1 transition-all" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-base font-black tracking-tight text-foreground uppercase">Provision Infrastructure</h2>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest opacity-60">Step 2: Number Acquisition</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step <= 2 ? 'bg-primary shadow-glow-blue' : 'bg-muted'}`}
              />
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pb-40">
          <div className="max-w-5xl mx-auto px-6 py-12 w-full space-y-12">

            <div className="space-y-4">
              <h1 className="text-5xl font-black text-foreground tracking-tighter leading-none mb-6">
                Acquire Local <span className="text-primary italic">Presence.</span>
              </h1>
              <p className="text-muted-foreground text-lg font-medium max-w-2xl leading-relaxed">
                Choose a local or toll-free identity for your AI. Search by region or area code to match your business footprint.
              </p>
            </div>

            {/* Limit Reached Warning */}
            {limitReached ? (
              <div className="bg-amber-500/5 dark:bg-amber-500/5 rounded-[2.5rem] border border-amber-500/20 p-6 md:p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-amber-500/10 transition-all duration-1000" />
                <div className="flex flex-col items-center text-center gap-6 relative z-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-amber-500/20 flex items-center justify-center text-amber-600 shadow-sm border border-amber-500/10">
                    <ShieldAlert size={32} className="md:w-10 md:h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-foreground tracking-tight mb-3">
                      Allocation Limit <span className="text-amber-500">Exceeded</span>
                    </h3>
                    <p className="text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed text-sm md:text-base">
                      {limitMessage} Upgrade your workspace capacity to provision additional telecommunication nodes.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
                    <button
                      onClick={() => navigate('/dashboard/voice-setup')}
                      className="px-8 py-3.5 rounded-2xl bg-muted text-muted-foreground font-black uppercase tracking-widest text-[10px] hover:bg-muted/80 transition-all border border-border w-full sm:w-auto"
                    >
                      Dismiss
                    </button>
                    <Link
                      to="/dashboard/billing"
                      className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[10px] shadow-glow-amber transition-all hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center"
                    >
                      Expand Plan
                    </Link>
                  </div>
                </div>
              </div>
            ) : checkingLimits ? (
              <div className="bg-card rounded-[2.5rem] border border-border p-12 md:p-24 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest animate-pulse">Checking quota...</span>
                </div>
              </div>
            ) : (
              /* Search Card */
              <div className="bg-card rounded-[2.5rem] border border-border shadow-premium-lg p-8 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-2xl group-hover:bg-primary/10 transition-all duration-700" />

                <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                  <div className="flex-grow relative group/input">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      <MapPin className="w-6 h-6 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                    </div>
                    <input
                      className="w-full h-18 pl-16 pr-6 rounded-[1.25rem] border border-border bg-muted/30 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-lg font-bold"
                      placeholder="Enter City, State, or area code (e.g. 212)"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchNumbers()}
                    />
                  </div>
                  <button
                    onClick={searchNumbers}
                    disabled={searching}
                    className="h-18 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.15em] text-[11px] rounded-[1.25rem] transition-all shadow-glow-blue flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5"
                  >
                    {searching ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        Execute Search
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Results Header */}
            {!limitReached && !checkingLimits && hasSearched && (
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  Available Nodes
                </h3>
                <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl border border-border">
                  <div className="size-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {numbers.length} Results Filtered
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && !error.includes('business account') && (
              <div className="bg-destructive/5 border border-destructive/20 text-destructive p-6 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-2 bg-destructive/10 rounded-xl">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            {/* Loading Grid Skeleton */}
            {searching && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-48 rounded-[2rem] bg-card border border-border animate-pulse flex flex-col p-8 gap-4">
                    <div className="h-6 w-3/4 bg-muted rounded-full" />
                    <div className="h-4 w-1/2 bg-muted rounded-full" />
                    <div className="mt-auto h-8 w-full bg-muted rounded-xl" />
                  </div>
                ))}
              </div>
            )}

            {/* Results Grid */}
            {!searching && numbers.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {numbers.map((item, index) => {
                  const isSelected = selectedNumber?.phone_number === item.phone_number;
                  return (
                    <div
                      key={item.phone_number}
                      onClick={() => setSelectedNumber(item)}
                      className={`group relative flex flex-col rounded-[2rem] p-8 cursor-pointer transition-all duration-500 border-2 overflow-hidden ${isSelected
                        ? 'border-primary bg-primary/5 shadow-premium-lg translate-y-[-4px]'
                        : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50 hover:shadow-premium-sm hover:-translate-y-1'
                        }`}
                    >
                      {/* Selection indicator */}
                      <div className={`absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected
                        ? 'bg-primary scale-110 shadow-glow-blue'
                        : 'border-2 border-border group-hover:border-primary/50 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0'
                        }`}>
                        {isSelected && <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />}
                      </div>

                      {/* Badge */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {index === 0 && !item.badge && (
                          <span className="px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 rounded-lg border border-primary/20">
                            Optimal Match
                          </span>
                        )}
                        {item.badge && (
                          <span className="px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 rounded-lg border border-primary/20">
                            {item.badge}
                          </span>
                        )}
                        <span className="px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-muted rounded-lg border border-border/50">
                          Local
                        </span>
                      </div>

                      {/* Number */}
                      <h4 className={`text-2xl font-black tracking-tighter mb-2 ${isSelected ? 'text-primary' : 'text-foreground'
                        }`}>
                        {item.number}
                      </h4>

                      {/* Location */}
                      <p className="text-xs text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2 opacity-60">
                        <MapPin className="w-3.5 h-3.5" />
                        {item.location}
                      </p>

                      {/* Price */}
                      <div className="mt-12 pt-6 border-t border-border/50 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Monthly Cycle</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-[10px] text-muted-foreground/50 font-black">$</span>
                          <span className="text-2xl font-black text-foreground">{item.monthly_cost.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty State - No Results */}
            {!searching && numbers.length === 0 && hasSearched && !error && (
              <div className="flex flex-col items-center justify-center py-24 bg-card rounded-[2.5rem] border-2 border-dashed border-border group">
                <div className="w-24 h-24 rounded-[2rem] bg-muted border border-border flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                  <Search className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-foreground tracking-tight mb-2">Zero Coverage Found</p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-60 max-w-[240px] leading-relaxed mx-auto">
                    Global inventory fluctuates daily. Try a neighboring area code or search by city name.
                  </p>
                </div>
              </div>
            )}

            {/* Empty State - Initial */}
            {!searching && numbers.length === 0 && !hasSearched && !limitReached && !checkingLimits && (
              <div className="flex flex-col items-center justify-center py-16 md:py-32 bg-card rounded-[2.5rem] border-2 border-dashed border-border relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mt-32 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-muted/50 border border-border flex items-center justify-center mb-6 md:mb-8 shadow-sm group-hover:rotate-12 transition-transform duration-500">
                  <MapPin className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground/30" />
                </div>
                <div className="text-center max-w-sm mx-auto space-y-3 md:space-y-4 px-4">
                  <p className="text-xl md:text-2xl font-black text-foreground tracking-tight leading-none">Awaiting Location Logic</p>
                  <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-60 leading-relaxed">
                    Input a geographic identifier above to fetch active telecom infrastructure available in your desired region.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Action Bar */}
        {!limitReached && !checkingLimits && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-4xl z-50 animate-in slide-in-from-bottom-8 duration-500">
            <div className={`bg-slate-900 text-white rounded-[2.5rem] p-4 pl-8 shadow-premium-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-500 ${selectedNumber ? 'opacity-100 scale-100' : 'opacity-40 scale-95 grayscale pointer-events-none'}`}>

              {/* Selected Number Info */}
              <div className="flex items-center gap-6 w-full sm:w-auto">
                {selectedNumber ? (
                  <div className="flex items-center gap-6 w-full">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner group">
                      <Smartphone className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <p className="text-[9px] text-white/40 uppercase font-black tracking-[0.3em] mb-1">Configuration Target</p>
                      <h4 className="text-2xl font-black text-white tracking-tighter leading-none">{selectedNumber.number}</h4>
                    </div>
                    <div className="h-10 w-px bg-white/10 hidden md:block" />
                    <div className="hidden md:block">
                      <p className="text-[9px] text-white/40 uppercase font-black tracking-[0.3em] mb-1">Provision Cost</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-white">${selectedNumber.monthly_cost.toFixed(2)}</span>
                        <span className="text-[8px] text-white/30 font-black uppercase tracking-wider">/ MO</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-white/40">
                    <div className="size-10 rounded-full border border-white/10 flex items-center justify-center">
                      <Info className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest">Select a Node to Provision</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleActivate}
                  disabled={!selectedNumber || loading}
                  className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] shadow-glow-blue transition-all flex items-center justify-center gap-3 disabled:bg-white/5 disabled:text-white/20 disabled:shadow-none hover:-translate-y-1 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      Secure Number
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GetNewNumber;
