import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { seasonApi } from '@/features/menu/api/seasonApi';
import { SeasonStatus } from '@/features/farm/types/farm.types';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import { AquacultureFormValues } from '@/features/menu/schemas/aquacultureFormSchema';
import { aquacultureService, SeasonPayload } from '@/features/menu/services/aquacultureService';
import { NormalizedError } from '@/core/api/errorHandler';

// ================================================================
// Shared error handler for aquaculture mutations
// ================================================================
const handleMutationError = (err: unknown) => {
    const error = err as NormalizedError;

    if (error.type === 'VALIDATION_ERROR') {
        const firstFieldKey = Object.keys(error.fields)[0];
        if (firstFieldKey && error.fields[firstFieldKey]?.length > 0) {
            Toast.show({
                type: 'error',
                text1: error.fields[firstFieldKey][0],
                visibilityTime: 4000,
            });
            return;
        }
    }

    if (error.type === 'NOT_FOUND_ERROR') {
        Toast.show({
            type: 'error',
            text1: error.message,
            visibilityTime: 4000,
        });
        return;
    }

    Toast.show({
        type: 'error',
        text1: error.message || 'Có lỗi xảy ra',
    });
};

// ================================================================
// Create Season Mutation
// ================================================================
interface CreateSeasonParams {
    zoneId: string;
    formData: AquacultureFormValues;
}

export const useCreateSeason = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ zoneId, formData }: CreateSeasonParams) => {
            const payload: SeasonPayload = aquacultureService.mapFormToPayload(formData);
            return seasonApi.createSeason(zoneId, payload);
        },
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'Tạo vụ nuôi thành công',
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.seasons() });
        },
        onError: handleMutationError,
    });
};

// ================================================================
// Update Season Mutation
// ================================================================
interface UpdateSeasonParams {
    zoneId: string;
    seasonId: string;
    formData: AquacultureFormValues;
}

export const useUpdateSeason = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ zoneId, seasonId, formData }: UpdateSeasonParams) => {
            const payload: SeasonPayload = aquacultureService.mapFormToPayload(formData);
            return seasonApi.updateSeason(zoneId, seasonId, payload);
        },
        onSuccess: (_data, variables) => {
            Toast.show({
                type: 'success',
                text1: 'Cập nhật vụ nuôi thành công',
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.seasons() });
            queryClient.invalidateQueries({
                queryKey: farmKeys.detail(variables.zoneId, variables.seasonId),
            });
        },
        onError: handleMutationError,
    });
};

// ================================================================
// Delete Season Mutation
// ================================================================
interface DeleteSeasonParams {
    zoneId: string;
    seasonId: string;
}

export const useDeleteSeason = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ zoneId, seasonId }: DeleteSeasonParams) => {
            return seasonApi.deleteSeason(zoneId, seasonId);
        },
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'Đã xóa vụ nuôi thành công',
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.seasons() });
        },
        onError: handleMutationError,
    });
};

// ================================================================
// Close (Update Status) Season Mutation
// ================================================================
interface CloseSeasonParams {
    zoneId: string;
    seasonId: string;
}

export const useCloseSeason = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ zoneId, seasonId }: CloseSeasonParams) => {
            return seasonApi.updateSeasonStatus(zoneId, seasonId, SeasonStatus.Closed);
        },
        onSuccess: data => {
            const message =
                data.message?.toLowerCase() === 'success'
                    ? 'Đóng vụ nuôi thành công'
                    : data.message || 'Đóng vụ nuôi thành công';
            Toast.show({
                type: 'success',
                text1: message,
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.seasons() });
        },
        onError: handleMutationError,
    });
};
