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
    try {
      navigator.clipboard.writeText('*72 (555) 123-4567');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy to clipboard:', e);
      alert('Failed to copy code. Please copy it manually.');
    }
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


          <div className={`${isMobile ? 'p-5' : 'p-8 sm:p-12'} max-w-2xl mx-auto`}>
            {/* Input Section */}
            <div className="space-y-8">
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none" />

                <label className="text-slate-900 text-sm font-bold uppercase tracking-wider flex items-center gap-3 mb-6 relative z-10">
                  <span className="flex items-center justify-center bg-indigo-600 text-white text-xs font-bold w-6 h-6 rounded-full shadow-lg shadow-indigo-200">1</span>
                  Enter Business Number
                </label>

                <div className="relative group/input z-10">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    className={`w-full rounded-2xl border-2 border-slate-200 bg-white text-slate-900 ${isMobile ? 'h-14' : 'h-16'} pl-14 pr-12 text-xl font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 shadow-sm`}
                    placeholder="(555) 000-0000"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                    autoFocus
                  />
                  <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    ) : phoneNumber.length > 9 ? (
                      <CheckCircle className="w-6 h-6 text-emerald-500 animate-in zoom-in" strokeWidth={3} />
                    ) : null}
                  </div>
                </div>
                <p className="text-slate-400 text-xs font-medium mt-4 ml-1">
                  We'll configure this number to route missed calls to your AI receptionist.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={() => navigate('/dashboard/voice-setup')}
                  className={`flex-1 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all ${isMobile ? 'h-12 text-[10px]' : 'h-14'} rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 uppercase tracking-widest`}
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                  Cancel
                </button>
                <button
                  className={`flex-[2] ${isMobile ? 'h-12 text-[10px]' : 'h-14'} bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:pointer-events-none`}
                  onClick={handleConfirm}
                  disabled={!phoneNumber || phoneNumber.length < 10}
                >
                  Confirm & Continue
                  <ArrowRight className="w-4 h-4" strokeWidth={3} />
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