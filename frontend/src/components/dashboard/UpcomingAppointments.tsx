import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';

interface Appointment {
  id: string | number;
  scheduled_at: string;
  customer_name: string;
  service_type: string;
}

const dayLabel = (d: Date) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return 'Today';
  if (same(d, tomorrow)) return 'Tomorrow';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

/**
 * Compact "what's next" panel — the next few upcoming appointments, so the
 * right column answers "what did the agent book for me?" at a glance.
 */
const UpcomingAppointments = ({ appointments }: { appointments: Appointment[] }) => {
  const [renderedAt] = useState(() => Date.now());
  const upcoming = appointments
    .filter((a) => {
      const t = new Date(a.scheduled_at).getTime();
      return !Number.isNaN(t) && t >= renderedAt;
    })
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 3);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Calendar size={15} />
          </span>
          <h3 className="text-sm font-semibold text-slate-900">Upcoming appointments</h3>
        </div>
        <Link
          to="/dashboard/appointments"
          className="flex items-center gap-0.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          View all <ArrowRight size={12} />
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
          No upcoming appointments. Appointments your agent books will show here.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {upcoming.map((a) => {
            const d = new Date(a.scheduled_at);
            return (
              <li key={a.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-slate-50 px-1 py-1.5">
                  <span className="text-[11px] font-semibold uppercase text-slate-400">
                    {d.toLocaleDateString(undefined, { month: 'short' })}
                  </span>
                  <span className="text-base font-semibold leading-tight text-slate-800">{d.getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{a.customer_name || 'Unnamed contact'}</p>
                  <p className="truncate text-xs text-slate-400">{a.service_type || 'Appointment'}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-slate-700">
                    {d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                  </p>
                  <p className="text-[11px] text-slate-400">{dayLabel(d)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default UpcomingAppointments;
