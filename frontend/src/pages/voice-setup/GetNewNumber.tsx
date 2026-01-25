import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Check,
  Grid,
  ArrowRight,
  Loader2,
  AlertCircle,
  Smartphone,
  Info
} from 'lucide-react';
import { env } from '../../config/env';
import { getAuthHeader } from '../../lib/api';

// ============ CUSTOM HOOKS ============
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

interface PhoneNumber {
  phone_number: string;
  number: string;
  location: string;
  monthly_cost: number;
  badge?: string;
}

const GetNewNumber = () => {
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter] = useState('local'); // 'local', 'tollfree', 'vanity'
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [checkingSubaccount, setCheckingSubaccount] = useState(true);

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

        // Verify subaccount is active
        const status = data.subaccount?.status?.toLowerCase();
        if (data.subaccount && status && status !== 'active') {
          setError(`Your business account status is currently "${data.subaccount.status}". Please contact support if this persists.`);
          // Don't navigate away yet, let them see the error
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.detail || 'Failed to verify business account status');
        console.log('Subaccount check failed:', errData.detail);
      }
    } catch (err) {
      console.error('Error checking subaccount:', err);
      const message = err instanceof Error ? err.message : 'Error connecting to server';
      setError(message);
    } finally {
      setCheckingSubaccount(false);
    }
  }, [navigate]);

  // Check if user has subaccount on mount
  useEffect(() => {
    checkSubaccountStatus();
  }, [checkSubaccountStatus]);

  if (checkingSubaccount) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-slate-600 font-medium">Verifying your business account...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && error.includes('business account')) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-6 border border-red-100">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Verification Problem</h2>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              {error}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setError(null);
                  setCheckingSubaccount(true);
                  checkSubaccountStatus();
                }}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                <Loader2 className={`w-4 h-4 animate-spin ${!checkingSubaccount ? 'hidden' : ''}`} />
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard/voice-setup')}
                className="w-full py-4 bg-white border-2 border-slate-100 text-slate-500 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-50 transition-all"
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
          type_filter: typeFilter === 'toll-free' ? 'tollfree' : typeFilter, // Map 'toll-free' to 'tollfree'
          limit: 8
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to fetch numbers');
      }

      const data = await response.json();
      setNumbers(data.numbers || []);

      // Select the first number (Best Match) by default if available
      if (data.numbers && data.numbers.length > 0) {
        setSelectedNumber(data.numbers[0]);
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

  // Search on mount and when filter changes
  // useEffect(() => {
  //   searchNumbers();
  // }, [typeFilter]);

  const handleSearch = () => {
    searchNumbers();
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
    <DashboardLayout fullWidth>
      <div className={`flex flex-col ${isMobile ? 'h-[calc(100vh-64px)]' : 'h-[calc(100vh-64px)]'} bg-white font-sans text-slate-900 overflow-hidden`}>
        <div className="flex-1 overflow-y-auto w-full">
          <div className={`max-w-6xl mx-auto ${isMobile ? 'px-4 pt-6' : 'px-6 pt-10'} pb-24`}>

            {/* Header */}
            <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
              <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-black text-slate-900 tracking-tight`}>Get a New Number</h1>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-500 font-medium mt-1`}>Establish a local presence or go toll-free. Your AI receptionist is ready immediately.</p>
            </div>

            {/* Search and Filters Card */}
            <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${isMobile ? 'p-4' : 'p-6'} mb-6 md:mb-8`}>
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <div className="flex-grow relative">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-slate-400`} />
                  <input
                    className={`w-full ${isMobile ? 'h-11 pl-10' : 'h-12 pl-12'} pr-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium bg-slate-50/50`}
                    placeholder={isMobile ? "City, State, or ZIP" : "Search City, State, or ZIP (e.g. 90210)"}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className={`${isMobile ? 'h-11 px-6' : 'h-12 px-8'} bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 min-w-[140px] hover:-translate-y-0.5`}
                >
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search Numbers'}
                </button>
              </div>
            </div>

            {/* Results Grid Header */}
            <div className="mb-4 md:mb-6 flex items-center justify-between">
              <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight`}>
                <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100`}>
                  <Grid className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                </div>
                Available
              </h3>
              <span className={`${isMobile ? 'text-[9px] px-2 py-1' : 'text-xs px-3 py-1.5'} font-black text-slate-500 bg-slate-50 border border-slate-200 rounded-full uppercase tracking-widest`}>
                {numbers.length} found
              </span>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-bold">{error}</p>
              </div>
            )}

            {searching ? (
              <div className={`flex flex-col items-center justify-center ${isMobile ? 'py-16' : 'py-24'} bg-slate-50/50 rounded-2xl border-2 border-slate-100 border-dashed`}>
                <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm`}>
                  <Loader2 className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-indigo-600 animate-spin`} />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Finding available numbers...</p>
              </div>
            ) : numbers.length > 0 ? (
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5`}>
                {numbers.map((item) => {
                  const isSelected = selectedNumber?.phone_number === item.phone_number;
                  return (
                    <div
                      key={item.phone_number}
                      onClick={() => setSelectedNumber(item)}
                      className={`group relative flex flex-col rounded-2xl ${isMobile ? 'p-5' : 'p-6'} cursor-pointer transition-all border-2 ${isSelected
                          ? 'border-indigo-600 bg-indigo-50/30 shadow-md ring-4 ring-indigo-500/5'
                          : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-lg hover:-translate-y-1'
                        }`}
                    >
                      <div className={`absolute top-4 right-4 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'} rounded-full flex items-center justify-center transition-all ${isSelected
                          ? 'bg-indigo-600 scale-110 shadow-lg shadow-indigo-600/30'
                          : 'border-2 border-slate-200 group-hover:border-indigo-400'
                        }`}>
                        {isSelected && <Check className={`${isMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-white`} strokeWidth={3} />}
                      </div>

                      <div className={`flex flex-col gap-1 ${isMobile ? 'mb-4' : 'mb-6'}`}>
                        <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'
                          }`}>
                          {item.badge || (isSelected ? 'Selected' : 'Standard')}
                        </span>
                        <h4 className={`text-xl md:text-2xl font-black tracking-tighter font-mono ${isSelected ? 'text-indigo-700' : 'text-slate-900'
                          }`}>
                          {item.number}
                        </h4>
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 flex items-center gap-1 mt-1">
                          {item.location}
                        </p>
                      </div>

                      <div className={`mt-auto pt-3 md:pt-4 border-t border-slate-100 flex items-center justify-between`}>
                        {item.badge ? (
                          <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 md:py-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-100/50 border border-indigo-200">
                            {item.badge}
                          </span>
                        ) : (
                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly</span>
                        )}
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-[10px] md:text-xs font-bold text-slate-400">$</span>
                          <span className="text-lg md:text-xl font-black text-slate-900">{item.monthly_cost.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (!error && hasSearched) ? (
              <div className={`flex flex-col items-center justify-center ${isMobile ? 'py-16' : 'py-24'} bg-slate-50/50 rounded-2xl border-2 border-slate-100 border-dashed`}>
                <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm`}>
                  <Search className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-slate-300`} />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No numbers found. Try a different location.</p>
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center ${isMobile ? 'py-16' : 'py-24'} bg-slate-50/50 rounded-2xl border-2 border-slate-100 border-dashed`}>
                <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm`}>
                  <Search className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-slate-300`} />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Enter a location to find available numbers</p>
              </div>
            )}

          </div>
        </div>

        {/* Fixed Footer Bar */}
        <div className={`shrink-0 bg-white border-t border-slate-100 ${isMobile ? 'p-4' : 'p-6'} z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]`}>
          <div className={`max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between ${isMobile ? 'gap-4' : 'gap-6'}`}>

            <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
              {selectedNumber ? (
                <div className="flex items-center gap-4 md:gap-6 w-full">
                  <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0`}>
                    <Smartphone className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-indigo-600`} />
                  </div>
                  <div className="flex-grow">
                    <p className="text-[9px] md:text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Selected Line</p>
                    <p className={`${isMobile ? 'text-base' : 'text-xl'} font-black text-indigo-600 font-mono tracking-tight`}>{selectedNumber.number}</p>
                  </div>
                  <div className="h-8 md:h-10 w-px bg-slate-100"></div>
                  <div>
                    <p className="text-[9px] md:text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">{isMobile ? 'Cost' : 'Monthly Cost'}</p>
                    <p className={`${isMobile ? 'text-base' : 'text-xl'} font-black text-slate-900`}>${selectedNumber.monthly_cost.toFixed(2)}{!isMobile && <span className="text-xs text-slate-400 font-bold ml-1 uppercase tracking-widest">/mo</span>}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-slate-400">
                  <Info className="w-5 h-5" />
                  <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest">Select a number to continue</p>
                </div>
              )}
            </div>

            <div className={`flex items-center ${isMobile ? 'flex-row' : 'flex-row'} gap-3 md:gap-4 w-full md:w-auto`}>
              <button
                onClick={() => navigate('/dashboard/voice-setup')}
                className={`${isMobile ? 'flex-1 py-3' : 'px-8 py-3.5'} rounded-xl border-2 border-slate-100 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 hover:border-slate-200 transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={handleActivate}
                disabled={!selectedNumber || loading}
                className={`${isMobile ? 'flex-[2] py-3' : 'px-10 py-3.5'} rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 md:gap-3 hover:-translate-y-0.5`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    {isMobile ? 'Activate' : 'Activate Number'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GetNewNumber;
