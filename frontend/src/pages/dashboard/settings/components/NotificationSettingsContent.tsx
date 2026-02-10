import React from 'react';
import {
  Globe, PhoneForwarded
} from 'lucide-react';
import { Toggle } from '../../components/SettingsComponents';
import type { NotificationSettingsProps } from '../../../../types/settings';

export const NotificationSettingsContent: React.FC<NotificationSettingsProps> = ({
  settings,
  onChange,
}) => {
  return (
    <div className="space-y-8 2xl:space-y-12">
      {/* Basic Toggles */}
      <div className="space-y-4 2xl:space-y-6">
        <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 mb-5 px-1">Delivery Channels</h3>

        {/* Booking Confirmations */}
        <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl hover:bg-white hover:border-indigo-100 transition-all duration-300 border border-slate-100 group">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-emerald-500 shrink-0 shadow-sm group-hover:shadow-md transition-all">
              <Globe size={20} />
            </div>
            <div>
              <p className="text-[15px] font-black text-slate-900 tracking-tight">New Booking Confirmations</p>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-1">Email notification for new calendar bookings</p>
            </div>
          </div>
          <Toggle
            active={settings.booking_confirmations}
            onChange={() => onChange({ booking_confirmations: !settings.booking_confirmations })}
          />
        </div>
      </div>

      {/* Call Transfer Configuration */}
      <div className="space-y-5 pt-6 border-t border-slate-100">
        <div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 px-1">Call Forwarding & Routing</h3>
          <p className="text-[11px] text-slate-500 px-1 mt-1 font-bold uppercase tracking-wide opacity-80">Configure how calls are routed to your team based on AI escalation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-8">
          {/* Urgent Transfer */}
          <div className={`p-5 bg-white rounded-2xl border shadow-sm transition-all ${settings.urgent_transfer_enabled ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100 opacity-70'}`}>
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-xl shrink-0 ${settings.urgent_transfer_enabled ? 'bg-rose-100 border border-rose-200 text-rose-600' : 'bg-slate-100 border border-slate-200 text-slate-400'}`}>
                <PhoneForwarded size={16} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-wider">Urgent Transfer</h4>
                  <Toggle
                    active={settings.urgent_transfer_enabled || false}
                    onChange={() => onChange({ urgent_transfer_enabled: !settings.urgent_transfer_enabled })}
                  />
                </div>
                <p className="text-[11px] font-bold text-slate-500 mb-4 opacity-70">Route here when AI detects an emergency.</p>

                <div className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-colors ${settings.urgent_transfer_enabled ? 'bg-white border-rose-100' : 'bg-slate-50/50 border-slate-100'}`}>
                  <span className="text-sm">📱</span>
                  <input
                    type="tel"
                    value={settings.transfer_number || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9+()-\s]/g, '');
                      onChange({ transfer_number: value });
                    }}
                    disabled={!settings.urgent_transfer_enabled}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full bg-transparent border-none p-0 font-mono text-xs font-black tracking-tight focus:ring-0 focus:outline-none ${settings.urgent_transfer_enabled ? 'text-slate-900 placeholder:text-slate-300' : 'text-slate-400 placeholder:text-slate-300 cursor-not-allowed'}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Standard Transfer */}
          <div className={`p-5 bg-white rounded-2xl border shadow-sm transition-all ${settings.standard_transfer_enabled ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-100 opacity-70'}`}>
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-xl shrink-0 ${settings.standard_transfer_enabled ? 'bg-indigo-100 border border-indigo-200 text-indigo-600' : 'bg-slate-100 border border-slate-200 text-slate-400'}`}>
                <PhoneForwarded size={16} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-wider">Standard Transfer</h4>
                  <Toggle
                    active={settings.standard_transfer_enabled || false}
                    onChange={() => onChange({ standard_transfer_enabled: !settings.standard_transfer_enabled })}
                  />
                </div>
                <p className="text-[11px] font-bold text-slate-500 mb-4 opacity-70">Route here for non-escalated requests.</p>

                <div className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-colors ${settings.standard_transfer_enabled ? 'bg-white border-indigo-100' : 'bg-slate-50/50 border-slate-100'}`}>
                  <span className="text-sm">📱</span>
                  <input
                    type="tel"
                    value={settings.standard_transfer_number || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9+()-\s]/g, '');
                      onChange({ standard_transfer_number: value });
                    }}
                    disabled={!settings.standard_transfer_enabled}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full bg-transparent border-none p-0 font-mono text-xs font-black tracking-tight focus:ring-0 focus:outline-none ${settings.standard_transfer_enabled ? 'text-slate-900 placeholder:text-slate-300' : 'text-slate-400 placeholder:text-slate-300 cursor-not-allowed'}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
