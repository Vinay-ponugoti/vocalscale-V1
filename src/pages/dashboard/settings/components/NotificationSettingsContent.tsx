import React from 'react';
import { 
  AlertCircle, Globe, Save, PhoneForwarded 
} from 'lucide-react';
import { Toggle } from '../../components/SettingsComponents';
import type { NotificationSettingsProps } from '../../../../types/settings';

export const NotificationSettingsContent: React.FC<NotificationSettingsProps> = ({
  settings,
  onChange,
}) => {
  return (
    <div className="space-y-8">
      {/* Basic Toggles */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Delivery Channels</h3>
        
        {/* Urgent Call Alerts */}
        <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl hover:bg-white hover:border-indigo-100 transition-all duration-300 border border-slate-100 group">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-rose-500 shrink-0 shadow-sm group-hover:shadow-md transition-all">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 tracking-tight">Urgent Call Alerts</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Receive SMS immediately for emergency mentions</p>
            </div>
          </div>
          <Toggle 
            active={settings.urgent_call_alerts} 
            onChange={() => onChange({ urgent_call_alerts: !settings.urgent_call_alerts })} 
          />
        </div>

        {/* Booking Confirmations */}
        <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl hover:bg-white hover:border-indigo-100 transition-all duration-300 border border-slate-100 group">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-emerald-500 shrink-0 shadow-sm group-hover:shadow-md transition-all">
              <Globe size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 tracking-tight">New Booking Confirmations</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Email notification for new calendar bookings</p>
            </div>
          </div>
          <Toggle 
            active={settings.booking_confirmations} 
            onChange={() => onChange({ booking_confirmations: !settings.booking_confirmations })} 
          />
        </div>

        {/* Missed Call Alerts */}
        <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl hover:bg-white hover:border-indigo-100 transition-all duration-300 border border-slate-100 group">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-500 shrink-0 shadow-sm group-hover:shadow-md transition-all">
              <Save size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 tracking-tight">Missed Call Alerts</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Digest of all missed calls and bookings</p>
            </div>
          </div>
          <Toggle 
            active={settings.missed_call_alerts} 
            onChange={() => onChange({ missed_call_alerts: !settings.missed_call_alerts })} 
          />
        </div>
      </div>

      {/* Call Transfer Configuration */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Call Forwarding & Routing</h3>
          <p className="text-[9px] text-slate-400 px-1 mt-1">Configure how calls are routed to your team based on AI escalation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Urgent Transfer */}
          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 shrink-0">
                <PhoneForwarded size={16} />
              </div>
              <div className="flex-1">
                <h4 className="text-[11px] font-black text-slate-900 mb-0.5 uppercase tracking-wider">Urgent Transfer</h4>
                <p className="text-[10px] font-bold text-slate-400 mb-4">Route here when AI detects an emergency.</p>
                
                <div className="flex items-center gap-3 px-3 py-2 bg-slate-50/50 rounded-xl border border-slate-100 focus-within:border-rose-200 transition-colors">
                  <span className="text-sm">📱</span>
                  <input
                    type="tel"
                    value={settings.transfer_number || ''}
                    onChange={(e) => onChange({ transfer_number: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-transparent border-none p-0 text-slate-900 font-mono text-xs font-black tracking-tight focus:ring-0 placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Standard Transfer */}
          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 shrink-0">
                <PhoneForwarded size={16} />
              </div>
              <div className="flex-1">
                <h4 className="text-[11px] font-black text-slate-900 mb-0.5 uppercase tracking-wider">Standard Transfer</h4>
                <p className="text-[10px] font-bold text-slate-400 mb-4">Route here for non-escalated requests.</p>
                
                <div className="flex items-center gap-3 px-3 py-2 bg-slate-50/50 rounded-xl border border-slate-100 focus-within:border-indigo-200 transition-colors">
                  <span className="text-sm">📱</span>
                  <input
                    type="tel"
                    value={settings.standard_transfer_number || ''}
                    onChange={(e) => onChange({ standard_transfer_number: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-transparent border-none p-0 text-slate-900 font-mono text-xs font-black tracking-tight focus:ring-0 placeholder:text-slate-300"
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
