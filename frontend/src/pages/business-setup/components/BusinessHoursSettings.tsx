import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import type { BusinessHour } from '../../../types/business';
import {
  Clock, CalendarClock
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
    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-950 transition-all placeholder:text-slate-400 hover:bg-white focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/10"
  />
);

const CustomToggle: React.FC<{ active: boolean; onChange?: () => void; label?: string }> = ({ active, onChange, label }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${active ? 'bg-cyan-700' : 'bg-slate-200'}`}
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
    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition-colors hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800"
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
    <div className="space-y-5 font-sans">

      {/* Presets Section */}
      <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-cyan-50 text-cyan-700">
            <CalendarClock size={16} />
          </div>
          <span className="text-sm font-black tracking-tight text-slate-950">Quick Presets</span>
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
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {DAYS.map((day, index) => {
          const isEnabled = hours[index]?.enabled || false;

          return (
            <div
              key={day.key}
              className={`
                relative rounded-lg border p-5 transition-colors
                ${isEnabled
                  ? 'border-slate-200 bg-white shadow-sm'
                  : 'border-slate-200 bg-slate-50/80'
                }
              `}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold leading-none ${isEnabled ? 'text-slate-950' : 'text-slate-400'}`}>
                    {day.label}
                  </span>
                  {!isEnabled && (
                    <span className="inline-flex items-center rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500">
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
                    <label className="mb-1.5 block text-sm font-bold leading-none text-slate-500">Opens</label>
                    <CustomInput
                      type="time"
                      value={hours[index]?.open_time || ''}
                      onChange={(e) => handleTimeChange(index, 'open_time', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold leading-none text-slate-500">Closes</label>
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
      <div className="flex items-start gap-4 rounded-lg border border-cyan-100 bg-cyan-50/70 p-4 text-slate-700">
        <div className="shrink-0 rounded-md border border-cyan-100 bg-white p-2 shadow-sm">
          <Clock size={18} className="text-cyan-700" />
        </div>
        <div>
          <p className="mb-0.5 text-sm font-black tracking-tight text-slate-950">After-Hours Handling</p>
          <p className="text-sm font-medium leading-relaxed text-slate-600">
            When calls arrive outside active windows, the AI will automatically switch to voicemail mode or route to emergency contacts based on your priority handling settings.
          </p>
        </div>
      </div>

    </div>
  );
};

export default BusinessHoursSettings;
