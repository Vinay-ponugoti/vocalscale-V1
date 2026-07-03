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
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-slate-600">Loading booking rules</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Information to collect</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">Set which caller details must be captured before a booking is finalized.</p>
        </div>

        {hasChanges && (
          <m.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"
          >
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold text-amber-800">Unsaved changes</span>
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
                className={`group relative flex items-center gap-4 rounded-lg border p-4 transition
                  ${req.required
                    ? 'border-cyan-200 bg-white shadow-sm shadow-cyan-100/50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                  }
                `}
              >
                <div className="text-slate-300 transition-colors group-hover:text-slate-400">
                  <GripVertical size={18} />
                </div>

                <div className={`
                  rounded-lg p-2.5 transition
                  ${req.required ? 'bg-cyan-50 text-cyan-700' : 'border border-slate-200 bg-slate-50 text-slate-400'}
                `}>
                  <Icon size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-sm font-semibold text-slate-950">{req.field_name}</h4>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`text-xs font-medium ${req.required ? 'text-cyan-700' : 'text-slate-500'
                      }`}>
                      {req.required ? 'Required before booking' : 'Optional detail'}
                    </span>
                    {isDefault && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-xs font-medium text-slate-400">Default</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(idx)}
                    className={`rounded-lg border px-4 py-2 text-xs font-semibold transition
                      ${req.required
                        ? 'border-cyan-600 bg-cyan-600 text-white hover:bg-cyan-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-500 hover:text-cyan-700'
                      }
                    `}
                  >
                    {req.required ? 'Required' : 'Optional'}
                  </button>

                  {!isDefault && (
                    <button
                      onClick={() => handleRemove(idx)}
                      className="rounded-lg p-2 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
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

        <AnimatePresence mode="wait">
          {!isAddingField ? (
            <m.button
              key="add-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingField(true)}
              className="group flex items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-500 transition hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-700"
            >
              <div className="rounded-lg bg-white p-2 transition group-hover:bg-cyan-600 group-hover:text-white">
                <Plus size={18} strokeWidth={3} />
              </div>
              <span className="text-sm font-semibold">Add custom field</span>
            </m.button>
          ) : (
            <m.div
              key="add-input"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col gap-3 rounded-lg border border-cyan-200 bg-white p-3 shadow-sm shadow-cyan-100/50 sm:flex-row sm:items-center"
            >
              <div className="rounded-lg bg-cyan-50 p-2.5 text-cyan-700">
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
                className="min-h-10 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsAddingField(false)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newFieldName.trim()}
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-cyan-100 hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-start gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-cyan-700">
          <ShieldCheck size={20} className="shrink-0" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">Booking validation</p>
          <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
            Required fields must be collected before the assistant can complete an appointment.
          </p>
        </div>
      </div>
    </div>
  );
};
