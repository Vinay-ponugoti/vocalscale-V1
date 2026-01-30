import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Check,
  ArrowRight,
  Loader2,
  AlertCircle,
  Smartphone,
  Info,
  MapPin,
  ArrowLeft
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Verifying your business account...</p>
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
          <div className="max-w-md w-full bg-card rounded-2xl border border-border shadow-premium-lg p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Verification Problem</h2>
            <p className="text-muted-foreground mb-8">{error}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setError(null);
                  setCheckingSubaccount(true);
                  checkSubaccountStatus();
                }}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all shadow-glow-blue flex items-center justify-center gap-2"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard/voice-setup')}
                className="w-full py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-all"
              >
                Go Back
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
          limit: 8
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to fetch numbers');
      }

      const data = await response.json();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to activate number. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Main scrollable container */}
      <div className="min-h-full pb-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Back Button & Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard/voice-setup')}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Voice Setup
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Get a New Number
            </h1>
            <p className="text-muted-foreground mt-1">
              Establish a local presence or go toll-free. Your AI receptionist is ready immediately.
            </p>
          </div>

          {/* Limit Reached Warning */}
          {limitReached ? (
            <div className="bg-amber-50 dark:bg-amber-950 rounded-2xl border border-amber-200 dark:border-amber-800 p-6 sm:p-8 mb-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <AlertCircle size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-2">
                    Phone Number Limit Reached
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 max-w-lg mx-auto">
                    {limitMessage}
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Please upgrade your plan to add more numbers.
                  </p>
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => navigate('/dashboard/voice-setup')}
                    className="px-5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 font-semibold text-sm hover:bg-amber-100 dark:hover:bg-amber-900 transition-all bg-white dark:bg-transparent"
                  >
                    Cancel
                  </button>
                  <Link
                    to="/dashboard/billing"
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    Upgrade Plan
                  </Link>
                </div>
              </div>
            </div>
          ) : checkingLimits ? (
            <div className="bg-card rounded-2xl border border-border p-12 mb-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            /* Search Card */
            <div className="bg-card rounded-2xl border border-border shadow-premium-sm p-4 sm:p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-grow relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all text-sm font-medium"
                    placeholder="Search by City, State, or ZIP (e.g. 90210)"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchNumbers()}
                  />
                </div>
                <button
                  onClick={searchNumbers}
                  disabled={searching}
                  className="h-12 px-6 sm:px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all shadow-glow-blue flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50"
                >
                  {searching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Results Header */}
          {!limitReached && !checkingLimits && (
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                Available Numbers
              </h3>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                {numbers.length} found
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && !error.includes('business account') && (
            <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {searching && (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
              <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-4 shadow-sm">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <p className="text-muted-foreground font-medium text-sm">Finding available numbers...</p>
            </div>
          )}

          {/* Results Grid */}
          {!searching && numbers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {numbers.map((item, index) => {
                const isSelected = selectedNumber?.phone_number === item.phone_number;
                return (
                  <div
                    key={item.phone_number}
                    onClick={() => setSelectedNumber(item)}
                    className={`group relative flex flex-col rounded-2xl p-5 cursor-pointer transition-all duration-200 border-2 ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md ring-4 ring-primary/10'
                        : 'border-border bg-card hover:border-primary/30 hover:shadow-premium hover:-translate-y-1'
                    }`}
                  >
                    {/* Selection indicator */}
                    <div className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-primary scale-110 shadow-glow-blue'
                        : 'border-2 border-border group-hover:border-primary/50'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />}
                    </div>

                    {/* Badge */}
                    {index === 0 && !item.badge && (
                      <span className="inline-flex self-start px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-md mb-3">
                        Best Match
                      </span>
                    )}
                    {item.badge && (
                      <span className="inline-flex self-start px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-md mb-3">
                        {item.badge}
                      </span>
                    )}

                    {/* Number */}
                    <h4 className={`text-xl font-bold tracking-tight font-mono mb-1 ${
                      isSelected ? 'text-primary' : 'text-foreground'
                    }`}>
                      {item.number}
                    </h4>
                    
                    {/* Location */}
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </p>

                    {/* Price */}
                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Monthly</span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-xs text-muted-foreground">$</span>
                        <span className="text-lg font-bold text-foreground">{item.monthly_cost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State - No Results */}
          {!searching && numbers.length === 0 && hasSearched && !error && (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
              <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-4 shadow-sm">
                <Search className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium text-sm">No numbers found. Try a different location.</p>
            </div>
          )}

          {/* Empty State - Initial */}
          {!searching && numbers.length === 0 && !hasSearched && !limitReached && !checkingLimits && (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
              <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-4 shadow-sm">
                <MapPin className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium text-sm">Enter a location to find available numbers</p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer Bar */}
      {!limitReached && !checkingLimits && (
        <div className="fixed bottom-0 left-0 right-0 md:left-[288px] bg-card/95 backdrop-blur-lg border-t border-border p-4 sm:p-5 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Selected Number Info */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {selectedNumber ? (
                <div className="flex items-center gap-4 w-full">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">Selected</p>
                    <p className="text-base sm:text-lg font-bold text-primary font-mono truncate">{selectedNumber.number}</p>
                  </div>
                  <div className="h-10 w-px bg-border hidden sm:block" />
                  <div className="hidden sm:block">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">Monthly</p>
                    <p className="text-base sm:text-lg font-bold text-foreground">
                      ${selectedNumber.monthly_cost.toFixed(2)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Info className="w-5 h-5" />
                  <p className="text-sm font-medium">Select a number to continue</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/dashboard/voice-setup')}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-border bg-background text-muted-foreground font-semibold text-sm hover:bg-muted hover:text-foreground transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleActivate}
                disabled={!selectedNumber || loading}
                className="flex-[2] sm:flex-none px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold text-sm shadow-glow-blue transition-all flex items-center justify-center gap-2 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    Activate Number
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
</div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default GetNewNumber;
