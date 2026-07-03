import React, { useState } from 'react';
import {
  Building2, Clock, Layers, Save, Loader2, CheckCircle2, AlertCircle
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
  const { saving, isDirty, data } = state;
  const [activeSection, setActiveSection] = useState<'identity' | 'availability' | 'services'>('identity');

  const handleSave = async () => {
    await actions.saveData(showToast);
  };

  const activeHours = (data.business_hours || []).filter((hour) => hour.enabled).length;
  const serviceCount = data.services?.length || 0;
  const identityComplete = Boolean(data.business.business_name && data.business.phone);
  const completedSections = [identityComplete, activeHours > 0, serviceCount > 0].filter(Boolean).length;

  const menuItems = [
    {
      id: 'identity',
      label: 'Identity',
      icon: Building2,
      desc: 'Profile and contact',
      meta: identityComplete ? 'Ready' : 'Needs info'
    },
    {
      id: 'availability',
      label: 'Availability',
      icon: Clock,
      desc: 'Hours and routing',
      meta: `${activeHours}/7 open`
    },
    {
      id: 'services',
      label: 'Services',
      icon: Layers,
      desc: 'Catalog and pricing',
      meta: `${serviceCount} listed`
    },
  ] as const;

  return (
    <DashboardLayout fullWidth={true}>
      <div className="flex h-full flex-col overflow-hidden bg-[#f7f8fb] text-slate-950">

        <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 md:px-6 xl:px-8">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-cyan-700">
                <Building2 size={13} />
                Agent operations
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">Business Setup</h1>
              <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                Keep the information your voice agent uses to answer calls, book customers, and explain services.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sections</p>
                  <p className="mt-1 text-sm font-black text-slate-950">{completedSections}/3</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hours</p>
                  <p className="mt-1 text-sm font-black text-slate-950">{activeHours}/7</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Services</p>
                  <p className="mt-1 text-sm font-black text-slate-950">{serviceCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <div className={`flex h-8 w-8 items-center justify-center rounded-md ${isDirty ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {isDirty ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
                </div>
                <div className="hidden min-w-24 sm:block">
                  <p className="text-xs font-bold text-slate-950">{isDirty ? 'Unsaved changes' : 'All changes saved'}</p>
                  <p className="text-[11px] font-medium text-slate-500">{saving ? 'Saving now' : 'Profile status'}</p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || !isDirty}
                  className={`inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-xs font-bold transition-colors ${saving || !isDirty
                    ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                    : 'bg-slate-950 text-white hover:bg-slate-800'
                    }`}
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? 'Saving' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden md:flex-row">

          <div className="hidden w-[270px] shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col xl:w-[320px]">
            <div className="border-b border-slate-200 px-5 py-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Configuration</p>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Move through each section and save once when everything looks right.</p>
            </div>
            <div className="scrollbar-hide flex-1 space-y-1 overflow-y-auto p-3">
              {menuItems.map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`group flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${isActive
                      ? 'border-cyan-100 bg-cyan-50 text-cyan-900'
                      : 'border-transparent bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950'
                      }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition-colors ${isActive
                      ? 'border-cyan-100 bg-white text-cyan-700'
                      : 'border-slate-200 bg-slate-50 text-slate-500 group-hover:text-slate-900'
                      }`}>
                      <Icon size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className={`block truncate text-sm font-bold tracking-tight ${isActive ? 'text-cyan-950' : 'text-slate-800'}`}>
                        {item.label}
                      </span>
                      <span className={`mt-0.5 block truncate text-xs font-medium ${isActive ? 'text-cyan-700' : 'text-slate-400'}`}>
                        {item.desc}
                      </span>
                    </div>
                    <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-white text-cyan-700' : 'bg-slate-100 text-slate-500'}`}>
                      {item.meta}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="shrink-0 border-b border-slate-200 bg-white p-2 md:hidden">
            <div className="scrollbar-hide flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">
              {menuItems.map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex min-w-28 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-bold transition-colors ${isActive
                        ? 'bg-white text-cyan-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="scrollbar-hide relative flex-1 overflow-y-auto bg-[#f7f8fb]">
            <div className="mx-auto max-w-6xl px-4 py-5 pb-28 md:px-6 md:py-8 xl:px-10">
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">

                {activeSection === 'identity' && (
                  <div className="space-y-5">
                    <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
                      <h2 className="text-xl font-black tracking-tight text-slate-950">Business Identity</h2>
                      <p className="mt-1 text-sm font-medium text-slate-500">Manage public-facing details, contact lines, and location context.</p>
                    </div>
                    <BusinessDetails />
                  </div>
                )}

                {activeSection === 'availability' && (
                  <div className="space-y-5">
                    <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
                      <h2 className="text-xl font-black tracking-tight text-slate-950">Availability Rules</h2>
                      <p className="mt-1 text-sm font-medium text-slate-500">Set operating windows so the agent knows when to book, route, or take a message.</p>
                    </div>
                    <BusinessHoursSettings />
                  </div>
                )}

                {activeSection === 'services' && (
                  <div className="space-y-5">
                    <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
                      <h2 className="text-xl font-black tracking-tight text-slate-950">Service Catalog</h2>
                      <p className="mt-1 text-sm font-medium text-slate-500">Define services, pricing, and the details callers usually ask about.</p>
                    </div>
                    <Services />
                  </div>
                )}

              </div>
            </div>
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
