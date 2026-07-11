import { useEffect, useState } from 'react';
import type { Voice } from '../types/settings';
import { api } from '../lib/api';

/**
 * Shared voices loader with a module-level cache so multiple consumers
 * (the collapsed voice summary + the expanded picker) don't each refetch.
 */
let cache: Voice[] | null = null;
let inflight: Promise<Voice[]> | null = null;

const fetchVoices = (): Promise<Voice[]> => {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = api
      .getVoices()
      .then((resp: { data?: Voice[] }) => {
        cache = (resp?.data || []).filter((v) => v.is_active !== false);
        return cache;
      })
      .catch(() => {
        inflight = null;
        return [];
      });
  }
  return inflight;
};

export const useVoices = () => {
  const [voices, setVoices] = useState<Voice[]>(cache || []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    fetchVoices().then((data) => {
      if (!cancelled) {
        setVoices(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { voices, loading };
};
