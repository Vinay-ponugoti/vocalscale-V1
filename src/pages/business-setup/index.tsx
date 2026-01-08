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
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:border-slate-300 transition-all duration-300 ${!isLast ? 'mb-8' : ''}`}>
    <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-slate-500 mt-1 text-sm leading-relaxed max-w-2xl">{subtitle}</p>}
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
      <div className="bg-[#FAFAFA] min-h-screen">
        <div className="w-full pt-10 pb-20 px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Main Content Column (Left) */}
            <div className="xl:col-span-8">
              
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

              {/* Sticky Save Action for Mobile/Tablet */}
              <div className="lg:hidden mt-8 sticky bottom-4 z-20">
                  <button 
                    onClick={handleSave}
                    disabled={saving || !isDirty}
                    className={`w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 flex items-center justify-center gap-2 transition-all ${
                      (saving || !isDirty) ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
                    }`}
                  >
                      {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                      {saving ? 'Saving...' : 'Save Configuration'}
                  </button>
              </div>

            </div>

            {/* Sidebar Column (Right) - Sticky */}
            <div className="xl:col-span-4 space-y-6 sticky top-6">
              
              {/* Save Action Card (Desktop) */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Save Changes</h3>
                  {isDirty && (
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full border border-amber-100 uppercase tracking-wider">
                      <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                      Unsaved Changes
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Your changes will be applied instantly to your AI Agent once saved.
                </p>
                <button 
                  onClick={handleSave}
                  disabled={saving || !isDirty}
                  className={`w-full py-3 bg-slate-900 text-white font-bold rounded-lg shadow-sm hover:bg-slate-800 flex items-center justify-center gap-2 transition-all ${
                    (saving || !isDirty) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md active:scale-[0.98]'
                  }`}
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>

              {/* Live Preview Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     Live Preview
                  </h3>
                  <div className="p-1 bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                     <Eye size={14} />
                  </div>
                </div>
                <div className="p-2 bg-slate-900 flex-1 min-h-[200px]">
                  <LivePreview />
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 font-mono text-center uppercase tracking-wider">
                    Simulation Mode
                  </p>
                </div>
              </div>

            
              
            </div>
          </div>
          
          {/* Footer Actions */}
          <div className="mt-16 pt-8 border-t border-slate-200">
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