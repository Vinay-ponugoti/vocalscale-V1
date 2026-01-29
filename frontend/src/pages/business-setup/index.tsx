import React, { useState } from 'react';
import {
  Building2, Clock, Layers, Save, Loader2
} from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ToastProvider } from '../../context/ToastProvider';
import { useToast } from '../../hooks/useToast';
import { useBusinessSetup } from '../../context/BusinessSetupContext';
import { BusinessDetails } from './components/BusinessDetails';
import { BusinessHoursSettings } from './components/BusinessHoursSettings';
import { Services } from './components/Services';

// --- Main Page Component ---

const BusinessSetupContent = () => {
  const { state, actions } = useBusinessSetup();
  const { showToast } = useToast();
  const { saving, isDirty } = state;
  const [activeSection, setActiveSection] = useState<'identity' | 'availability' | 'services'>('identity');

  const handleSave = async () => {
    await actions.saveData(showToast);
  };

  const menuItems = [
    {
      id: 'identity',
      label: 'Identity',
      icon: Building2,
      desc: 'Profile & Contact'
    },
    {
      id: 'availability',
      label: 'Availability',
      icon: Clock,
      desc: 'Hours & Holidays'
    },
    {
      id: 'services',
      label: 'Services',
      icon: Layers,
      desc: 'Catalog & Knowledge'
    },
  ] as const;

  return (
    <DashboardLayout fullWidth={true}>
      <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">

        {/* Top Header - Fixed Height */}
        <div className="flex-none px-4 md:px-8 py-5 border-b border-slate-200 bg-white flex items-center justify-between z-10 shrink-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">AI Configuration</h1>
            <p className="hidden md:block text-sm text-slate-500 mt-1">Optimize your AI Receptionist's identity, availability, and knowledge base.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium mr-4">
              <div className={`w-2 h-2 rounded-full ${isDirty ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className="text-slate-600 text-xs uppercase tracking-wider font-bold">{isDirty ? 'Unsaved Changes' : 'Saved'}</span>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 ${saving || !isDirty
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 hover:-translate-y-0.5'
                }`}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Content Area - Flex Grow */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-[1920px] mx-auto w-full">

          {/* Desktop Sidebar: Navigation */}
          <div className="hidden md:flex w-[260px] lg:w-[320px] 2xl:w-[360px] border-r border-slate-200 flex-col bg-white overflow-y-auto shrink-0 py-6 z-10">
            <div className="px-3 lg:px-6 space-y-1">
              <p className="px-4 mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Configuration</p>
              {menuItems.map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center text-left gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl transition-all duration-200 border group ${isActive
                      ? 'bg-indigo-50 border-indigo-100 shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-slate-50 hover:text-slate-900 text-slate-600'
                      }`}
                  >
                    <div className={`p-2.5 rounded-lg shrink-0 transition-colors ${isActive ? 'bg-white text-indigo-600 shadow-sm' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-600'}`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className={`block text-sm font-bold tracking-tight truncate ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {item.label}
                      </span>
                      <span className={`block text-xs mt-0.5 leading-relaxed font-medium line-clamp-1 ${isActive ? 'text-indigo-600/70' : 'text-slate-400'}`}>
                        {item.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Navigation: Segment Control */}
          <div className="md:hidden flex-none bg-white border-b border-slate-200 p-2 z-10">
            <div className="flex bg-slate-100/80 p-1 rounded-xl">
              {menuItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${isActive
                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
                        : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Active Form */}
          <div className="flex-1 overflow-y-auto bg-slate-50 relative custom-scrollbar">
            <div className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12 pb-32">
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">

                {activeSection === 'identity' && (
                  <div className="space-y-6">
                    <div className="mb-6 md:mb-8">
                      <h2 className="text-2xl font-bold text-slate-900">Brand Identity</h2>
                      <p className="text-slate-500 mt-1">Establish your AI Receptionist's professional persona and contact details.</p>
                    </div>
                    <BusinessDetails />
                  </div>
                )}

                {activeSection === 'availability' && (
                  <div className="space-y-6">
                    <div className="mb-6 md:mb-8">
                      <h2 className="text-2xl font-bold text-slate-900">Smart Availability</h2>
                      <p className="text-slate-500 mt-1">Configure automated call handling windows and 24/7 routing logic.</p>
                    </div>
                    <BusinessHoursSettings />
                  </div>
                )}

                {activeSection === 'services' && (
                  <div className="space-y-6">
                    <div className="mb-6 md:mb-8">
                      <h2 className="text-2xl font-bold text-slate-900">Expert Knowledge Base</h2>
                      <p className="text-slate-500 mt-1">Train your AI agent on your services, pricing, and business documentation.</p>
                    </div>
                    <Services />
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
        `}</style>

      </div>
    </DashboardLayout>
  );
};

const BusinessSetup = () => {
  return (
    <ToastProvider>
      <BusinessSetupContent />
    </ToastProvider>
  );
};

export default BusinessSetup;