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
