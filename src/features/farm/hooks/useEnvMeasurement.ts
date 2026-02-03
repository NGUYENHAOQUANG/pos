/**
 * @file useEnvMeasurement.ts
 * @description React Query hooks for Environment Measurement API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { environmentApi } from '@/features/farm/api/environmentApi';
import {
    ICreateEnvMeasurementReq,
    IUpdateEnvMeasurementReq,
    IEnvMeasurementParams,
} from '@/features/farm/types/envMeasurement.types';
import {
    JobExecution,
    ENVIRONMENT_METRIC_IDS,
    EnvironmentMeta,
} from '@/features/farm/types/farm.types';
import { useMemo } from 'react';
import { useEnvironmentInit } from '@/features/farm/hooks/envhooks/useEnvironmentLogic';

// Query keys
export const envMeasurementKeys = {
    all: ['envMeasurements'] as const,
    lists: () => [...envMeasurementKeys.all, 'list'] as const,
    list: (pondId: string, params?: IEnvMeasurementParams) =>
        [...envMeasurementKeys.lists(), pondId, params] as const,
    details: () => [...envMeasurementKeys.all, 'detail'] as const,
    detail: (pondId: string, id: string) => [...envMeasurementKeys.details(), pondId, id] as const,
};

// Hooks
export const useEnvMeasurements = (pondId: string, params?: IEnvMeasurementParams) => {
    return useQuery({
        queryKey: envMeasurementKeys.list(pondId, params),
        queryFn: () => environmentApi.getEnvMeasurements(pondId, params),
        enabled: !!pondId,
    });
};

export const useEnvMeasurement = (pondId: string, id: string) => {
    return useQuery({
        queryKey: envMeasurementKeys.detail(pondId, id),
        queryFn: () => environmentApi.getEnvMeasurementDetail(pondId, id),
        enabled: !!pondId && !!id,
    });
};

export const useCreateEnvMeasurement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ pondId, data }: { pondId: string; data: ICreateEnvMeasurementReq }) =>
            environmentApi.createEnvMeasurement(pondId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: envMeasurementKeys.lists(),
            });
        },
    });
};

export const useUpdateEnvMeasurement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            pondId,
            id,
            data,
        }: {
            pondId: string;
            id: string;
            data: IUpdateEnvMeasurementReq;
        }) => environmentApi.updateEnvMeasurement(pondId, id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: envMeasurementKeys.detail(variables.pondId, variables.id),
            });
            queryClient.invalidateQueries({
                queryKey: envMeasurementKeys.lists(),
            });
        },
    });
};

export const useDeleteEnvMeasurement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ pondId, id }: { pondId: string; id: string }) =>
            environmentApi.deleteEnvMeasurement(pondId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: envMeasurementKeys.lists(),
            });
        },
    });
};

// Hook to fetch environment measurements and map them to JobExecution format
export const useEnvMeasurementsAsJobs = (pondId: string, date?: Date) => {
    // 1. Prepare date params
    const params = useMemo(() => {
        if (!date) return undefined;
        // Start of day
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        // End of day
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        return {
            CreateAtFrom: start.toISOString(),
            CreateAtTo: end.toISOString(),
            PageSize: 100, // Ensure we get all for the day
        };
    }, [date]);

    // 2. Fetch data
    const { data: response, isLoading, refetch } = useEnvMeasurements(pondId, params);

    const { metricTypes } = useEnvironmentInit();

    const jobs: JobExecution[] = useMemo(() => {
        if (!response?.data?.items) return [];

        const rawItems = response.data.items || [];

        // Sort by createdAt ascending to ensure correct daily numbering
        const sortedItems = [...rawItems].sort((a: any, b: any) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeA - timeB;
        });

        const dayCounts: Record<string, number> = {};

        return sortedItems.map((item: any) => {
            const dateObj = new Date(item.createdAt);
            const dateKey = dateObj.toLocaleDateString('en-CA');
            const timeStr = dateObj.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
            });

            if (!dayCounts[dateKey]) {
                dayCounts[dateKey] = 0;
            }
            dayCounts[dateKey]++;
            const dailyIndex = dayCounts[dateKey];

            // Construct meta for warnings
            const meta: EnvironmentMeta = {};
            if (item.envMeasurementDetails && metricTypes.length > 0) {
                item.envMeasurementDetails.forEach((m: any) => {
                    const metric = metricTypes.find(mt => mt.id === m.metricId);
                    if (metric) {
                        // Map code to warning field
                        switch (metric.code) {
                            case ENVIRONMENT_METRIC_IDS.PH:
                                meta.pH = m.value.toString();
                                meta.pHWarning = m.isAlerted;
                                break;
                            case ENVIRONMENT_METRIC_IDS.DO:
                                meta.do = m.value.toString();
                                meta.doWarning = m.isAlerted;
                                break;
                            // ... Add others if needed for strict type compliance
                            case ENVIRONMENT_METRIC_IDS.TEMPERATURE:
                                meta.temperature = m.value.toString();
                                meta.temperatureWarning = m.isAlerted;
                                break;
                            // etc.
                        }
                    }
                });
            }

            return {
                id: item.id,
                label: `Lần ${dailyIndex}`,
                time: timeStr,
                date: item.createdAt,
                pondId: item.pondId,
                meta,
            };
        });
    }, [response, metricTypes]);

    return { jobs, isLoading, refetch };
};
