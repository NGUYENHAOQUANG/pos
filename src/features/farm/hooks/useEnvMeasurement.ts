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
import { useEnvironmentInit } from '@/features/farm/hooks/pondwork/envhooks/useEnvironmentLogic';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import { toCreateAtFromISO, toCreateAtToISO } from '@/features/farm/utils/dateUtils';

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
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
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
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
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
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
        },
    });
};

// Hook to fetch environment measurements and map them to JobExecution format
export const useEnvMeasurementsAsJobs = (pondId: string, params?: IEnvMeasurementParams) => {
    // Build query params — API requires date range to return data
    const queryParams = useMemo(() => {
        if (params?.CreateAtFrom && params?.CreateAtTo) {
            return {
                ...params,
                PageSize: params.PageSize ?? 100,
            };
        }
        // Default: start of current month → today
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
            ...params,
            CreateAtFrom: toCreateAtFromISO(startOfMonth),
            CreateAtTo: toCreateAtToISO(now),
            PageSize: params?.PageSize ?? 100,
        };
    }, [params]);

    // 2. Fetch data
    const { data: response, isLoading, refetch } = useEnvMeasurements(pondId, queryParams);

    const { metricTypes } = useEnvironmentInit();

    const jobs: JobExecution[] = useMemo(() => {
        if (!response?.data?.items) return [];

        const rawItems = response.data.items || [];

        // Group by date
        const grouped = new Map<string, any[]>();
        rawItems.forEach((item: any) => {
            const d = item.createdAt ? new Date(item.createdAt) : new Date();
            const dateKey = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
            if (!grouped.has(dateKey)) grouped.set(dateKey, []);
            grouped.get(dateKey)!.push(item);
        });

        // Sort each day ASC to assign sequential numbering
        grouped.forEach(items => {
            items.sort(
                (a: any, b: any) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
        });

        const allJobs: JobExecution[] = [];

        grouped.forEach(dayItems => {
            dayItems.forEach((item: any, index: number) => {
                const dateObj = new Date(item.createdAt);
                const timeStr = dateObj.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                });
                const entryNumber = index + 1;

                // Construct meta with all metrics
                const meta: EnvironmentMeta = {};
                const details = item.envMeasurementDetail?.envMeasurementDetails || [];
                if (details.length > 0 && metricTypes.length > 0) {
                    details.forEach((m: any) => {
                        const metric = metricTypes.find(mt => mt.id === m.metricId);
                        if (!metric) return;

                        switch (metric.code) {
                            case ENVIRONMENT_METRIC_IDS.PH:
                                meta.pH = m.value.toString();
                                meta.pHWarning = m.isAlerted;
                                break;
                            case ENVIRONMENT_METRIC_IDS.DO:
                                meta.do = m.value.toString();
                                meta.doWarning = m.isAlerted;
                                break;
                            case ENVIRONMENT_METRIC_IDS.TEMPERATURE:
                                meta.temperature = m.value.toString();
                                meta.temperatureWarning = m.isAlerted;
                                break;
                            case ENVIRONMENT_METRIC_IDS.SALINITY:
                                meta.salinity = m.value.toString();
                                meta.salinityWarning = m.isAlerted;
                                break;
                            case ENVIRONMENT_METRIC_IDS.ALKALINITY:
                                meta.alkalinity = m.value.toString();
                                meta.alkalinityWarning = m.isAlerted;
                                break;
                            case ENVIRONMENT_METRIC_IDS.TRANSPARENCY:
                                meta.transparency = m.value.toString();
                                meta.transparencyWarning = m.isAlerted;
                                break;
                            case ENVIRONMENT_METRIC_IDS.KALI:
                                meta.kali = m.value.toString();
                                meta.kaliWarning = m.isAlerted;
                                break;
                            case ENVIRONMENT_METRIC_IDS.TAN:
                                meta.tan = m.value.toString();
                                meta.tanWarning = m.isAlerted;
                                break;
                            case ENVIRONMENT_METRIC_IDS.MAGIE:
                                meta.magie = m.value.toString();
                                meta.magieWarning = m.isAlerted;
                                break;
                            case ENVIRONMENT_METRIC_IDS.NO3:
                                meta.no3 = m.value.toString();
                                meta.no3Warning = m.isAlerted;
                                break;
                        }
                    });
                }

                allJobs.push({
                    id: item.id,
                    label: `Lần ${entryNumber}`,
                    time: timeStr,
                    date: item.createdAt,
                    pondId: item.pondId,
                    note: item.envMeasurementDetail?.notes,
                    meta,
                });
            });
        });

        // Sort all jobs DESC (newest first)
        allJobs.sort((a, b) => {
            const timeA = new Date(a.date || '').getTime();
            const timeB = new Date(b.date || '').getTime();
            return timeB - timeA;
        });

        return allJobs;
    }, [response, metricTypes]);

    return { jobs, isLoading, refetch };
};
