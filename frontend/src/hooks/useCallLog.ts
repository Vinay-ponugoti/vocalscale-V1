import { useState, useEffect } from 'react';
import type { CallLog } from '../pages/dashboard/CallLogs/types';
import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';

export function useCallLog(callId?: string) {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<CallLog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!callId) {
      setLog(null);
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;

    const fetchLog = async () => {
      setLoading(true);
      setError(null);

      try {
        const headers = await getAuthHeader();
        const response = await fetch(`${env.API_URL}/dashboard/calls/${callId}`, {
          headers
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (mounted) {
          interface RawCallLog {
            caller_phone?: string;
            phone_number?: string;
          }
          const rawData = data as RawCallLog;
          const mappedData = data ? {
            ...data,
            phone_number: rawData.caller_phone || rawData.phone_number
          } : null;
          setLog(mappedData as CallLog | null);
        }
      } catch (err: unknown) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
          setError(errorMessage);
          setLog(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchLog();

    return () => {
      mounted = false;
    };
  }, [callId]);

  return { loading, log, error };
}
