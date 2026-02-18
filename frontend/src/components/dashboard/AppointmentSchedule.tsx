import React from 'react';
import { User, Calendar } from 'lucide-react';

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
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500">
        <Calendar className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm font-medium">No appointments today</p>
      </div>
    );
  }

  // Sort appointments by time using ISO string
  const sortedAppointments = [...appointments].sort((a, b) => 
    new Date(a.startTimeIso).getTime() - new Date(b.startTimeIso).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedAppointments.map((appt) => (
        <div 
          key={appt.id}
          className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
              {appt.formattedTime}
            </span>
            <span className="text-[10px] text-gray-400 font-medium px-1.5 border border-gray-100 rounded">
              {appt.service_type}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <h4 className="text-sm font-semibold text-gray-800 truncate">
              {appt.customer_name}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentSchedule;
