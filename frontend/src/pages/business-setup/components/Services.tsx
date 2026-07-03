import React, { useState } from 'react';
import {
  Plus, Trash2, Edit2,
  FileText, Check, ChevronDown
} from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import type { Service as GlobalService } from '../../../types/business';

// --- Styled Components to match previous pages ---

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-950 transition-all duration-200 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/10 ${props.className || ''}`}
  />
);

const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`block w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-950 transition-all duration-200 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/10 ${props.className || ''}`}
  />
);

// --- Types & Logic ---

interface Service extends Omit<GlobalService, 'price'> {
  id: string;
  priceType: 'flat' | 'hourly' | 'starting';
  amount: number;
  duration?: string;
  isExpanded?: boolean;
}

export const Services: React.FC = () => {
  const { state, actions } = useBusinessSetup();
  // const { showToast } = useToast();
  const [localServices, setLocalServices] = useState<Service[]>([]);
  const lastSyncedRef = React.useRef<string>('');

  // Sync with Global State (Incoming)
  React.useEffect(() => {
    const incomingServices = state.data.services || [];
    const incomingString = JSON.stringify(incomingServices);

    // Only update local if global data changed and it's not from our own last sync
    if (incomingString !== lastSyncedRef.current && !state.loading) {
      const newLocal = incomingServices.map((s: GlobalService, idx: number) => {
        const existing = localServices.find(p => p.id === s.id);
        return {
          id: s.id || `service-${idx}-${Date.now()}`,
          name: s.name || '',
          amount: s.price || 0,
          priceType: (existing?.priceType as 'flat' | 'hourly' | 'starting') || 'flat',
          duration: existing?.duration,
          description: s.description || '',
          isExpanded: existing?.isExpanded || false
        };
      });
      setLocalServices(newLocal);
      lastSyncedRef.current = incomingString;
    }
  }, [state.data.services, state.loading, localServices]);

  // Sync Back to Global State (Outgoing)
  const syncToGlobal = React.useCallback((services: Service[]) => {
    const globalServices: GlobalService[] = services.map(s => ({
      id: s.id.startsWith('service-') ? undefined : s.id,
      name: s.name,
      price: s.amount,
      description: s.description
    }));

    const globalString = JSON.stringify(globalServices);
    if (globalString !== lastSyncedRef.current) {
      lastSyncedRef.current = globalString;
      actions.updateServices(globalServices);
    }
  }, [actions]);

  // Debounce sync for typing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      syncToGlobal(localServices);
    }, 800); // Wait for 800ms of inactivity
    return () => clearTimeout(timer);
  }, [localServices, syncToGlobal]);

  const toggleExpand = (id: string) => {
    setLocalServices(prev => {
      const updated = prev.map(s =>
        s.id === id ? { ...s, isExpanded: !s.isExpanded } : s
      );
      // Immediate sync on collapse to ensure data is captured
      const target = updated.find(s => s.id === id);
      if (target && !target.isExpanded) {
        syncToGlobal(updated);
      }
      return updated;
    });
  };

  const updateService = <K extends keyof Service>(id: string, field: K, value: Service[K]) => {
    setLocalServices(prev => prev.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
    // syncToGlobal is handled by the debounced useEffect
  };

  const removeService = (id: string) => {
    const updated = localServices.filter(s => s.id !== id);
    setLocalServices(updated);
    syncToGlobal(updated);
  };

  return (
    <div className="space-y-5">

      {/* Add Service Action */}
      <div
        onClick={() => {
          const newServiceId = `service-${Date.now()}`;
          const newService: Service = {
            id: newServiceId,
            name: "",
            amount: 0,
            priceType: 'flat',
            isExpanded: true
          };
          const updated = [...localServices, newService];
          setLocalServices(updated);
          syncToGlobal(updated);
        }}
        className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-cyan-200 hover:bg-cyan-50/30"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-slate-600 transition-colors group-hover:border-cyan-100 group-hover:bg-white group-hover:text-cyan-700">
            <Plus size={18} />
          </div>
          <div>
            <h4 className="text-sm font-black tracking-tight text-slate-950">Add Service</h4>
            <p className="mt-0.5 text-sm font-medium text-slate-500">Add a new service item with pricing and details.</p>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="flex items-center gap-2 text-sm font-black tracking-tight text-slate-950">
            <FileText className="h-4 w-4 text-cyan-700" />
            Service Items
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-400">
              {localServices.length}
            </span>
          </h3>
        </div>

        <AnimatePresence mode="popLayout">
          {localServices.length === 0 ? (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border border-slate-200 bg-white py-12 text-center shadow-sm"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50">
                <FileText className="h-5 w-5 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-500">No services listed yet</p>
              <p className="mt-1 text-xs font-medium text-slate-400">Click "Add Service" above to get started.</p>
            </m.div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {localServices.map((service) => (
                <m.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`overflow-hidden rounded-lg border bg-white transition-colors ${service.isExpanded ? 'border-cyan-200 shadow-sm ring-1 ring-cyan-100' : 'border-slate-200 shadow-sm hover:border-slate-300'
                    }`}
                >
                  {/* Card Header */}
                  <div
                    onClick={() => toggleExpand(service.id)}
                    className="group flex cursor-pointer items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition-colors ${service.isExpanded ? 'bg-cyan-700 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-700'}`}>
                        {service.isExpanded ? <Edit2 size={16} /> : <Check size={16} />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${!service.name ? 'text-slate-400 italic' : 'text-slate-950'}`}>
                          {service.name || 'New Service Item'}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {service.duration && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                              {service.duration}
                            </span>
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            ${service.amount}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeService(service.id);
                        }}
                        className="rounded-md p-2 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className={`p-1 text-slate-400 transition-transform duration-300 ${service.isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {service.isExpanded && (
                      <m.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-slate-100 bg-slate-50/70"
                      >
                        <div className="p-5 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                              <div>
                                <label className="mb-1.5 block text-sm font-bold leading-none text-slate-500">Service Name</label>
                                <Input
                                  value={service.name}
                                  onChange={(e) => updateService(service.id, 'name', e.target.value)}
                                  placeholder="e.g. Premium Haircut"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="mb-1.5 block text-sm font-bold leading-none text-slate-500">Price ($)</label>
                                  <Input
                                    type="number"
                                    value={service.amount}
                                    onChange={(e) => updateService(service.id, 'amount', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1.5 block text-sm font-bold leading-none text-slate-500">Duration</label>
                                  <Input
                                    value={service.duration || ''}
                                    onChange={(e) => updateService(service.id, 'duration', e.target.value)}
                                    placeholder="e.g. 30 min"
                                  />
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="mb-1.5 block text-sm font-bold leading-none text-slate-500">Description</label>
                              <TextArea
                                value={service.description || ''}
                                onChange={(e) => updateService(service.id, 'description', e.target.value)}
                                placeholder="Briefly describe what's included..."
                                rows={4}
                              />
                            </div>
                          </div>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </m.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div >
    </div >
  );
};
