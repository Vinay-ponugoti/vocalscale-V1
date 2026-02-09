import React, { useState } from 'react';
import {
  Plus, Trash2, Edit2,
  FileText, Check, ChevronDown
} from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import { useToast } from '../../../hooks/useToast';
import type { Service as GlobalService } from '../../../types/business';

// --- Styled Components to match previous pages ---

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all duration-200 block ${props.className || ''}`}
  />
);

const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all duration-200 block resize-none ${props.className || ''}`}
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
  const { showToast } = useToast();
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
    <div className="space-y-6">

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
        className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50/50 transition-all cursor-pointer group"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 group-hover:text-slate-900 transition-all">
            <Plus size={18} />
          </div>
          <div>
            <h4 className="scroll-m-20 text-sm font-semibold tracking-tight text-slate-900">Add Service</h4>
            <p className="text-sm text-slate-500 mt-0.5">Add a new service item with pricing and details.</p>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="scroll-m-20 text-sm font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="text-indigo-600 w-4 h-4" />
            Service Items
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {localServices.length}
            </span>
          </h3>
        </div>

        <AnimatePresence mode="popLayout">
          {localServices.length === 0 ? (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="text-slate-300 w-5 h-5" />
              </div>
              <p className="text-slate-500 font-medium text-sm">No services listed yet</p>
              <p className="text-slate-400 text-xs mt-1">Click "Add Service" above to get started.</p>
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
                  className={`bg-white border rounded-xl overflow-hidden transition-all ${service.isExpanded ? 'border-indigo-200 shadow-md ring-1 ring-indigo-100' : 'border-slate-200 shadow-sm hover:border-slate-300'
                    }`}
                >
                  {/* Card Header */}
                  <div
                    onClick={() => toggleExpand(service.id)}
                    className="p-4 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${service.isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                        {service.isExpanded ? <Edit2 size={16} /> : <Check size={16} />}
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm ${!service.name ? 'text-slate-400 italic' : 'text-slate-900'}`}>
                          {service.name || 'New Service Item'}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {service.duration && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {service.duration}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
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
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
                        className="border-t border-slate-100 overflow-hidden bg-slate-50/30"
                      >
                        <div className="p-5 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium leading-none text-slate-500 block mb-1.5">Service Name</label>
                                <Input
                                  value={service.name}
                                  onChange={(e) => updateService(service.id, 'name', e.target.value)}
                                  placeholder="e.g. Premium Haircut"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-sm font-medium leading-none text-slate-500 block mb-1.5">Price ($)</label>
                                  <Input
                                    type="number"
                                    value={service.amount}
                                    onChange={(e) => updateService(service.id, 'amount', parseFloat(e.target.value))}
                                    placeholder="0.00"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium leading-none text-slate-500 block mb-1.5">Duration</label>
                                  <Input
                                    value={service.duration || ''}
                                    onChange={(e) => updateService(service.id, 'duration', e.target.value)}
                                    placeholder="e.g. 30 min"
                                  />
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium leading-none text-slate-500 block mb-1.5">Description</label>
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
