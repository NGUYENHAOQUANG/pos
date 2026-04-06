/**
 * @file useEnvMeasurement.ts
 * @description React Query hooks for Environment Measurement API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { handleError } from '@/shared/utils/errorHandler';
import { environmentApi } from '@/features/farm/api/environmentApi';
import {
    ICreateEnvMeasurementReq,
    IUpdateEnvMeasurementReq,
    IEnvMeasurementParams,
} from '@/features/farm/types/envMeasurement.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { envMeasurementLogService } from '@/features/farm/services/work-log';
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
            // Invalidate report charts
            queryClient.invalidateQueries({ queryKey: ['report', 'env-measurement-chart'] });
            Toast.show({ type: 'success', text1: 'Đã đo thông số môi trường thành công' });
        },
        onError: handleError,
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
            // Invalidate report charts
            queryClient.invalidateQueries({ queryKey: ['report', 'env-measurement-chart'] });
            Toast.show({ type: 'success', text1: 'Đã cập nhật thành công' });
        },
        onError: handleError,
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
            // Invalidate report charts
            queryClient.invalidateQueries({ queryKey: ['report', 'env-measurement-chart'] });
            Toast.show({ type: 'success', text1: 'Tác vụ đã được xóa' });
        },
        onError: handleError,
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
        const rawItems = response?.data?.items || [];
        return envMeasurementLogService.mapRecordsToJobs(rawItems, metricTypes);
    }, [response?.data?.items, metricTypes]);

    return { jobs, isLoading, refetch };
};
