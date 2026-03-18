import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { environmentSettingApi } from '@/features/farm/api/enviromentSettingApi';
import { handleError } from '@/shared/utils/errorHandler';
import {
    CreateEnvironmentSettingRequest,
    UpdateEnvironmentSettingRequest,
} from '@/features/farm/types/environmentSettings.types';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import { envMeasurementKeys } from '@/features/farm/hooks/useEnvMeasurement';
import { useEnvironmentSettingStore } from '@/features/farm/store/environmentSettingStore';

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
            queryClient.invalidateQueries({
                queryKey: envMeasurementKeys.lists(),
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
            queryClient.invalidateQueries({
                queryKey: envMeasurementKeys.lists(),
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

export const useSaveEnvironmentSettings = (zoneId: string) => {
    const createSetting = useCreateEnvironmentSetting();
    const updateSetting = useUpdateEnvironmentSetting();
    const pendingChanges = useEnvironmentSettingStore(state => state.pendingChanges);
    const clearChanges = useEnvironmentSettingStore(state => state.clearChanges);

    const [isSaving, setIsSaving] = useState(false);

    const save = useCallback(async () => {
        const changes = Object.values(pendingChanges);
        if (changes.length === 0) return true;

        setIsSaving(true);

        try {
            const promises: Promise<unknown>[] = [];

            for (const change of changes) {
                if (change.type === 'update' && change.settingId) {
                    promises.push(
                        updateSetting.mutateAsync({
                            zoneId,
                            id: change.settingId,
                            data: change.data as UpdateEnvironmentSettingRequest,
                        })
                    );
                } else if (change.type === 'create') {
                    promises.push(
                        createSetting.mutateAsync({
                            zoneId,
                            data: change.data as CreateEnvironmentSettingRequest,
                        })
                    );
                }
            }

            await Promise.all(promises);
            Toast.show({ type: 'success', text1: 'Đã lưu thiết lập thành công' });
            clearChanges();
            return true;
        } catch (error) {
            handleError(error);
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [pendingChanges, zoneId, updateSetting, createSetting, clearChanges]);

    return { save, isSaving };
};
