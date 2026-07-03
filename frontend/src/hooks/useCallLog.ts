import { useQuery } from '@tanstack/react-query';
import type { CallLog } from '../pages/dashboard/CallLogs/types';
import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';

export async function fetchCallLog(callId: string, signal?: AbortSignal): Promise<CallLog> {
  const headers = await getAuthHeader();
  const response = await fetch(`${env.API_URL}/dashboard/calls/${callId}`, {
    headers,
    signal
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  interface RawCallLog {
    caller_phone?: string;
    phone_number?: string;
  }

  const rawData = data as RawCallLog;
  return {
    ...data,
    phone_number: rawData.caller_phone || rawData.phone_number
  } as CallLog;
}

export function useCallLog(callId?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['call-log', callId],
    queryFn: ({ signal }) => fetchCallLog(callId as string, signal),
    enabled: Boolean(callId),
    staleTime: 60000
  });

  return {
    loading: isLoading,
    log: data ?? null,
    error: error instanceof Error ? error.message : null
  };
}
