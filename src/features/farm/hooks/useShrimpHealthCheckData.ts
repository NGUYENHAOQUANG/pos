import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { shrimpHealthCheckApi } from '@/features/farm/api/shrimpHealthCheckApi';
import type {
    ShrimpHealthCheckDto,
    CreateShrimpHealthCheckPayload,
    UpdateShrimpHealthCheckPayload,
} from '@/features/farm/types/shrimpHealthCheck.types';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { JobExecution } from '@/features/farm/types/farm.types';
import { mapFromApiResponse } from '@/features/farm/utils/shrimpHealthCheckMapper';
import { formatDate } from '@/features/farm/utils/dateUtils';
import { documentApi } from '@/features/material/api/documentApi';

/**
 * Convert API response to JobExecution format
 */
const convertToJobExecutions = async (
    shrimpHealthChecks: ShrimpHealthCheckDto[],
    pondId: string
): Promise<JobExecution[]> => {
    // Resolve image URLs for each shrimp health check (from documents or documentIds)
    return Promise.all(
        shrimpHealthChecks.map(async (check, index) => {
            let imageUrls: string[] = [];

            // Prefer documents with publicUrl if available
            if (check.documents && check.documents.length > 0) {
                imageUrls = check.documents
                    .map(doc => doc.publicUrl)
                    .filter((url): url is string => !!url);
            } else if (check.documentIds && check.documentIds.length > 0) {
                // Fallback: resolve URLs from documentIds via documentApi.getUrl
                const urls = await Promise.all(
                    check.documentIds.map(async id => {
                        try {
                            const url = await documentApi.getUrl(id);
                            return url || '';
                        } catch {
                            return '';
                        }
                    })
                );
                imageUrls = urls.filter((url): url is string => !!url);
            }

            // Map API response to UI state (including resolved image URLs)
            const uiState = mapFromApiResponse({
                value: check.value,
                healthCheck: check.healthCheck,
                images: imageUrls,
            });

            // Parse date and time from createdAt
            const createdDate = new Date(check.createdAt);
            const dateStr = formatDate(createdDate);
            const timeStr = createdDate.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
            });

            return {
                id: check.id,
                label: `Lần ${check.no || index + 1}`,
                time: timeStr,
                date: dateStr,
                note: uiState.notes,
                pondId: pondId,
                meta: {
                    foodAmount: uiState.foodAmount,
                    leftoverFood: uiState.leftoverFood,
                    intestine: uiState.intestine,
                    intestineColor: uiState.intestineColor,
                    stoolColor: uiState.stoolColor,
                    liver: uiState.liver,
                    images: uiState.images,
                    documentIds: check.documentIds || [],
                },
            };
        })
    );
};

/**
 * React Query hook to fetch and sync shrimp health check data from API to local store
 */
export const useShrimpHealthCheckData = (pondId: string | undefined) => {
    const updatePondJob = useFarmStore(state => state.updatePondJob);
    const queryClient = useQueryClient();

    // React Query for data fetching
    const {
        data: response,
        isLoading,
        error,
        refetch,
        isSuccess,
    } = useQuery({
        queryKey: ['shrimpHealthChecks', pondId],
        queryFn: async () => {
            if (!pondId) {
                throw new Error('No pondId provided');
            }

            return await shrimpHealthCheckApi.list(pondId);
        },
        enabled: !!pondId,
        staleTime: 30000,
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (formerly cacheTime)
    });

    // Sync data to Zustand store when query succeeds
    useEffect(() => {
        // Chuẩn hoá cờ success từ API (success hoặc isSuccess)
        const apiSuccess = ((response as any)?.success ?? (response as any)?.isSuccess) === true;

        if (isSuccess && apiSuccess && response?.data && pondId) {
            const shrimpHealthChecks = response.data.items || [];
            (async () => {
                const jobExecutions = await convertToJobExecutions(shrimpHealthChecks, pondId);
                updatePondJob(pondId, 'SHRIMP_INSPECTION', jobExecutions);
            })();
        }
    }, [isSuccess, response, pondId, updatePondJob]);

    return {
        data: response?.data,
        isLoading,
        error: error as Error | null,
        refetch,
        invalidate: () =>
            queryClient.invalidateQueries({ queryKey: ['shrimpHealthChecks', pondId] }),
    };
};

/**
 * Hook for creating a new shrimp health check
 */
export const useCreateShrimpHealthCheck = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            pondId,
            payload,
        }: {
            pondId: string;
            payload: CreateShrimpHealthCheckPayload;
        }) => {
            return await shrimpHealthCheckApi.create(pondId, payload);
        },
        onSuccess: (_data, variables) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({
                queryKey: ['shrimpHealthChecks', variables.pondId],
            });
        },
        onError: () => {},
    });
};

/**
 * Hook for updating an existing shrimp health check
 */
export const useUpdateShrimpHealthCheck = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            pondId,
            id,
            payload,
        }: {
            pondId: string;
            id: string;
            payload: UpdateShrimpHealthCheckPayload;
        }) => {
            return await shrimpHealthCheckApi.update(pondId, id, payload);
        },
        onSuccess: (_data, variables) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({
                queryKey: ['shrimpHealthChecks', variables.pondId],
            });
        },
        onError: () => {},
    });
};

/**
 * Hook for deleting a shrimp health check
 */
export const useDeleteShrimpHealthCheck = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ pondId, id }: { pondId: string; id: string }) => {
            return await shrimpHealthCheckApi.delete(pondId, id);
        },
        onSuccess: (_data, variables) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({
                queryKey: ['shrimpHealthChecks', variables.pondId],
            });
        },
        onError: () => {},
    });
};
