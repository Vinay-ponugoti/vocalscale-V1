import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../api/reviewApi';
import type { Review, ReviewStats, AISummaryData } from '../types/review';

export const useReviews = (days: number = 7) => {
    const queryClient = useQueryClient();

    // Fetch stats
    const statsQuery = useQuery<ReviewStats>({
        queryKey: ['reviews', 'stats', days],
        queryFn: () => reviewApi.getStats(days),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch reviews list
    const reviewsQuery = useQuery<{ reviews: Review[]; total: number }>({
        queryKey: ['reviews', 'list', {}],
        queryFn: () => reviewApi.getReviews(),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    // Fetch AI Summary
    const summaryQuery = useQuery<AISummaryData>({
        queryKey: ['reviews', 'summary'],
        queryFn: () => reviewApi.getAISummary(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Mutation to regenerate summary
    const regenerateSummaryMutation = useMutation({
        mutationFn: () => reviewApi.regenerateSummary(),
        onSuccess: (newData) => {
            queryClient.setQueryData(['reviews', 'summary'], newData);
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
        refresh: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
        },
    };
};
