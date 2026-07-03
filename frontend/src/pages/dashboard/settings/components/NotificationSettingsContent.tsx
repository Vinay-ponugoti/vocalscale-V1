import React from 'react';
import { MailCheck, PhoneForwarded, Siren } from 'lucide-react';
import { Toggle } from '../../components/SettingsComponents';
import type { NotificationSettingsProps } from '../../../../types/settings';

const sanitizePhoneInput = (value: string) => value.replace(/[^0-9+()-\s]/g, '');

export const NotificationSettingsContent: React.FC<NotificationSettingsProps> = ({
  settings,
  onChange,
}) => {
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-cyan-700">
              <MailCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">Booking confirmation emails</p>
              <p className="mt-1 text-sm font-medium text-slate-500">Send an email when a new appointment is booked.</p>
            </div>
          </div>
          <Toggle
            active={settings.booking_confirmations}
            onChange={() => onChange({ booking_confirmations: !settings.booking_confirmations })}
          />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-950">Call routing</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">Choose where callers should be transferred when the assistant escalates.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
          <div className={`rounded-lg border p-4 transition ${settings.urgent_transfer_enabled ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${settings.urgent_transfer_enabled ? 'border-rose-200 bg-white text-rose-600' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                  <Siren className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Urgent transfer</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">Emergency or high-priority requests.</p>
                </div>
              </div>
              <Toggle
                active={settings.urgent_transfer_enabled || false}
                onChange={() => onChange({ urgent_transfer_enabled: !settings.urgent_transfer_enabled })}
              />
            </div>

            <label className="mt-4 block text-xs font-semibold text-slate-500">Transfer number</label>
            <input
              type="tel"
              value={settings.transfer_number || ''}
              onChange={(event) => onChange({ transfer_number: sanitizePhoneInput(event.target.value) })}
              disabled={!settings.urgent_transfer_enabled}
              placeholder="+1 (555) 000-0000"
              className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          <div className={`rounded-lg border p-4 transition ${settings.standard_transfer_enabled ? 'border-cyan-200 bg-cyan-50/40' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${settings.standard_transfer_enabled ? 'border-cyan-200 bg-white text-cyan-700' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                  <PhoneForwarded className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Standard transfer</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">General handoff when a caller asks for a person.</p>
                </div>
              </div>
              <Toggle
                active={settings.standard_transfer_enabled || false}
                onChange={() => onChange({ standard_transfer_enabled: !settings.standard_transfer_enabled })}
              />
            </div>

            <label className="mt-4 block text-xs font-semibold text-slate-500">Transfer number</label>
            <input
              type="tel"
              value={settings.standard_transfer_number || ''}
              onChange={(event) => onChange({ standard_transfer_number: sanitizePhoneInput(event.target.value) })}
              disabled={!settings.standard_transfer_enabled}
              placeholder="+1 (555) 000-0000"
              className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
