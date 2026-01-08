import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, GripVertical, Settings2, ShieldCheck, User, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { api } from '../../../../lib/api';
import type { BookingRequirement } from '../../../../types/settings';

const FIELD_ICONS: Record<string, React.ElementType> = {
  'customer name': User,
  'phone number': Phone,
  'email': Mail,
  'address': MapPin,
  'date': Calendar,
  'time': Calendar,
};

const getFieldIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  for (const [key, Icon] of Object.entries(FIELD_ICONS)) {
    if (lowerName.includes(key)) return Icon;
  }
  return Settings2;
};

export const BookingRequirementsContent: React.FC = () => {
  const [requirements, setRequirements] = useState<BookingRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await api.getBookingRequirements();
      if (resp?.data) {
        setRequirements(resp.data);
      }
    } catch (error) {
      console.error('Failed to load booking requirements:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const notifyChanges = useCallback((changed: boolean) => {
    setHasChanges(changed);
    window.dispatchEvent(new CustomEvent('booking-requirements-changes', {
      detail: { hasChanges: changed }
    }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await api.updateBookingRequirements(requirements);
      await loadData();
      notifyChanges(false);
      return { success: true };
    } catch (error) {
      console.error('Failed to save booking requirements:', error);
      throw error;
    }
  }, [requirements, loadData, notifyChanges]);

  useEffect(() => {
    const handleGlobalSave = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.registerPromise) {
        customEvent.detail.registerPromise(handleSave());
      }
    };

    window.addEventListener('booking-requirements-save', handleGlobalSave);
    return () => {
      window.removeEventListener('booking-requirements-save', handleGlobalSave);
    };
  }, [handleSave]);

  const isDefaultRequirement = (fieldName: string) => {
    const name = fieldName.toLowerCase();
    return name === 'customer name' || name === 'phone number';
  };

  const handleToggleStatus = (index: number) => {
    const next = [...requirements];
    next[index] = { ...next[index], required: !next[index].required };
    setRequirements(next);
    notifyChanges(true);
  };

  const handleRemove = (index: number) => {
    if (isDefaultRequirement(requirements[index].field_name)) return;
    const next = requirements.filter((_, i) => i !== index);
    setRequirements(next);
    notifyChanges(true);
  };

  const handleAdd = () => {
    if (!newFieldName.trim()) return;
    const next = [...requirements, { field_name: newFieldName.trim(), required: false, field_type: 'text' }];
    setRequirements(next);
    setNewFieldName('');
    setIsAddingField(false);
    notifyChanges(true);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 animate-pulse">Synchronizing</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Booking Rules</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Active Requirements</h3>
          <p className="text-[9px] text-slate-400 px-1 mt-1 font-medium">Configure what information AI must collect from callers.</p>
        </div>
        
        {hasChanges && (
          <m.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5 bg-indigo-50/50 px-3.5 py-2 rounded-xl border border-indigo-100/50"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Unsaved Progress</span>
          </m.div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <AnimatePresence mode="popLayout">
          {requirements.map((req, idx) => {
            const Icon = getFieldIcon(req.field_name);
            const isDefault = isDefaultRequirement(req.field_name);
            
            return (
              <m.div
                key={req.field_name + idx}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`
                  group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300
                  ${req.required 
                    ? 'bg-white border-indigo-100 shadow-sm shadow-indigo-50/50' 
                    : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:border-slate-200'
                  }
                `}
              >
                {/* Drag Handle Icon (Static for now) */}
                <div className="text-slate-300 group-hover:text-slate-400 transition-colors">
                  <GripVertical size={18} />
                </div>

                {/* Icon & Name */}
                <div className={`
                  p-2.5 rounded-xl transition-all duration-300
                  ${req.required ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-400 border border-slate-100'}
                `}>
                  <Icon size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-900 text-sm tracking-tight truncate">{req.field_name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                      req.required ? 'text-indigo-600' : 'text-slate-400'
                    }`}>
                      {req.required ? 'Mandatory Field' : 'Optional Collection'}
                    </span>
                    {isDefault && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Core System</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(idx)}
                    className={`
                      px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all duration-300
                      ${req.required
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 hover:bg-indigo-700' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-600 hover:text-indigo-600'
                      }
                    `}
                  >
                    {req.required ? 'Required' : 'Optional'}
                  </button>

                  {!isDefault && (
                    <button
                      onClick={() => handleRemove(idx)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-300"
                      title="Remove Field"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </m.div>
            );
          })}
        </AnimatePresence>

        {/* Add Field Section */}
        <AnimatePresence mode="wait">
          {!isAddingField ? (
            <m.button
              key="add-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingField(true)}
              className="group flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed border-slate-100 text-slate-400 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50/20 transition-all duration-300"
            >
              <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Plus size={16} strokeWidth={3} />
              </div>
              <span className="font-black text-[10px] uppercase tracking-widest">Add Custom Field</span>
            </m.button>
          ) : (
            <m.div
              key="add-input"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-3 p-3 bg-white border border-indigo-100 rounded-2xl shadow-lg shadow-indigo-50/50"
            >
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Settings2 size={18} />
              </div>
              <input
                autoFocus
                type="text"
                placeholder="Field Name (e.g. Email Address)"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                  if (e.key === 'Escape') setIsAddingField(false);
                }}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-black text-slate-900 placeholder:text-slate-300 placeholder:font-bold"
              />
              <div className="flex items-center gap-1.5 pr-1">
                <button
                  onClick={() => setIsAddingField(false)}
                  className="px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newFieldName.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100"
                >
                  Add Field
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Policy Card */}
      <div className="bg-slate-900 p-5 rounded-3xl flex gap-5 items-center shadow-2xl shadow-slate-200">
        <div className="p-3 bg-white/10 rounded-2xl border border-white/5">
          <ShieldCheck size={24} className="text-indigo-400 shrink-0" />
        </div>
        <div className="space-y-1">
          <p className="text-[13px] font-black text-white tracking-tight flex items-center gap-2">
            Verification Protocol
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-[8px] uppercase tracking-tighter">Active</span>
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-relaxed">
            Fields marked as <span className="text-white">Required</span> are hard-validated by the AI before appointment finalization.
          </p>
        </div>
      </div>
    </div>
  );
};