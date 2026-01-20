import React from 'react';
import {
  Building2, Clock, Layers, Save, Eye, Loader2, Sparkles, Command
} from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ToastProvider } from '../../context/ToastProvider';
import { useToast } from '../../hooks/useToast';
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
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{subtitle}</p>}
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

  const handleSave = async () => {
    await actions.saveData(showToast);
  };

  return (
    <DashboardLayout fullWidth>
      <div className="flex flex-col h-full bg-[#FAFAFA]">

        {/* Page Header */}
        <div className="px-8 py-6 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 transition-all">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Business Setup</h1>
              <p className="text-slate-500 text-sm mt-1">Configure your AI agent's core identity, availability, and services.</p>
            </div>

            {/* Quick Save Action in Header (Optional, for easy access) */}
            <div className="hidden md:flex items-center gap-4">
              {isDirty && <span className="text-xs font-medium text-amber-600 animate-pulse">● Unsaved changes</span>}
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
          <div className="max-w-7xl mx-auto p-8 2xl:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 2xl:gap-12 items-start">
              {/* Main Content Column (Left) */}
              <div className="xl:col-span-8 space-y-8">

                {/* Section 1: Business Identity */}
                <SectionCard
                  title="Business Identity"
                  subtitle="Define who the AI represents. This information is used for greetings and caller identification."
                  icon={Building2}
                >
                  <BusinessDetails />
                </SectionCard>

                {/* Section 2: Business Hours */}
                <SectionCard
                  title="Availability"
                  subtitle="Configure hours when your AI Agent is active. Outside these hours, calls can be sent to voicemail."
                  icon={Clock}
                >
                  <BusinessHoursSettings />
                </SectionCard>

                {/* Section 3: Services */}
                <SectionCard
                  title="Service Catalog"
                  subtitle="List your products or services. Use the AI extractor to auto-generate this list or add them manually."
                  icon={Layers}
                  isLast
                >
                  <Services />
                </SectionCard>
              </div>

              {/* Sidebar Column (Right) */}
              <div className="xl:col-span-4 lg:sticky lg:top-8 order-first xl:order-last">
                <LivePreview />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="border-t border-slate-200 bg-white p-4 px-8 z-30 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className={`w-2 h-2 rounded-full ${isDirty ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className="text-slate-600">{isDirty ? 'Unsaved changes' : 'All changes saved'}</span>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform ${saving || !isDirty
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md'
                }`}
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </div>

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