import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { storeSession } from '../../utils/sessionUtils';
import { useQueryClient } from '@tanstack/react-query';
import { env } from '../../config/env';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase OAuth returns tokens in the hash fragment
        const hash = window.location.hash;
        if (!hash) {
          // Check if there are error parameters in the query string
          const params = new URLSearchParams(window.location.search);
          const error = params.get('error_description') || params.get('error');
          if (error) {
            throw new Error(error);
          }
          throw new Error('No authentication data received');
        }

        // Parse hash fragment
        // Remove the '#' and split by '&'
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const expiresIn = hashParams.get('expires_in');

        if (!accessToken) {
          throw new Error('Access token not found in response');
        }

        // We need the user data as well. Supabase usually doesn't include the full user object in the hash.
        // However, we can construct a minimal session and let the AuthContext/sessionUtils validate it.
        // Or better yet, we can fetch the user details using the access token.

        const session = {
          access_token: accessToken,
          refresh_token: refreshToken || '',
          expires_in: parseInt(expiresIn || '3600'),
          expires_at: Math.floor(Date.now() / 1000) + parseInt(expiresIn || '3600'),
          token_type: 'bearer',
          user: null // Will be populated by the backend validation or AuthContext
        };

        // Store session and redirect
        storeSession(session as Parameters<typeof storeSession>[0]);
        
        // Prefetch critical dashboard data immediately after OAuth login
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const authHeaders = { 
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true' 
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

        // Use window.location.href to force a full reload and let AuthContext initialize with the new session
        window.location.href = '/dashboard';
      } catch (e) {
        console.error('Google callback error:', e);
        const message = e instanceof Error ? e.message : 'Authentication failed';
        showToast(message, 'error');
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, showToast, queryClient]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#0ea5e9] mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-800">Completing your sign in...</h2>
        <p className="text-sm text-slate-500 mt-2">Please wait while we authenticate your account</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
