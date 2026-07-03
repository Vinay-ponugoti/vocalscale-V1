import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../api/reviewApi';

// Manages the client's Google Business Profile connection: status, the OAuth
// connect redirect, on-demand account verification, and disconnect.
export const useGoogleBusiness = () => {
    const queryClient = useQueryClient();

    const statusQuery = useQuery({
        queryKey: ['google-business', 'status'],
        queryFn: () => reviewApi.getConnectionStatus(),
        staleTime: 60 * 1000,
    });

    // Redirect the browser to Google's consent screen.
    const connect = async (feature: 'reviews' | 'both' = 'reviews') => {
        const { authUrl } = await reviewApi.getConnectUrl(feature);
        if (authUrl) window.location.href = authUrl;
    };

    const verifyMutation = useMutation({
        mutationFn: () => reviewApi.verifyConnection(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['google-business'] });
        },
    });

    const disconnectMutation = useMutation({
        mutationFn: () => reviewApi.disconnect('reviews'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['google-business'] });
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
        },
    });

    const status = statusQuery.data;
    const isConnected = !!status?.connected && !!status?.reviewsEnabled;
    const isVerified = isConnected && !!status?.reviewsVerified;

    return {
        status,
        loading: statusQuery.isLoading,
        isConnected,
        isVerified,
        connect,
        verify: () => verifyMutation.mutateAsync(),
        isVerifying: verifyMutation.isPending,
        disconnect: () => disconnectMutation.mutate(),
        isDisconnecting: disconnectMutation.isPending,
    };
};
