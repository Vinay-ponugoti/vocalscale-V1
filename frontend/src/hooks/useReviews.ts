import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../api/reviewApi';
import type { ReviewStats, AISummaryData } from '../types/review';

export const useReviews = (days: number = 30) => {
    const queryClient = useQueryClient();

    const statsQuery = useQuery<ReviewStats>({
        queryKey: ['reviews', 'stats', days],
        queryFn: () => reviewApi.getStats(days),
        staleTime: 5 * 60 * 1000,
    });

    const reviewsQuery = useQuery({
        queryKey: ['reviews', 'list', {}],
        queryFn: () => reviewApi.getReviews(),
        staleTime: 2 * 60 * 1000,
    });

    const summaryQuery = useQuery<AISummaryData>({
        queryKey: ['reviews', 'summary'],
        queryFn: () => reviewApi.getAISummary(),
        staleTime: 10 * 60 * 1000,
    });

    const regenerateSummaryMutation = useMutation({
        mutationFn: () => reviewApi.regenerateSummary(),
        onSuccess: (newData) => {
            queryClient.setQueryData(['reviews', 'summary'], newData);
        },
    });

    const syncReviewsMutation = useMutation({
        mutationFn: () => reviewApi.syncReviews(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
        },
    });

    return {
        stats: {
            data: statsQuery.data,
            loading: statsQuery.isLoading,
            error: statsQuery.error,
        },
        reviews: {
            data: reviewsQuery.data?.reviews || [],
            total: reviewsQuery.data?.total || 0,
            isPaid: reviewsQuery.data?.isPaid || false,
            loading: reviewsQuery.isLoading,
            error: reviewsQuery.error,
        },
        summary: {
            data: summaryQuery.data,
            loading: summaryQuery.isLoading,
            error: summaryQuery.error,
            regenerate: () => regenerateSummaryMutation.mutate(),
            isRegenerating: regenerateSummaryMutation.isPending,
        },
        sync: {
            trigger: () => syncReviewsMutation.mutate(),
            isSyncing: syncReviewsMutation.isPending,
            error: syncReviewsMutation.error,
        },
        refresh: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
        },
    };
};
