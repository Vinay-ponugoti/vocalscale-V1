import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import { env } from '../../config/env';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/ui/PageLoader';
import { fetchUserProfile } from '../../utils/sessionUtils';
import { getDevelopmentHeaders } from '../../lib/devHeaders';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { setAuthSession } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Google Callback URL:', window.location.href);

        let accessToken: string | null = null;
        let refreshToken: string | null = null;
        let expiresIn: string | null = null;

        // 1. Try Hash (Supabase default)
        const hash = window.location.hash;
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1));
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token');
          expiresIn = hashParams.get('expires_in');
        }

        // 2. Try Query Params (Fallback)
        if (!accessToken) {
          const searchParams = new URLSearchParams(window.location.search);
          accessToken = searchParams.get('access_token');
          refreshToken = searchParams.get('refresh_token');
          expiresIn = searchParams.get('expires_in');

          // Check for errors
          const error = searchParams.get('error_description') || searchParams.get('error');
          if (error) {
            throw new Error(error);
          }
        }

        if (!accessToken) {
          throw new Error('Access token not found in response (checked both Hash and Query params)');
        }

        // Fetch user profile immediately
        const user = await fetchUserProfile(accessToken);

        // If profile fetch failed, we cannot proceed without a valid user ID
        if (!user || !user.id) {
          console.error('[GoogleCallback] Failed to get valid user profile from backend');
          throw new Error('Unable to retrieve user profile. Please try again.');
        }

        const session = {
          access_token: accessToken,
          refresh_token: refreshToken || '',
          expires_in: parseInt(expiresIn || '3600'),
          expires_at: Math.floor(Date.now() / 1000) + parseInt(expiresIn || '3600'),
          token_type: 'bearer',
          user: user
        };

        // Update auth context immediately so we don't see loading screens on the next page
        setAuthSession(session);

        // --- Sync with Backend ---
        // Send the refresh token to our backend so we can access Google Business API later
        try {
          await fetch(`${env.API_URL}/auth/google-sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
              ...getDevelopmentHeaders()
            },
            body: JSON.stringify({
              access_token: accessToken,
              refresh_token: refreshToken,
              expires_in: parseInt(expiresIn || '3600'),
              full_name: user?.full_name || '',
              avatar_url: user?.avatar_url || ''
            })
          });
          console.log('Google tokens synced with backend');
        } catch (syncError) {
          console.error('Failed to sync Google tokens with backend:', syncError);
          // We don't block the user if sync fails, but we should log it
        }

        // Prefetch critical dashboard data immediately after OAuth login
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const authHeaders = {
          'Authorization': `Bearer ${accessToken}`,
          ...getDevelopmentHeaders()
        };

        const prefetchOptions = { staleTime: 1000 * 60 * 5 };

        // 1. Dashboard Stats
        queryClient.prefetchQuery({
          queryKey: ['dashboard', dateStr, 7],
          queryFn: async () => {
            const response = await fetch(`${env.API_URL}/dashboard/stats?date=${now.toISOString()}&days=7`, {
              headers: authHeaders
            });
            return response.json();
          },
          ...prefetchOptions
        });

        // 2. Business Profile
        queryClient.prefetchQuery({
          queryKey: ['business-profile'],
          queryFn: async () => {
            const response = await fetch(`${env.API_URL}/business/profile`, {
              headers: authHeaders
            });
            return response.json();
          },
          ...prefetchOptions
        });

        // Use navigate instead of window.location.href for a smoother transition
        navigate('/dashboard', { replace: true });
      } catch (e) {
        console.error('Google callback error:', e);
        const message = e instanceof Error ? e.message : 'Authentication failed';
        showToast(message, 'error');
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, showToast, queryClient, setAuthSession]);

  return <PageLoader />;
};

export default GoogleCallback;
