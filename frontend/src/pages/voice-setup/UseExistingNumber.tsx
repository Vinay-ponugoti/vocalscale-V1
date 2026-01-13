import React, { useState, useEffect } from 'react';
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
      <div className={`${isMobile ? 'py-4 px-4' : 'min-h-[calc(100vh-80px)] flex items-center justify-start py-10 px-4 sm:px-6'} font-sans`}>
        
        {/* Main Card Container */}
        <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            
            {/* Header */}
            <header className={`bg-slate-50 border-b border-slate-100 ${isMobile ? 'p-6' : 'p-8 sm:p-10'} text-center`}>
                <div className={`inline-flex ${isMobile ? 'h-10 w-10' : 'h-14 w-14'} items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4 ring-1 ring-indigo-100`}>
                    <PhoneIncoming className={`${isMobile ? 'w-5 h-5' : 'w-7 h-7'}`} />
                </div>
                <div>
                    <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-black text-slate-900 tracking-tight mb-2`}>
                        Connect Your Number
                    </h1>
                    <p className={`text-slate-500 ${isMobile ? 'text-[10px]' : 'text-base'} max-w-lg mx-auto font-medium`}>
                        Keep your existing business number. We'll guide you through a quick call forwarding setup.
                    </p>
                </div>
            </header>

            <div className={`${isMobile ? 'p-6' : 'p-8 sm:p-12'} grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16`}>
                
                {/* Left Column: Configuration */}
                <div className="flex flex-col gap-6 lg:gap-8">
                    
                    {/* Step 1: Input */}
                    <div className="space-y-3">
                        <label className="text-slate-900 text-[10px] lg:text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                            <span className="flex items-center justify-center bg-slate-900 text-white text-[10px] font-bold w-5 h-5 rounded-full">1</span>
                            Current Business Number
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Phone className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            </div>
                            <input 
                                className={`w-full rounded-xl border border-slate-200 bg-white text-slate-900 ${isMobile ? 'h-12' : 'h-14'} pl-11 pr-12 text-sm lg:text-base font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm ${isLoading ? 'text-slate-300' : ''}`}
                                placeholder={isLoading ? "Loading..." : "(555) 000-0000"}
                                type="tel" 
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                disabled={isLoading}
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                                ) : (
                                    <CheckCircle className="w-5 h-5 text-emerald-500" strokeWidth={3} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Carrier & Code */}
                    <div className="space-y-3">
                        <label className="text-slate-900 text-[10px] lg:text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                            <span className="flex items-center justify-center bg-slate-900 text-white text-[10px] font-bold w-5 h-5 rounded-full">2</span>
                            Select Carrier
                        </label>
                        <div className="relative">
                            <select 
                                className={`w-full rounded-xl border border-slate-200 bg-white text-slate-900 ${isMobile ? 'h-12' : 'h-14'} pl-4 pr-10 text-sm lg:text-base font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer appearance-none outline-none transition-all shadow-sm`} 
                                value={carrier}
                                onChange={(e) => setCarrier(e.target.value)}
                            >
                                <option value="verizon">Verizon Wireless</option>
                                <option value="att">AT&T</option>
                                <option value="tmobile">T-Mobile</option>
                                <option value="other">Other / Landline</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                            </div>
                        </div>

                        {/* Code Box */}
                        <div className={`bg-indigo-50/50 rounded-2xl border border-indigo-100 ${isMobile ? 'p-4' : 'p-5'} mt-4 relative overflow-hidden group`}>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            
                            <div className="flex items-center justify-between mb-3 relative z-10">
                                <span className="text-[9px] lg:text-xs font-bold text-indigo-800 uppercase tracking-widest">Dial This Code</span>
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/50 backdrop-blur text-indigo-600 text-[9px] lg:text-[10px] font-bold uppercase rounded border border-indigo-200">
                                    <Info className="w-3 h-3" />
                                    Verizon
                                </div>
                            </div>
                            <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} justify-between gap-3 lg:gap-4 relative z-10`}>
                                <code className={`text-slate-900 ${isMobile ? 'text-base' : 'text-xl'} font-mono font-black tracking-tight bg-white ${isMobile ? 'px-3 py-3' : 'px-4 py-2'} rounded-lg shadow-sm border border-slate-100 text-center`}>*72 (555) 123-4567</code>
                                <button 
                                    onClick={handleCopy}
                                    className={`flex items-center justify-center gap-2 ${isMobile ? 'h-10' : 'h-12'} px-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm hover:shadow-md`}
                                >
                                    {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied' : 'Copy Code'}
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
                                <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 group-hover:border-indigo-300 transition-colors`}>
                                    <User className={`${isMobile ? 'w-5 h-5' : 'w-7 h-7'}`} />
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Caller</span>
                            </div>
                            
                            <div className="flex flex-col items-center gap-2 lg:gap-3">
                                <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-900`}>
                                    <Smartphone className={`${isMobile ? 'w-5 h-5' : 'w-7 h-7'}`} />
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">You</span>
                            </div>

                            <div className="flex flex-col items-center gap-2 lg:gap-3">
                                <div className={`${isMobile ? 'w-14 h-14' : 'w-20 h-20'} rounded-full bg-indigo-600 shadow-xl shadow-indigo-500/30 flex items-center justify-center text-white relative z-10 border-4 border-white`}>
                                    <Bot className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} strokeWidth={2.5} />
                                    <div className="absolute top-0 right-0 w-4 h-4 lg:w-5 lg:h-5 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></div>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">AI Receptionist</span>
                            </div>
                        </div>
                    </div>

                    {/* Test Action */}
                    <div className={`bg-indigo-50 border border-indigo-100 rounded-3xl ${isMobile ? 'p-5' : 'p-6'} text-slate-900 shadow-sm flex flex-col gap-5 relative overflow-hidden group`}>
                        {/* Glow effect */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-200 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl bg-white border border-indigo-100 flex items-center justify-center shadow-sm">
                                <Activity className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-black tracking-tight`}>Verify Connection</h3>
                                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Ensure calls are routed correctly</p>
                            </div>
                        </div>
                        <button className={`w-full ${isMobile ? 'h-10' : 'h-12'} bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-600/20`}>
                            <Zap size={16} className="text-white" />
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
    </DashboardLayout>
  );
};

export default UseExistingNumber;