import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { farmKeys } from './farmKeys';
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
    // Sắp xếp theo createdAt tăng dần giống logic useSizeMeasurementsAsJobs
    const sortedChecks = [...shrimpHealthChecks].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
    });

    // Đếm số lượt theo từng ngày: Lần 1, Lần 2, ... / mỗi ngày
    const dayCounts: Record<string, number> = {};

    return Promise.all(
        sortedChecks.map(async check => {
            let imageUrls: string[] = [];
            if (check.documentIds && check.documentIds.length > 0) {
                imageUrls = await documentApi.getUrls(check.documentIds);
            } else if (check.documents && check.documents.length > 0) {
                imageUrls = check.documents
                    .map(doc => doc.publicUrl)
                    .filter((url): url is string => !!url);
            }

            // Map API response to UI state (including resolved image URLs)
            const uiState = mapFromApiResponse({
                value: check.value,
                healthCheck: check.healthCheck,
                images: imageUrls,
            });

            // Chuẩn hóa createdAt, fallback về "now" nếu không có
            const createdDate = check.createdAt ? new Date(check.createdAt) : new Date();

            // Dùng format dd/MM/yyyy cho UI & time HH:mm
            const dateStr = formatDate(createdDate);
            const timeStr = createdDate.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
            });

            // Per-day index: Lần 1 (cũ) -> Lần N (mới nhất) giống useSizeMeasurementsAsJobs
            const dateKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}-${createdDate.getDate()}`;
            if (!dayCounts[dateKey]) {
                dayCounts[dateKey] = 0;
            }
            dayCounts[dateKey]++;
            const dailyIndex = dayCounts[dateKey];

            return {
                id: check.id,
                label: `Lần ${dailyIndex}`,
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
 * Hook to fetch shrimp health checks as JobExecution list (for cards)
 */
export const useShrimpHealthChecksAsJobs = (pondId: string) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: farmKeys.shrimpHealthChecks.byPond(pondId),
        queryFn: async () => {
            if (!pondId) {
                throw new Error('No pondId provided');
            }
            return await shrimpHealthCheckApi.list(pondId);
        },
        enabled: !!pondId,
        staleTime: 30000,
        gcTime: 5 * 60 * 1000,
    });

    const [jobs, setJobs] = useState<JobExecution[]>([]);

    useEffect(() => {
        const run = async () => {
            try {
                const rawItems = data?.data?.items || [];
                if (!pondId || rawItems.length === 0) {
                    setJobs([]);
                    return;
                }

                const jobExecutions = await convertToJobExecutions(rawItems, pondId);
                setJobs(jobExecutions);
            } catch {
                setJobs([]);
            }
        };

        run();
    }, [data, pondId]);

    return { jobs, isLoading, error, refetch };
};

/**
 * React Query hook to fetch and sync shrimp health check data from API to local store
 */
export const useShrimpHealthCheckData = (pondId: string | undefined) => {
    const updatePondJob = useFarmStore(state => state.updatePondJob);
    const queryClient = useQueryClient();

    const pondIdStr = pondId ? String(pondId) : '';

    // React Query for data fetching
    const {
        data: response,
        isLoading,
        error,
        refetch,
        isSuccess,
    } = useQuery({
        queryKey: farmKeys.shrimpHealthChecks.byPond(pondIdStr),
        queryFn: async () => {
            if (!pondIdStr) {
                throw new Error('No pondId provided');
            }

            return await shrimpHealthCheckApi.list(pondIdStr);
        },
        enabled: !!pondIdStr,
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
            pondIdStr
                ? queryClient.invalidateQueries({
                      queryKey: farmKeys.shrimpHealthChecks.byPond(pondIdStr),
                  })
                : undefined,
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
                queryKey: farmKeys.shrimpHealthChecks.byPond(variables.pondId),
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
                queryKey: farmKeys.shrimpHealthChecks.byPond(variables.pondId),
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
                queryKey: farmKeys.shrimpHealthChecks.byPond(variables.pondId),
            });
        },
        onError: () => {},
    });
};
