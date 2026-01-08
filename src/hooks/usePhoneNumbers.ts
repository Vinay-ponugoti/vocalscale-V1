
import { useState, useEffect, useCallback } from 'react';
import { env } from '../config/env';
import type { PhoneNumber } from '../types/voice';

import { getAuthHeader } from '../lib/api';

const API_BASE = env.API_URL;
const CACHE_KEY = 'voice_ai_phone_numbers_cache';

export const usePhoneNumbers = () => {
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load from cache initially
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data } = JSON.parse(cached);

        // If we have data, use it immediately (even if stale, we'll revalidate)
        if (data) {
            setNumbers(data);
            setLoading(false); // Don't show loading state if we have cached data
        }
      }
    } catch (e) {
      console.warn('Failed to parse phone number cache', e);
    }
  }, []);

  const fetchNumbers = useCallback(async (force = false) => {
    try {
      if (!force && numbers.length === 0) {
          setLoading(true);
      }

      const headers = await getAuthHeader();

      const response = await fetch(`${API_BASE}/phone-numbers`, {
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNumbers(data);
        setError(null);
        
        // Update cache
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      } else {
        throw new Error('Failed to fetch numbers');
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred';
      console.error('Failed to fetch numbers', e);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [numbers.length]);

  // Fetch on mount (stale-while-revalidate)
  useEffect(() => {
    fetchNumbers();
  }, [fetchNumbers]);

  // Optimistic update helper
  const updateLocalNumber = (id: string, updates: Partial<PhoneNumber>) => {
    setNumbers(prev => {
        const newNumbers = prev.map(n => n.id === id ? { ...n, ...updates } : n);
        // Update cache immediately to reflect optimistic change
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
            data: newNumbers,
            timestamp: Date.now()
        }));
        return newNumbers;
    });
  };

  return {
    numbers,
    loading,
    error,
    refetch: () => fetchNumbers(true),
    updateLocalNumber,
    setNumbers // Expose for full updates if needed
  };
};
