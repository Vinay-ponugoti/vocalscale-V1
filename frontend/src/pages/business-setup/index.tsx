import React from 'react';
import {
  Building2, Clock, Layers, Save, Eye, Loader2, Sparkles, Command
} from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ToastProvider } from '../../context/ToastProvider';
import { useToast } from '../../hooks/useToast';
import { useState } from 'react';
import { useBusinessSetup } from '../../context/BusinessSetupContext';
import { BusinessDetails } from './components/BusinessDetails';
import { BusinessHoursSettings } from './components/BusinessHoursSettings';
import { Services } from './components/Services';
import { LivePreview } from './components/LivePreview';

// --- Reusable Section Card Component ---

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ElementType;
  isLast?: boolean;
}

const SectionCard = ({ title, subtitle, children, action, icon: Icon, isLast }: SectionCardProps) => (
  <div className={`group bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-0.5 ${!isLast ? 'mb-8' : ''}`}>
    <div className="p-8 border-b border-slate-50 bg-gradient-to-r from-slate-50/50 to-white">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          {Icon && (
            <div className="p-3.5 bg-white border border-slate-200/60 shadow-sm rounded-2xl text-indigo-600 shrink-0 group-hover:scale-105 transition-transform duration-300">
              <Icon size={22} strokeWidth={1.5} />
            </div>
          )}
          <div className="space-y-1">
            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0 self-start sm:self-center">{action}</div>}
      </div>
    </div>
    <div className="p-8">
      {children}
    </div>
  </div>
);

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
      label: 'Business Identity',
      icon: Building2,
      desc: 'Name, location, and contact info'
    },
    {
      id: 'availability',
      label: 'Availability',
      icon: Clock,
      desc: 'Operating hours and holidays'
    },
    {
      id: 'services',
      label: 'Service Catalog',
      icon: Layers,
      desc: 'Offerings and knowledge base'
    },
  ] as const;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-slate-50/50 p-4 md:p-6 2xl:p-8 overflow-hidden">

        {/* Unified Card Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden w-full max-w-[1920px] mx-auto animate-in fade-in zoom-in-95 duration-500">

          {/* Header */}
          <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h1 className="scroll-m-20 text-xl font-bold tracking-tight text-slate-900">Business Setup</h1>
              <p className="text-sm text-slate-500 leading-none mt-1">Configure your AI agent's core parameters.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium mr-4">
                <div className={`w-2 h-2 rounded-full ${isDirty ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                <span className="text-slate-600 text-xs uppercase tracking-wider font-bold">{isDirty ? 'Unsaved Changes' : 'Saved'}</span>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !isDirty}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 ${saving || !isDirty
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200'
                  }`}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Split View Content */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full relative">

            {/* Desktop Sidebar: Navigation */}
            <div className="hidden md:flex w-[260px] lg:w-[320px] 2xl:w-[360px] border-r border-slate-100 flex-col bg-slate-50/30 overflow-y-auto shrink-0 py-6">
              <div className="px-3 lg:px-4 space-y-1">
                {menuItems.map((item) => {
                  const isActive = activeSection === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-start text-left gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl transition-all duration-200 border ${isActive
                          ? 'bg-white border-slate-200 shadow-sm'
                          : 'border-transparent hover:bg-slate-100/50 hover:border-slate-100 text-slate-500'
                        }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:text-slate-500'}`}>
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <span className={`block text-sm font-semibold tracking-tight truncate ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                          {item.label}
                        </span>
                        <span className="block text-xs text-slate-500 mt-0.5 leading-relaxed font-medium line-clamp-1">
                          {item.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Navigation: Horizontal Tabs */}
            <div className="md:hidden w-full bg-white border-b border-slate-100 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 p-2 min-w-max">
                {menuItems.map((item) => {
                  const isActive = activeSection === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm font-semibold whitespace-nowrap ${isActive
                          ? 'bg-indigo-50 border-indigo-100 text-indigo-700'
                          : 'bg-white border-transparent text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      <Icon size={16} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Panel: Active Form */}
            <div className="flex-1 bg-white overflow-y-auto custom-scrollbar relative">
              <div className="max-w-4xl mx-auto p-4 md:p-8 lg:p-12 animate-in fade-in slide-in-from-right-4 duration-300 focus-visible:outline-none">

                {activeSection === 'identity' && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-4 md:pb-6 mb-4 md:mb-6">
                      <h2 className="scroll-m-20 text-xl md:text-2xl font-semibold tracking-tight text-slate-900">Business Identity</h2>
                      <p className="text-sm text-slate-500 mt-1">Define who the AI represents during calls.</p>
                    </div>
                    <BusinessDetails />
                  </div>
                )}

                {activeSection === 'availability' && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-4 md:pb-6 mb-4 md:mb-6">
                      <h2 className="scroll-m-20 text-xl md:text-2xl font-semibold tracking-tight text-slate-900">Availability</h2>
                      <p className="text-sm text-slate-500 mt-1">Configure operating hours and holiday handling.</p>
                    </div>
                    <BusinessHoursSettings />
                  </div>
                )}

                {activeSection === 'services' && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-4 md:pb-6 mb-4 md:mb-6">
                      <h2 className="scroll-m-20 text-xl md:text-2xl font-semibold tracking-tight text-slate-900">Service Catalog</h2>
                      <p className="text-sm text-slate-500 mt-1">Manage services and knowledge base documents.</p>
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
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
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