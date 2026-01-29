import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import type { BusinessHour } from '../../../types/business';
import {
  Clock, Zap
} from 'lucide-react';

// --- Types & Constants ---

const INT_TO_DAY: { [key: number]: string } = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
};

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

const PRESETS = [
  {
    label: 'Standard (9-5)',
    action: (h: BusinessHour[]) => h.map(d => ({ ...d, enabled: !['saturday', 'sunday'].includes(d.day_of_week), open_time: '09:00', close_time: '17:00' }))
  },
  {
    label: '24/7 Support',
    action: (h: BusinessHour[]) => h.map(d => ({ ...d, enabled: true, open_time: '00:00', close_time: '23:59' }))
  },
  {
    label: 'Weekend Only',
    action: (h: BusinessHour[]) => h.map(d => ({ ...d, enabled: ['saturday', 'sunday'].includes(d.day_of_week), open_time: '10:00', close_time: '18:00' }))
  },
];

// --- Reusable UI Components ---

const CustomInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 hover:bg-white focus:bg-white px-3 py-2.5 transition-all placeholder:text-slate-400"
  />
);

const CustomToggle: React.FC<{ active: boolean; onChange?: () => void; label?: string }> = ({ active, onChange, label }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${active ? 'bg-indigo-600' : 'bg-slate-200'}`}
    aria-pressed={active}
    aria-label={label || 'Toggle status'}
  >
    <span
      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${active ? 'translate-x-5' : 'translate-x-0.5'}`}
    />
  </button>
);

const PresetButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-all active:scale-95 shadow-sm"
  >
    {label}
  </button>
);

// --- Main Component ---

export const BusinessHoursSettings: React.FC = () => {
  const { state, actions } = useBusinessSetup();
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [prevIncomingString, setPrevIncomingString] = useState<string>('');
  const lastSyncedRef = useRef<string>('');

  // Sync with global state when data is loaded (Adjusting state during render)
  const incomingHours = state.data.business_hours || [];
  const incomingString = JSON.stringify(incomingHours);

  if (incomingString !== prevIncomingString && !state.loading) {
    setPrevIncomingString(incomingString);

    const convertedHours = incomingHours.map((h: BusinessHour) => ({
      ...h,
      day_of_week: typeof h.day_of_week === 'number' ? INT_TO_DAY[h.day_of_week] : (INT_TO_DAY[parseInt(h.day_of_week)] || h.day_of_week),
      open_time: h.open_time ? h.open_time.slice(0, 5) : '09:00',
      close_time: h.close_time ? h.close_time.slice(0, 5) : '17:00'
    }));

    const newHours = DAYS.map(day => {
      const existing = convertedHours.find((h: BusinessHour) => h.day_of_week === day.key);
      return existing || {
        day_of_week: day.key,
        enabled: false,
        open_time: '09:00',
        close_time: '17:00'
      };
    });

    setHours(newHours as BusinessHour[]);
  }

  // Sync the ref in an effect to avoid render-time updates
  useEffect(() => {
    lastSyncedRef.current = incomingString;
  }, [incomingString]);

  // Sync Back to Global State (Outgoing)
  const syncToGlobal = useCallback((updatedHours: BusinessHour[]) => {
    const globalString = JSON.stringify(updatedHours);
    if (globalString !== lastSyncedRef.current) {
      lastSyncedRef.current = globalString;
      actions.updateBusinessHours(updatedHours);
    }
  }, [actions]);

  const handleToggleChange = (index: number) => {
    const newHours = [...hours];
    newHours[index].enabled = !newHours[index].enabled;
    setHours(newHours);
    syncToGlobal(newHours);
  };

  const handleTimeChange = (index: number, field: 'open_time' | 'close_time', value: string) => {
    const newHours = [...hours];
    newHours[index][field] = value;
    setHours(newHours);
    syncToGlobal(newHours);
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    const newHours = preset.action(hours);
    setHours(newHours);
    syncToGlobal(newHours);
  };

  return (
    <div className="space-y-6 font-sans">

      {/* Presets Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50/50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2.5">
          <Zap size={16} className="text-indigo-600" />
          <span className="scroll-m-20 text-sm font-semibold tracking-tight text-slate-900">Quick Presets</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, idx) => (
            <PresetButton
              key={idx}
              label={preset.label}
              onClick={() => applyPreset(preset)}
            />
          ))}
        </div>
      </div>

      {/* Hours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DAYS.map((day, index) => {
          const isEnabled = hours[index]?.enabled || false;

          return (
            <div
              key={day.key}
              className={`
                relative p-5 rounded-xl border transition-all duration-200
                ${isEnabled
                  ? 'bg-white border-slate-200 shadow-sm'
                  : 'bg-slate-50/50 border-slate-100'
                }
              `}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium leading-none ${isEnabled ? 'text-slate-900' : 'text-slate-400'}`}>
                    {day.label}
                  </span>
                  {!isEnabled && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                      Closed
                    </span>
                  )}
                </div>

                <CustomToggle
                  active={isEnabled}
                  onChange={() => handleToggleChange(index)}
                  label={`Toggle ${day.label}`}
                />
              </div>

              {isEnabled && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div>
                    <label className="text-sm font-medium leading-none text-slate-500 mb-1.5 block">Opens</label>
                    <CustomInput
                      type="time"
                      value={hours[index]?.open_time || ''}
                      onChange={(e) => handleTimeChange(index, 'open_time', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium leading-none text-slate-500 mb-1.5 block">Closes</label>
                    <CustomInput
                      type="time"
                      value={hours[index]?.close_time || ''}
                      onChange={(e) => handleTimeChange(index, 'close_time', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Agent Behavior Tip */}
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-4 text-slate-700">
        <div className="p-2 bg-white border border-slate-200 rounded-lg shrink-0 shadow-sm">
          <Clock size={18} className="text-indigo-600" />
        </div>
        <div>
          <p className="scroll-m-20 text-sm font-semibold tracking-tight text-slate-900 mb-0.5">Off-Hours Protocol</p>
          <p className="text-sm text-slate-500 leading-relaxed">
            When calls arrive outside active windows, the AI will automatically switch to voicemail mode or route to emergency contacts based on your priority handling settings.
          </p>
        </div>
      </div>

    </div>
  );
};

export default BusinessHoursSettings;