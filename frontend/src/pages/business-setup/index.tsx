import React from 'react';
import {
  Building2, Clock, Layers, Save, Eye, Loader2
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
  icon?: React.ReactNode;
  isLast?: boolean;
}

const SectionCard = ({ title, subtitle, children, action, icon, isLast }: SectionCardProps) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:border-slate-300 transition-all duration-300 ${!isLast ? 'mb-8' : ''}`}>
    <div className="p-6 md:p-8 border-b border-slate-100 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="p-2.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-xl shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-slate-500 mt-1 text-xs font-medium leading-relaxed max-w-2xl uppercase tracking-wider">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0 self-start sm:self-center">{action}</div>}
      </div>
    </div>
    <div className="p-6 md:p-8">
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
      <div className="w-full p-4 md:p-8 2xl:p-12 space-y-8 2xl:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto h-full">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Profile</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Configure how your AI agent represents your brand.</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 shadow-lg ${saving || !isDirty
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 hover:-translate-y-0.5'
                }`}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 2xl:gap-12 items-start">

          {/* Main Content Column (Left) */}
          <div className="xl:col-span-8 space-y-8 2xl:space-y-12">

            {/* Section 1: Business Identity */}
            <SectionCard
              title="Business Identity"
              subtitle="Define who the AI represents. This information is used for greetings and caller identification."
              icon={<Building2 size={20} />}
            >
              <BusinessDetails />
            </SectionCard>

            {/* Section 2: Business Hours */}
            <SectionCard
              title="Availability"
              subtitle="Configure hours when your AI Agent is active. Outside these hours, calls can be sent to voicemail."
              icon={<Clock size={20} />}
            >
              <BusinessHoursSettings />
            </SectionCard>

            {/* Section 3: Services */}
            <SectionCard
              title="Service Catalog"
              subtitle="List your products or services. Use the AI extractor to auto-generate this list or add them manually."
              icon={<Layers size={20} />}
              isLast
            >
              <Services />
            </SectionCard>
          </div>

          {/* Sidebar Column (Right) */}
          <div className="xl:col-span-4 sticky top-0 h-full">
            <LivePreview />
          </div>
        </div>

        {/* Sticky Save Action for Mobile/Tablet */}
        <div className="lg:hidden sticky bottom-4 z-20">
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 shadow-2xl ${saving || !isDirty
                ? 'bg-slate-100 text-slate-400 border border-slate-200 shadow-none'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
              }`}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving Progress...' : 'Save Business Profile'}
          </button>
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