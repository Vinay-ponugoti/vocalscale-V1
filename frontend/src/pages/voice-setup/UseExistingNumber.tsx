import { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  CheckCircle,
  ChevronDown,
  Info,
  Copy,
  User,
  Smartphone,
  Activity,
  ArrowLeft,
  ArrowRight,
  PhoneIncoming,
  Bot,
  Loader2,
  Zap
} from 'lucide-react';

import { env } from '../../config/env';
import { getAuthHeader } from '../../lib/api';

const API_BASE = env.API_URL;

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

const UseExistingNumber = () => {
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const [phoneNumber, setPhoneNumber] = useState('');
  const [carrier, setCarrier] = useState('verizon');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessPhone = async () => {
      try {
        const headers = await getAuthHeader();

        const response = await fetch(`${API_BASE}/business-setup`, {
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.business && data.business.phone) {
            setPhoneNumber(data.business.phone);
          }
        }
      } catch (e) {
        console.error('Failed to fetch business details', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessPhone();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText('*72 (555) 123-4567');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    try {
      const headers = await getAuthHeader();

      const response = await fetch(`${API_BASE}/phone-numbers/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          carrier: carrier,
          friendly_name: phoneNumber
        }),
      });

      if (response.ok) {
        navigate('/dashboard/voice-setup');
      } else {
        console.error('Failed to import number');
        alert('Failed to add number. Please try again.');
      }
    } catch (e) {
      console.error('Error importing number', e);
      alert('An error occurred. Please check your connection.');
    }
  };

  return (
    <DashboardLayout fullWidth>
      <div className={`${isMobile ? 'h-[calc(100vh-80px)] overflow-y-auto py-4 px-4' : 'h-[calc(100vh-80px)] overflow-y-auto flex items-start justify-center py-6 px-4 sm:px-6'} font-sans custom-scrollbar`}>

        {/* Main Card Container */}
        <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

          {/* Header */}
          <header className={`bg-white border-b border-slate-100 ${isMobile ? 'p-5' : 'p-8'} text-center`}>
            <div className={`inline-flex ${isMobile ? 'h-10 w-10' : 'h-12 w-12'} items-center justify-center rounded-2xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-200`}>
              <PhoneIncoming className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-black text-slate-900 tracking-tight mb-2`}>
                Use Your Existing Number
              </h1>
              <p className={`text-slate-500 ${isMobile ? 'text-xs' : 'text-sm'} max-w-lg mx-auto font-medium leading-relaxed`}>
                Keep your business number. We'll assist you in setting up call forwarding so our AI can answer your missed calls.
              </p>
            </div>
          </header>

          <div className={`${isMobile ? 'p-5' : 'p-8 sm:p-10'} grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 scroll-mt-20`}>

            {/* Left Column: Configuration */}
            <div className="flex flex-col gap-8">

              {/* Step 1: Input */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <label className="text-slate-900 text-sm font-bold uppercase tracking-wider flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center bg-slate-900 text-white text-xs font-bold w-6 h-6 rounded-full">1</span>
                  Enter Business Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    className={`w-full rounded-xl border-2 border-slate-200 bg-white text-slate-900 ${isMobile ? 'h-11' : 'h-12'} pl-11 pr-11 text-base font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300`}
                    placeholder="(555) 000-0000"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    ) : phoneNumber.length > 9 ? (
                      <CheckCircle className="w-6 h-6 text-emerald-500" strokeWidth={3} />
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Step 2: Carrier & Code */}
              <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

                <label className="text-indigo-900 text-sm font-bold uppercase tracking-wider flex items-center gap-3 mb-4 relative z-10">
                  <span className="flex items-center justify-center bg-indigo-600 text-white text-xs font-bold w-6 h-6 rounded-full">2</span>
                  Select Carrier & Forward
                </label>

                <div className="space-y-4 relative z-10">
                  <div className="relative bg-white rounded-xl shadow-sm">
                    <select
                      className={`w-full rounded-xl border-2 border-indigo-100 bg-transparent text-slate-900 ${isMobile ? 'h-11' : 'h-12'} pl-4 pr-10 text-sm font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 cursor-pointer appearance-none outline-none transition-all`}
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                    >
                      <option value="verizon">Verizon Wireless</option>
                      <option value="att">AT&T</option>
                      <option value="tmobile">T-Mobile</option>
                      <option value="other">Other / Landline</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <ChevronDown className="w-5 h-5 text-indigo-400" />
                    </div>
                  </div>

                  {/* Code Box */}
                  <div className="bg-white rounded-2xl border-2 border-indigo-100 p-6 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Dial this code on your phone</span>
                    </div>
                    <code className="block text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono mb-6">
                      *72 (555) 123-4567
                    </code>
                    <button
                      onClick={handleCopy}
                      className="w-full flex items-center justify-center gap-2 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-indigo-200"
                    >
                      {copied ? <CheckCircle className="w-5 h-5 text-white" strokeWidth={3} /> : <Copy className="w-5 h-5" />}
                      {copied ? 'Copied to Clipboard' : 'Copy Code'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual & Verification */}
            <div className="flex flex-col justify-between gap-6 lg:gap-8">

              {/* Visual Flow */}
              <div className={`relative bg-slate-50 rounded-3xl border border-slate-100 ${isMobile ? 'p-6' : 'p-8'} overflow-hidden`}>
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                {/* Connection Line */}
                <div className={`absolute top-1/2 ${isMobile ? 'left-10 right-10' : 'left-16 right-16'} h-1 bg-gradient-to-r from-slate-200 via-indigo-200 to-indigo-500 -z-10 -translate-y-1/2 rounded-full`}></div>

                <div className="flex justify-between items-center relative z-10">
                  <div className="flex flex-col items-center gap-2 lg:gap-3">
                    <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 group-hover:border-indigo-300 transition-colors`}>
                      <User className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'}`} />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Caller</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 lg:gap-3">
                    <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-900`}>
                      <Smartphone className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'}`} />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">You</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 lg:gap-3">
                    <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full bg-indigo-600 shadow-xl shadow-indigo-500/30 flex items-center justify-center text-white relative z-10 border-4 border-white`}>
                      <Bot className={`${isMobile ? 'w-5 h-5' : 'w-7 h-7'}`} strokeWidth={2.5} />
                      <div className="absolute top-0 right-0 w-3 h-3 lg:w-4 lg:h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">AI Receptionist</span>
                  </div>
                </div>
              </div>

              {/* Test Action */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                {/* Glow effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>

                <div className="flex items-center gap-5 relative z-10 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Activity className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Verify Connection</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Ensure calls are routed correctly</p>
                  </div>
                </div>
                <button
                  onClick={() => alert("To test, please call your number from a DIFFERENT phone. If properly forwarded, our AI will answer.")}
                  className="w-full h-12 bg-white text-slate-900 hover:bg-slate-50 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-indigo-500/10"
                >
                  <Zap className="w-4 h-4 text-indigo-600" fill="currentColor" />
                  Test Call Now
                </button>
              </div>

              {/* Navigation */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => navigate('/dashboard/voice-setup')}
                  className={`flex items-center justify-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors ${isMobile ? 'h-10 text-[10px]' : 'h-12'} rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 uppercase tracking-widest`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  className={`${isMobile ? 'h-10 text-[10px]' : 'h-12'} bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0`}
                  onClick={handleConfirm}
                >
                  Confirm Setup
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default UseExistingNumber;