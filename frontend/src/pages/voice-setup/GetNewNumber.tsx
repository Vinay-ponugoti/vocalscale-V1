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

interface ProviderNumber {
  phone_number: string;
  friendly_name: string;
  monthly_cost: number;
  item_badge?: string;
}

type TelephonyProvider = 'telnyx' | 'signalwire';
const PROVIDER_STORAGE_KEY = 'voice_ai_telephony_provider';
const SEARCH_PAGE_SIZE = 10;

const GetNewNumber = () => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState<TelephonyProvider>(() => {
    const saved = sessionStorage.getItem(PROVIDER_STORAGE_KEY);
    return saved === 'telnyx' || saved === 'signalwire' ? saved : 'signalwire';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter] = useState('local');
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [pageCache, setPageCache] = useState<Record<number, PhoneNumber[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [checkingSubaccount, setCheckingSubaccount] = useState(true);
  const [checkingLimits, setCheckingLimits] = useState(true);
  const [limitReached, setLimitReached] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');
  const [manualPhoneNumber, setManualPhoneNumber] = useState('');
  const [manualFriendlyName, setManualFriendlyName] = useState('');
  const [manualProviderSid, setManualProviderSid] = useState('');
  const [importingExisting, setImportingExisting] = useState(false);

  const checkLimits = useCallback(async () => {
    try {
      const apiUrl = env.API_URL;
      const headers = await getAuthHeader();

      const subscription = await billingApi.getSubscription().catch(() => null);

      // Check subscription status - backend requires active or trialing subscription
      const subscriptionStatus = subscription?.status?.toLowerCase();
      if (!subscription || (subscriptionStatus !== 'active' && subscriptionStatus !== 'trialing')) {
        setLimitReached(true);
        setLimitMessage(
          subscriptionStatus
            ? `Active subscription required to add phone numbers (current status: ${subscriptionStatus})`
            : 'Active subscription required to add phone numbers. Please subscribe to a plan first.'
        );
        setCheckingLimits(false);
        return;
      }

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
        setError(errData.error || errData.detail || 'Failed to verify business account status');
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
      <DashboardLayout fullWidth>
        <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[hsl(var(--ds-off-white))] p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-cyan-100 bg-cyan-50">
            <Loader2 className="h-7 w-7 animate-spin text-cyan-700" />
          </div>
          <div className="text-center">
            <h3 className="mb-1 text-base font-black tracking-tight text-slate-950">Verifying account</h3>
            <p className="text-sm font-medium text-slate-500">Checking provider setup before number search.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state for business account
  if (error && error.includes('business account')) {
    return (
      <DashboardLayout fullWidth>
        <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--ds-off-white))] p-6">
          <div className="w-full max-w-md rounded-lg border border-rose-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="mb-3 text-2xl font-black tracking-tight text-slate-950">Status mismatch</h2>
            <p className="mb-8 text-sm font-medium leading-6 text-slate-500">{error}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setError(null);
                  setCheckingSubaccount(true);
                  checkSubaccountStatus();
                }}
                className="flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-xs font-bold text-white transition-colors hover:bg-slate-800"
              >
                Retry Verification
              </button>
              <button
                onClick={() => navigate('/dashboard/voice-setup')}
                className="flex h-11 w-full items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Return to Overview
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const searchNumbers = async (pageToLoad: unknown = 1, forceFetch = false) => {
    const pageNumber = typeof pageToLoad === 'number' ? pageToLoad : 1;

    if (!searchQuery.trim()) {
      setError("Please enter a location");
      return;
    }

    if (pageNumber < 1) return;

    const cachedPage = pageCache[pageNumber];
    if (!forceFetch && cachedPage) {
      setNumbers(cachedPage);
      setCurrentPage(pageNumber);
      setSelectedNumber(cachedPage[0] || null);
      setError(null);
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
          limit: SEARCH_PAGE_SIZE,
          page: pageNumber,
          provider
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || 'Failed to fetch numbers');
      }

      const data = await response.json();

      const mappedNumbers: PhoneNumber[] = (data.available || []).map((item: ProviderNumber) => ({
        phone_number: item.phone_number,
        number: item.friendly_name,
        location: data.location || searchQuery,
        monthly_cost: item.monthly_cost,
        badge: item.item_badge
      }));

      if (pageNumber > 1 && mappedNumbers.length === 0) {
        setHasMorePages(false);
        setError('No more numbers found for this search.');
        return;
      }

      setPageCache((prev) => ({ ...prev, [pageNumber]: mappedNumbers }));
      setNumbers(mappedNumbers);
      setCurrentPage(pageNumber);
      setHasMorePages(Boolean(data.has_more) || mappedNumbers.length === SEARCH_PAGE_SIZE);

      if (mappedNumbers.length > 0) {
        setSelectedNumber(mappedNumbers[0]);
      } else {
        setSelectedNumber(null);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to find numbers. Please try a different location.";
      console.error(err);
      setError(errorMessage);
      if (pageNumber === 1) {
        setNumbers([]);
        setPageCache({});
        setHasMorePages(false);
      }
    } finally {
      setSearching(false);
    }
  };

  const startSearch = () => {
    setNumbers([]);
    setSelectedNumber(null);
    setCurrentPage(1);
    setHasMorePages(false);
    setPageCache({});
    searchNumbers(1, true);
  };

  const handleActivate = async () => {
    if (!selectedNumber) return;

    // Double-check subscription status before making request
    try {
      const subscription = await billingApi.getSubscription().catch(() => null);
      const subscriptionStatus = subscription?.status?.toLowerCase();
      if (!subscription || (subscriptionStatus !== 'active' && subscriptionStatus !== 'trialing')) {
        setError(
          subscriptionStatus
            ? `Active subscription required (current status: ${subscriptionStatus})`
            : 'Active subscription required to add phone numbers. Please subscribe to a plan first.'
        );
        return;
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      // Continue anyway - backend will validate
    }

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
          phone_number: selectedNumber.phone_number,
          friendly_name: selectedNumber.number || selectedNumber.phone_number,
          provider
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (errData.code === 'provider_number_limit_reached') {
          throw new Error(errData.message || 'SignalWire has reached its phone number limit. Sync an existing number or switch providers.');
        }
        throw new Error(errData.details || errData.detail || errData.error || 'Failed to purchase number');
      }

      const result = await response.json();

      // If response.ok is true, we assume success unless explicit error
      // Some endpoints might return { success: true } or just the created object
      if (result.success || result.id || result.phone_number || !result.error) {
        navigate('/dashboard/voice-setup');
      } else {
        throw new Error(result.error || 'Failed to purchase number');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to activate number. Please try again.";
      console.error(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const normalizePhoneNumber = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.startsWith('+')) return trimmed;
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
    return trimmed;
  };

  const handleImportExistingNumber = async () => {
    const phoneNumber = normalizePhoneNumber(manualPhoneNumber);
    if (!phoneNumber || !phoneNumber.startsWith('+')) {
      setError('Enter the number in E.164 format, like +12065550123.');
      return;
    }

    setImportingExisting(true);
    setError(null);
    try {
      const apiUrl = env.API_URL;
      const headers = await getAuthHeader();
      const response = await fetch(`${apiUrl}/phone-numbers/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          friendly_name: manualFriendlyName.trim() || phoneNumber,
          provider_sid: manualProviderSid.trim() || undefined,
          provider
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.details || data.detail || data.error || 'Failed to use existing number');
      }

      navigate('/dashboard/voice-setup');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to use existing number.';
      console.error(err);
      setError(errorMessage);
    } finally {
      setImportingExisting(false);
    }
  };

  return (
    <DashboardLayout fullWidth>
      <div className="flex h-full min-h-screen flex-col overflow-hidden bg-[hsl(var(--ds-off-white))] text-slate-950">
        {/* Progress Header */}
        <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 md:px-6 xl:px-8">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/dashboard/voice-setup')}
              className="group flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-950"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-lg font-black tracking-tight text-slate-950">Get a Number</h2>
              <p className="text-xs font-medium text-slate-500">Choose provider inventory and activate a line.</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1.5 w-8 rounded-full transition-all ${step <= 2 ? 'bg-cyan-700' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </header>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-36">
          <div className="mx-auto w-full max-w-[1500px] space-y-5 px-4 py-5 md:px-6 md:py-8 xl:px-8">

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h1 className="mb-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                Choose a business number
              </h1>
              <p className="max-w-3xl text-sm font-medium leading-6 text-slate-500">
                Search local or toll-free inventory from your selected provider. SignalWire offers a compatibility-first setup; Telnyx is better for lower call cost at scale.
              </p>

              {/* Provider Selection */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {([
                  { id: 'signalwire' as const, label: 'SignalWire', desc: 'Compatibility-first setup' },
                  { id: 'telnyx' as const, label: 'Telnyx', desc: 'Lower usage cost' },
                ]).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setProvider(p.id);
                      sessionStorage.setItem(PROVIDER_STORAGE_KEY, p.id);
                      setNumbers([]);
                      setSelectedNumber(null);
                      setCurrentPage(1);
                      setHasMorePages(false);
                      setPageCache({});
                      setHasSearched(false);
                    }}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      provider === p.id
                        ? 'border-cyan-100 bg-cyan-50 text-cyan-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50/30'
                    }`}
                  >
                    <span className="text-sm font-black tracking-tight">{p.label}</span>
                    <span className="mt-1 block text-xs font-medium text-slate-500">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {!checkingLimits && (
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-1">
                  <h3 className="text-lg font-black tracking-tight text-slate-950">Use an existing provider number</h3>
                  <p className="text-sm font-medium leading-6 text-slate-500">
                    Type a number you already own with {provider === 'signalwire' ? 'SignalWire' : 'Telnyx'}. If it exists in the provider account, VocalScale will attach it with the real provider ID.
                  </p>
                </div>

                {limitReached && (
                  <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm font-semibold text-amber-700">
                    {limitMessage}
                  </div>
                )}

                <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">Phone Number</label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 placeholder:text-slate-400 transition-all focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                      placeholder="+12065550123"
                      value={manualPhoneNumber}
                      onChange={(e) => setManualPhoneNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">Label</label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 placeholder:text-slate-400 transition-all focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                      placeholder="Main line"
                      value={manualFriendlyName}
                      onChange={(e) => setManualFriendlyName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">Provider SID</label>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 placeholder:text-slate-400 transition-all focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                      placeholder="Optional"
                      value={manualProviderSid}
                      onChange={(e) => setManualProviderSid(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleImportExistingNumber}
                      disabled={importingExisting || limitReached || !manualPhoneNumber.trim()}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-cyan-700 px-5 text-xs font-bold text-white transition-colors hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
                    >
                      {importingExisting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Use Number
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Limit Reached Warning */}
            {limitReached ? (
              <div className="rounded-lg border border-amber-100 bg-amber-50 p-6 md:p-8">
                <div className="flex flex-col items-center gap-5 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-amber-100 bg-white text-amber-600">
                    <ShieldAlert size={28} />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-black tracking-tight text-slate-950">Number limit reached</h3>
                    <p className="mx-auto max-w-lg text-sm font-medium leading-6 text-slate-600">
                      {limitMessage} Upgrade your plan to add more phone numbers.
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <button
                      onClick={() => navigate('/dashboard/voice-setup')}
                      className="h-10 rounded-md border border-slate-200 bg-white px-5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Dismiss
                    </button>
                    <Link
                      to="/dashboard/billing"
                      className="flex h-10 items-center justify-center rounded-md bg-amber-500 px-5 text-xs font-bold text-white transition-colors hover:bg-amber-600"
                    >
                      Expand Plan
                    </Link>
                  </div>
                </div>
              </div>
            ) : checkingLimits ? (
              <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-12 md:p-20">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-9 w-9 animate-spin text-cyan-700" />
                  <span className="text-xs font-bold text-slate-500">Checking quota...</span>
                </div>
              </div>
            ) : (
              /* Search Card */
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-grow relative group/input">
                    <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center">
                      <MapPin className="h-5 w-5 text-slate-400 transition-colors group-focus-within/input:text-cyan-700" />
                    </div>
                    <input
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-950 placeholder:text-slate-400 transition-all focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                      placeholder="Enter City, State, or area code (e.g. 212)"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && startSearch()}
                    />
                  </div>
                  <button
                    onClick={startSearch}
                    disabled={searching}
                    className="flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-6 text-xs font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                  >
                    {searching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Search Numbers
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Results Header */}
            {!limitReached && !checkingLimits && hasSearched && (
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-3 text-lg font-black tracking-tight text-slate-950">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-100 bg-cyan-50 text-cyan-700">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  Available Numbers
                </h3>
                <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-500">
                    Page {currentPage} · {numbers.length} shown
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && !error.includes('business account') && (
              <div className="flex items-center gap-4 rounded-lg border border-rose-100 bg-rose-50 p-4 text-rose-700 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="rounded-md bg-rose-100 p-2">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                </div>
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            {/* Loading Grid Skeleton */}
            {searching && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex h-40 animate-pulse flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5">
                    <div className="h-5 w-3/4 rounded bg-slate-100" />
                    <div className="h-4 w-1/2 rounded bg-slate-100" />
                    <div className="mt-auto h-8 w-full rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            )}

            {/* Results Grid */}
            {!searching && numbers.length > 0 && (
              <div className="space-y-4 pb-24 md:pb-0">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {numbers.map((item, index) => {
                    const isSelected = selectedNumber?.phone_number === item.phone_number;
                    return (
                      <div
                        key={item.phone_number}
                        onClick={() => setSelectedNumber(item)}
                        className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border p-5 transition-colors ${isSelected
                          ? 'border-cyan-200 bg-cyan-50/60 shadow-sm ring-1 ring-cyan-100'
                          : 'border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/30'
                          }`}
                      >
                        {/* Selection indicator */}
                        <div className={`absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full transition-all ${isSelected
                          ? 'bg-cyan-700 text-white'
                          : 'border border-slate-200 text-transparent group-hover:text-slate-300'
                          }`}>
                          {isSelected && <Check className="h-4 w-4" strokeWidth={3} />}
                        </div>

                        {/* Badge */}
                        <div className="mb-5 flex flex-wrap gap-2 pr-10">
                          {index === 0 && !item.badge && (
                            <span className="rounded-md border border-cyan-100 bg-cyan-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-700">
                              Optimal Match
                            </span>
                          )}
                          {item.badge && (
                            <span className="rounded-md border border-cyan-100 bg-cyan-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-700">
                              {item.badge}
                            </span>
                          )}
                          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Local
                          </span>
                        </div>

                        {/* Number */}
                        <h4 className={`mb-2 text-2xl font-black tracking-tight ${isSelected ? 'text-cyan-800' : 'text-slate-950'
                          }`}>
                          {item.number}
                        </h4>

                        {/* Location */}
                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {item.location}
                        </p>

                        {/* Price */}
                        <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-5">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs font-bold text-slate-400">$</span>
                            <span className="text-2xl font-black text-slate-950">{item.monthly_cost.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <button
                    type="button"
                    onClick={() => searchNumbers(currentPage - 1)}
                    disabled={searching || currentPage === 1}
                    className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <span className="text-xs font-bold text-slate-500">
                    {SEARCH_PAGE_SIZE} per call
                  </span>
                  <button
                    type="button"
                    onClick={() => searchNumbers(currentPage + 1)}
                    disabled={searching || !hasMorePages}
                    className="flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-xs font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Empty State - No Results */}
            {!searching && numbers.length === 0 && hasSearched && !error && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white py-20">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                  <Search className="h-7 w-7 text-slate-300" />
                </div>
                <div className="text-center">
                  <p className="mb-2 text-lg font-black tracking-tight text-slate-950">No numbers found</p>
                  <p className="mx-auto max-w-[260px] text-sm font-medium leading-6 text-slate-500">
                    Provider inventory changes often. Try a nearby area code or search by city name.
                  </p>
                </div>
              </div>
            )}

            {/* Empty State - Initial */}
            {!searching && numbers.length === 0 && !hasSearched && !limitReached && !checkingLimits && (
              <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-white py-16 md:py-24">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                  <MapPin className="h-7 w-7 text-slate-300" />
                </div>
                <div className="mx-auto max-w-sm space-y-2 px-4 text-center">
                  <p className="text-xl font-black tracking-tight text-slate-950">Search for a number</p>
                  <p className="text-sm font-medium leading-6 text-slate-500">
                    Enter a city, state, ZIP code, or area code to check provider inventory.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Action Bar */}
        {!limitReached && !checkingLimits && (
          <div className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 animate-in slide-in-from-bottom-8 duration-500">
            <div className={`flex flex-col items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950 p-4 text-white shadow-xl transition-all sm:flex-row ${selectedNumber ? 'opacity-100 scale-100' : 'pointer-events-none scale-95 opacity-40 grayscale'}`}>

              {/* Selected Number Info */}
              <div className="flex w-full items-center gap-4 sm:w-auto">
                {selectedNumber ? (
                  <div className="flex w-full items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md border border-white/10 bg-white/10">
                      <Smartphone className="h-5 w-5 text-cyan-300" />
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-white/40">Selected Number</p>
                      <h4 className="text-xl font-black leading-none tracking-tight text-white">{selectedNumber.number}</h4>
                    </div>
                    <div className="hidden h-10 w-px bg-white/10 md:block" />
                    <div className="hidden md:block">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-white/40">Price</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-white">${selectedNumber.monthly_cost.toFixed(2)}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">/ mo</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-white/40">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10">
                      <Info className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider">Pick a number to continue</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex w-full items-center gap-3 sm:w-auto">
                <button
                  onClick={handleActivate}
                  disabled={!selectedNumber || loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-cyan-600 px-6 text-xs font-bold text-white transition-colors hover:bg-cyan-700 disabled:bg-white/5 disabled:text-white/20 sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Purchasing...
                    </>
                  ) : (
                    <>
                      Buy Number
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
