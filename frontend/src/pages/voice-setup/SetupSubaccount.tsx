import { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { env } from '../../config/env';
import { getAuthHeader } from '../../lib/api';

import type { Subaccount } from '../../types/voice';

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

const SetupSubaccount = () => {
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingSubaccount, setExistingSubaccount] = useState<Subaccount | null>(null);

  useEffect(() => {
    checkExistingSubaccount();
  }, []);

  const checkExistingSubaccount = async () => {
    try {
      const apiUrl = env.API_URL;
      const headers = await getAuthHeader();

      console.log('🔍 Checking for existing subaccount...');
      const response = await fetch(`${apiUrl}/subaccounts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Subaccount data received:', data);

        // Check if subaccount exists in profile
        if (data.has_subaccount && data.subaccount) {
          const status = data.subaccount.status?.toLowerCase();
          if (status === 'active' || status === 'suspended') {
            setExistingSubaccount(data.subaccount);
            setBusinessName(data.subaccount.friendly_name || '');

            if (status === 'active') {
              console.log('🚀 Active subaccount found, preparring redirect...');
              setSuccess(true);
              // Auto-redirect after a short delay
              setTimeout(() => {
                navigate('/dashboard/voice-setup/buy');
              }, 2000);
            }
          } else {
            setError(`Your account status is "${data.subaccount.status}". Please contact support.`);
          }
        }
      } else {
        console.log('⚠️ Failed to fetch subaccount info:', response.status);
      }
    } catch (err) {
      console.error('❌ Error checking subaccount:', err);
    }
  };

  const handleCreateSubaccount = async () => {
    if (!businessName.trim()) {
      setError('Please enter a business name');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

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
        // Handle conflict - account already exists
        setError(data.detail || 'A business account already exists for your profile.');
        if (data.sid) {
          // If we got the SID, we can technically proceed
          checkExistingSubaccount();
        }
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to create subaccount');
      }

      setExistingSubaccount(data);
      setSuccess(true);

      setTimeout(() => {
        navigate('/dashboard/voice-setup/buy');
      }, 1500);

    } catch (err: unknown) {
      console.error('❌ Create subaccount error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subaccount. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToNumbers = () => {
    navigate('/dashboard/voice-setup/buy');
  };

  return (
    <DashboardLayout>
      <div className={`${isMobile ? 'pt-4 pb-4' : 'pt-6 lg:pt-12 pb-4'} px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-[calc(100vh-64px)] flex flex-col items-center`}>
        <div className="w-full max-w-5xl">
          {/* Header Section */}
          <div className={`${isMobile ? 'mb-6' : 'mb-6 lg:mb-10'} flex flex-col items-center text-center`}>
            <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12 lg:w-14 lg:h-14'} rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 mb-3 lg:mb-4 ring-4 ring-indigo-50`}>
              <Building2 className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6 lg:w-7 lg:h-7'}`} />
            </div>
            <h1 className={`${isMobile ? 'text-lg' : 'text-xl md:text-2xl lg:text-3xl'} font-black text-slate-900 tracking-tight mb-1 lg:mb-2`}>Set Up Business Account</h1>
            <p className="text-slate-500 text-[10px] md:text-sm lg:text-base font-medium max-w-lg mx-auto px-4">
              Create your dedicated Twilio subaccount to manage your business communications.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8 items-stretch">
            {/* Left Column: Info & Tips */}
            <div className="lg:col-span-2 flex flex-col gap-4 lg:gap-6">
              <div className={`bg-indigo-50/50 rounded-2xl lg:rounded-3xl ${isMobile ? 'p-4' : 'p-5 lg:p-6'} border border-indigo-100 relative overflow-hidden flex-1`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100/50 rounded-full blur-2xl -mr-12 -mt-12"></div>
                <div className="relative z-10">
                  <div className={`flex items-center gap-2 ${isMobile ? 'mb-3' : 'mb-4 lg:mb-5'}`}>
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-indigo-100 shadow-sm">
                      <Info className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h3 className="font-black text-indigo-900 text-[10px] uppercase tracking-widest">Why a Subaccount?</h3>
                  </div>

                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-indigo-900">Isolated Billing</p>
                        <p className="text-[10px] text-indigo-700/70 font-medium">Keep your business expenses separated.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-indigo-900">Better Security</p>
                        <p className="text-[10px] text-indigo-700/70 font-medium">Enhanced data protection for logs.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-indigo-900">Multi-Business</p>
                        <p className="text-[10px] text-indigo-700/70 font-medium">Manage multiple locations easily.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`bg-slate-50 rounded-2xl ${isMobile ? 'p-3' : 'p-4 lg:p-5'} border border-slate-200`}>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${existingSubaccount ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                  <p className="text-xs font-bold text-slate-700">
                    {existingSubaccount ? 'Subaccount Active' : 'Pending Initialization'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Setup Form / Success State */}
            <div className="lg:col-span-3">
              {success ? (
                <div className={`bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 ${isMobile ? 'p-5' : 'p-6 lg:p-8'} text-center h-full flex flex-col justify-center overflow-hidden relative`}>
                  <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500"></div>
                  <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-sm`}>
                    <CheckCircle className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-emerald-500`} />
                  </div>
                  <h3 className={`${isMobile ? 'text-lg' : 'text-xl lg:text-2xl'} font-black text-slate-900 tracking-tight mb-2`}>Setup Complete!</h3>
                  <p className="text-[10px] md:text-sm font-medium text-slate-500 mb-6 lg:mb-8 max-w-xs mx-auto">
                    Redirecting you to pick a phone number...
                  </p>
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                    <button
                      onClick={handleProceedToNumbers}
                      className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-lg shadow-indigo-200"
                    >
                      Continue Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : existingSubaccount ? (
                <div className={`bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 ${isMobile ? 'p-5' : 'p-6 lg:p-8'} h-full flex flex-col overflow-hidden relative`}>
                  <div className="absolute top-0 inset-x-0 h-1 bg-indigo-600"></div>
                  <div className={`${isMobile ? 'mb-4' : 'mb-6 lg:mb-8'}`}>
                    <h3 className={`${isMobile ? 'text-base' : 'text-lg lg:text-xl'} font-black text-slate-900 tracking-tight mb-1`}>Existing Account Found</h3>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Everything is ready to go</p>
                  </div>

                  <div className={`bg-slate-50 rounded-2xl ${isMobile ? 'p-4' : 'p-5 lg:p-6'} border border-slate-100 ${isMobile ? 'mb-4' : 'mb-6 lg:mb-8'} flex-1`}>
                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Subaccount Name</p>
                        <p className={`${isMobile ? 'text-sm' : 'text-base lg:text-lg'} font-black text-slate-900`}>{existingSubaccount.friendly_name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">SID</p>
                        <p className="text-[10px] font-mono text-slate-500 font-bold">{existingSubaccount.sid.substring(0, 20)}...</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToNumbers}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] lg:text-xs rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1"
                  >
                    Continue to Number Selection
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className={`bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 ${isMobile ? 'p-5' : 'p-6 lg:p-8'} h-full flex flex-col overflow-hidden relative`}>
                  <div className="absolute top-0 inset-x-0 h-1 bg-indigo-600"></div>
                  <div className={`${isMobile ? 'mb-4' : 'mb-6 lg:mb-8'}`}>
                    <h3 className={`${isMobile ? 'text-base' : 'text-lg lg:text-xl'} font-black text-slate-900 tracking-tight mb-1`}>Initialize Account</h3>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Enter your business details</p>
                  </div>

                  <div className="space-y-6 flex-1 flex flex-col justify-center">
                    <div>
                      <label htmlFor="businessName" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                        Business Display Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                          <Building2 size={18} />
                        </div>
                        <input
                          id="businessName"
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Acme Corporation"
                          className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-red-800 uppercase tracking-wide leading-relaxed">{error}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCreateSubaccount}
                    disabled={loading || !businessName.trim()}
                    className={`${isMobile ? 'mt-4' : 'mt-6 lg:mt-8'} w-full flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black uppercase tracking-widest text-[10px] lg:text-xs rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                        Provisioning...
                      </>
                    ) : (
                      <>
                        Initialize Account
                        <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        <div className={`${isMobile ? 'mt-4' : 'mt-6'} text-center`}>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            Secure & Encrypted Data Storage
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SetupSubaccount;
