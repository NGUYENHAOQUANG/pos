import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { farmKeys } from './farmKeys';
import { shrimpHealthCheckApi } from '@/features/farm/api/shrimpHealthCheckApi';
import type {
    ShrimpHealthCheckDto,
    CreateShrimpHealthCheckPayload,
    UpdateShrimpHealthCheckPayload,
    IShrimpHealthListParams,
} from '@/features/farm/types/shrimpHealthCheck.types';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { JobExecution } from '@/features/farm/types/farm.types';
import { mapFromApiResponse } from '@/features/farm/utils/shrimpHealthCheckMapper';
import { formatDate, parseDate } from '@/features/farm/utils/dateUtils';
import { handleError } from '@/shared/utils/errorHandler';

const convertToJobExecutions = async (
    shrimpHealthChecks: ShrimpHealthCheckDto[],
    pondId: string
): Promise<JobExecution[]> => {
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

    const sortedChecks = parsedChecks.sort((a, b) => {
        const timeDiff = b.timestamp - a.timestamp;
        if (timeDiff !== 0) return timeDiff;
        return (b.id || '').localeCompare(a.id || '');
    });

    const totalPerDay: Record<string, number> = {};
    sortedChecks.forEach(check => {
        totalPerDay[check.dateKey] = (totalPerDay[check.dateKey] || 0) + 1;
    });

    const dayCounts: Record<string, number> = {};

    return Promise.all(
        sortedChecks.map(async check => {
            let imageUrls: string[] = [];
            if (check.documents && check.documents.length > 0) {
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

            // Format dd/MM/yyyy for UI & time HH:mm
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
                    documentIds: check.documents?.map(doc => doc.id) || [],
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
export const useShrimpHealthChecksAsJobs = (pondId: string, params?: IShrimpHealthListParams) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [...farmKeys.shrimpHealthChecks.byPond(pondId), params],
        queryFn: async () => {
            if (!pondId) {
                throw new Error('No pondId provided');
            }
            return await shrimpHealthCheckApi.list(pondId, params);
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
                // Card: slice(0, 3) = 3 newest, display old->new. Sort ascending.
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
                const sortedDesc = [...jobExecutions].sort(
                    (a, b) => getItemTime(b) - getItemTime(a)
                );
                setJobs(sortedDesc);
            } catch {
                setJobs([]);
            }
        };

        run();
    }, [data, pondId]);

    return { jobs, isLoading, error, refetch };
};

export const useShrimpHealthCheckData = (pondId: string) => {
    const updatePondJob = useFarmStore(state => state.updatePondJob);
    const queryClient = useQueryClient();

    const {
        data: response,
        isLoading,
        error,
        refetch,
        isSuccess,
    } = useQuery({
        queryKey: farmKeys.shrimpHealthChecks.byPond(pondId),
        queryFn: async () => {
            return await shrimpHealthCheckApi.list(pondId);
        },
        enabled: !!pondId,
        staleTime: 30000,
        gcTime: 5 * 60 * 1000,
    });

    useEffect(() => {
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
            queryClient.invalidateQueries({
                queryKey: farmKeys.shrimpHealthChecks.byPond(pondId),
            }),
    };
};

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
            queryClient.invalidateQueries({
                queryKey: farmKeys.shrimpHealthChecks.byPond(variables.pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
        },
        onError: handleError,
    });
};

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
            queryClient.invalidateQueries({
                queryKey: farmKeys.shrimpHealthChecks.byPond(variables.pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
        },
        onError: handleError,
    });
};

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
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
        },
        onError: handleError,
    });
};

export const useShrimpHealthCheckDetail = (pondId: string, id: string) => {
    return useQuery({
        queryKey: farmKeys.shrimpHealthChecks.detail(id),
        queryFn: async () => {
            if (!pondId || !id) {
                throw new Error('Missing pondId or id');
            }
            return await shrimpHealthCheckApi.getDetail(pondId, id);
        },
        enabled: !!pondId && !!id,
        staleTime: 30000,
    });
};
