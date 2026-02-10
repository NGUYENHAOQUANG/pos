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
import { formatDate, parseDate } from '@/features/farm/utils/dateUtils';
import { documentApi } from '@/features/material/api/documentApi';

/**
 * Convert API response to JobExecution format
 */
const convertToJobExecutions = async (
    shrimpHealthChecks: ShrimpHealthCheckDto[],
    pondId: string
): Promise<JobExecution[]> => {
    // 1. Parse dates and prepare for sorting/grouping
    const parsedChecks = shrimpHealthChecks.map(check => {
        const createdDate = check.createdAt ? new Date(check.createdAt) : new Date();
        const timestamp = createdDate.getTime();
        const dateKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}-${createdDate.getDate()}`;
        return {
            ...check,
            parsedDate: createdDate,
            timestamp,
            dateKey,
        };
    });

    // 2. Sort DESC (Newest first). Tie-break with ID DESC if times are equal.
    // This ensures "created last" comes first in the list.
    const sortedChecks = parsedChecks.sort((a, b) => {
        const timeDiff = b.timestamp - a.timestamp;
        if (timeDiff !== 0) return timeDiff;
        // If times are equal, assume higher ID is newer (lexicographical sort for strings usually works for KSUID/UUIDv7,
        // if random UUID it's arbitrary but stable. If numeric string ID, might need parseInt)
        return (b.id || '').localeCompare(a.id || '');
    });

    // 3. Count total per day
    const totalPerDay: Record<string, number> = {};
    sortedChecks.forEach(check => {
        totalPerDay[check.dateKey] = (totalPerDay[check.dateKey] || 0) + 1;
    });

    // 4. Map to JobExecution with "Lần N" label
    // Since list is sorted DESC (Newest -> Oldest), the first item for a day is the "Last" one (highest index).
    // Formula: Index = Total - CountSoFar + 1.
    // Example: Total=3.
    // 1st Item (Newest): Count=1. Index = 3 - 1 + 1 = 3 (Lần 3).
    // 2nd Item: Count=2. Index = 3 - 2 + 1 = 2 (Lần 2).
    // 3rd Item (Oldest): Count=3. Index = 3 - 3 + 1 = 1 (Lần 1).
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

            // Map API response to UI state
            const uiState = mapFromApiResponse({
                value: check.value,
                healthCheck: check.healthCheck,
                images: imageUrls,
            });

            // Use the already parsed date
            const createdDate = check.parsedDate;

            // Dùng format dd/MM/yyyy cho UI & time HH:mm
            const dateStr = formatDate(createdDate);
            const timeStr = createdDate.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
            });

            // Calculate "Lần N"
            const dateKey = check.dateKey;
            if (!dayCounts[dateKey]) dayCounts[dateKey] = 0;
            dayCounts[dateKey]++;
            const total = totalPerDay[dateKey] ?? dayCounts[dateKey];
            const dailyIndex = total - dayCounts[dateKey] + 1;

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
                    // AI Health Check fields
                    averageInfectionRate: uiState.averageInfectionRate,
                    isHealthy: uiState.isHealthy,
                    diagnosisDetails: uiState.diagnosisDetails,
                    aiItems: uiState.aiItems,
                },
                createdAt: check.createdAt, // Preserve originalcreatedAt string for other uses if needed
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

                let jobExecutions = await convertToJobExecutions(rawItems, pondId);
                // Card: slice(-3) = 3 mới nhất, hiển thị cũ→mới (mới nhất ở cuối). Sắp xếp tăng dần.
                const getItemTime = (x: JobExecution) => {
                    if (x.createdAt) return new Date(x.createdAt).getTime();
                    try {
                        const dateStr = x.date || '';
                        const timeStr = x.time || '00:00';
                        const combined = dateStr.includes(' ')
                            ? dateStr
                            : `${dateStr} ${timeStr}`.trim();
                        if (!combined) return 0;
                        return parseDate(combined).getTime();
                    } catch {
                        return 0;
                    }
                };
                const sortedAsc = [...jobExecutions].sort(
                    (a, b) => getItemTime(a) - getItemTime(b)
                );
                setJobs(sortedAsc);
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
