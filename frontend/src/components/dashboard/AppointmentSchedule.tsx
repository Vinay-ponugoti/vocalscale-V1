import React from 'react';
import { Calendar, Clock, UserRound } from 'lucide-react';

interface ScheduledAppointment {
  id: string;
  startTimeIso: string;
  formattedTime: string;
  customer_name: string;
  service_type: string;
}

interface AppointmentScheduleProps {
  appointments: ScheduledAppointment[];
}

const AppointmentSchedule: React.FC<AppointmentScheduleProps> = ({ appointments }) => {
  const sortedAppointments = [...appointments].sort((a, b) =>
    new Date(a.startTimeIso).getTime() - new Date(b.startTimeIso).getTime()
  );

  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm">
          <Calendar size={20} />
        </div>
        <p className="text-sm font-bold text-slate-900">No appointments booked</p>
        <p className="mt-1 text-xs font-medium leading-5 text-slate-500">New bookings for this day will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-950">Booked appointments</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Today&apos;s schedule</p>
          </div>
          <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-blue-600 px-2 text-sm font-bold text-white">
            {sortedAppointments.length}
          </span>
        </div>
      </div>

      {sortedAppointments.map((appt) => (
        <div
          key={appt.id}
          className="group rounded-lg border border-l-4 border-slate-200 border-l-blue-600 bg-white p-3 shadow-sm transition-colors hover:bg-blue-50/40"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
              <Clock size={12} />
              {appt.formattedTime}
            </span>
            <span className="max-w-[120px] truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {appt.service_type}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <UserRound size={15} />
            </div>
            <h4 className="min-w-0 truncate text-sm font-semibold text-slate-950">
              {appt.customer_name}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentSchedule;
