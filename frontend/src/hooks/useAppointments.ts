import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { addHours, parseISO } from 'date-fns';
import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';

export interface Appointment {
  id: string;
  title: string;
  customer_name: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  status: 'Confirmed' | 'Pending' | 'Canceled' | 'Completed' | 'Scheduled';
  type: 'Consultation' | 'Internal' | 'Follow-up' | 'Review' | 'Demo' | string;
  location?: string;
  phone?: string;
  notes?: string;
  user_id?: string;
}

interface RawAppointment {
  id: string | number;
  service_type: string;
  customer_name: string;
  scheduled_time: string;
  status: string;
  notes?: string;
}

export function useAppointments() {
  const queryClient = useQueryClient();

  const { data, isLoading, isPlaceholderData, error } = useQuery<Appointment[]>({
    queryKey: ['appointments-calendar'],
    queryFn: async () => {
      const headers = await getAuthHeader();
      const response = await fetch(`${env.API_URL}/dashboard/appointments?size=100`, {
        headers
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const rawData = await response.json();
      return (rawData.items || []).map((appt: RawAppointment) => ({
        id: appt.id.toString(),
        title: `${appt.service_type}: ${appt.customer_name}`,
        customer_name: appt.customer_name,
        start_time: appt.scheduled_time,
        end_time: addHours(parseISO(appt.scheduled_time), 1).toISOString(),
        status: appt.status || 'Scheduled',
        type: appt.service_type,
        notes: appt.notes
      }));
    },
    placeholderData: keepPreviousData,
    staleTime: 60000, // 1 minute
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Appointment> }) => {
      const headers = await getAuthHeader();
      
      const payload = {
        ...(updates.start_time && { scheduled_time: updates.start_time }),
        ...(updates.customer_name && { customer_name: updates.customer_name }),
        ...(updates.type && { service_type: updates.type }),
        ...(updates.status && { status: updates.status }),
        ...(updates.user_id && { user_id: updates.user_id }),
        ...(updates.notes && { notes: updates.notes }),
      };

      const response = await fetch(`${env.API_URL}/dashboard/appointments/${id}`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  const createMutation = useMutation({
    mutationFn: async (appointment: Omit<Appointment, 'id'>) => {
      const headers = await getAuthHeader();

      const payload = {
        scheduled_time: appointment.start_time,
        customer_name: appointment.customer_name,
        service_type: appointment.type,
        status: appointment.status,
        user_id: appointment.user_id,
        notes: appointment.notes,
      };

      const response = await fetch(`${env.API_URL}/dashboard/appointments`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  return {
    loading: isLoading,
    isPlaceholderData,
    appointments: data || [],
    error: error instanceof Error ? error.message : null,
    updateAppointment: (id: string, updates: Partial<Appointment>) => updateMutation.mutateAsync({ id, updates }),
    createAppointment: (appointment: Omit<Appointment, 'id'>) => createMutation.mutateAsync(appointment)
  };
}
