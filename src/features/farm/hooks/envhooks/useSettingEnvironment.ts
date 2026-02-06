import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { environmentApi } from '@/features/farm/api/environmentApi';
import { environmentSettingApi } from '@/features/farm/api/enviromentSettingApi';
import { handleError } from '@/shared/utils/errorHandler';
import {
    CreateEnvironmentSettingRequest,
    UpdateEnvironmentSettingRequest,
} from '@/features/farm/types/environmentSettings.types';
import { farmKeys } from '../farmKeys';

export const useEnvironmentMetricTypes = () => {
    return useQuery({
        queryKey: farmKeys.environment.metricTypes(),
        queryFn: environmentApi.getEnvMetricTypes,
        staleTime: 1000 * 60 * 60,
    });
};

export const useEnvironmentSettings = (zoneId: string) => {
    return useQuery({
        queryKey: farmKeys.environment.settings(zoneId),
        queryFn: () => environmentSettingApi.getSettings(zoneId),
        enabled: !!zoneId,
    });
};

export const useCreateEnvironmentSetting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ zoneId, data }: { zoneId: string; data: CreateEnvironmentSettingRequest }) =>
            environmentSettingApi.create(zoneId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.environment.settings(variables.zoneId),
            });
        },
        onError: handleError,
    });
};

export const useUpdateEnvironmentSetting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            zoneId,
            id,
            data,
        }: {
            zoneId: string;
            id: string;
            data: UpdateEnvironmentSettingRequest;
        }) => environmentSettingApi.update(zoneId, id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.environment.settings(variables.zoneId),
            });
        },
        onError: handleError,
    });
};

export const useDeleteEnvironmentSetting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ zoneId, id }: { zoneId: string; id: string }) =>
            environmentSettingApi.delete(zoneId, id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.environment.settings(variables.zoneId),
            });
        },
        onError: handleError,
    });
};
