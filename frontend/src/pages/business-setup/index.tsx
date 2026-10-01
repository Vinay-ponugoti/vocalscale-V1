import React, { useState } from 'react';
import {
  Building2, Clock, Layers, Save, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { SectionNav } from '../../components/ui/SectionNav';
import { Button } from '../../components/ui/Button';
import { PAGE_CONTAINER } from '../../constants/layout';
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
  const { saving, isDirty, data } = state;
  const [activeSection, setActiveSection] = useState<'identity' | 'availability' | 'services'>('identity');

  const handleSave = async () => {
    await actions.saveData(showToast);
  };

  const activeHours = (data.business_hours || []).filter((hour) => hour.enabled).length;
  const serviceCount = data.services?.length || 0;
  const identityComplete = Boolean(data.business.business_name && data.business.phone);

  const menuItems = [
    {
      id: 'identity',
      label: 'Details',
      icon: Building2,
      description: 'Name, contact, and location',
      meta: identityComplete ? 'Ready' : 'Needs info'
    },
    {
      id: 'availability',
      label: 'Hours',
      icon: Clock,
      description: 'When you are open',
      meta: `${activeHours}/7 open`
    },
    {
      id: 'services',
      label: 'Services',
      icon: Layers,
      description: 'What you offer and prices',
      meta: `${serviceCount} listed`
    },
  ] as const;

  const sectionHeaders = {
    identity: { title: 'Business details', description: 'Public details, contact numbers, and location your agent shares with callers.' },
    availability: { title: 'Business hours', description: 'When you are open, so your agent knows when to book, route, or take a message.' },
    services: { title: 'Services', description: 'What you offer, prices, and the details callers usually ask about.' },
  } as const;

  return (
    <DashboardLayout>
      <div className={PAGE_CONTAINER}>
        <PageHeader
          title="Business profile"
          description="The information your agent uses to answer calls, book appointments, and explain services."
          meta={
            <span className={`flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${isDirty ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {isDirty ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
              {isDirty ? 'Unsaved changes' : 'All changes saved'}
            </span>
          }
          actions={
            <Button onClick={handleSave} disabled={saving || !isDirty}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          }
        />

        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[240px_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <SectionNav<typeof activeSection>
            items={menuItems}
            active={activeSection}
            onChange={setActiveSection}
          />

          <div className="min-w-0 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">{sectionHeaders[activeSection].title}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{sectionHeaders[activeSection].description}</p>
            </div>
            {activeSection === 'identity' && <BusinessDetails />}
            {activeSection === 'availability' && <BusinessHoursSettings />}
            {activeSection === 'services' && <Services />}
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
