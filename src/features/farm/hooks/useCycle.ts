import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { cycleApi } from '@/features/farm/api/cycleAPI';
import {
    ICreateCyclePayload,
    IUpdateCyclePayload,
    ICycleListParams,
} from '@/features/farm/types/cycle.types';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import { normalizeApiError } from '@/core/api/errorHandler';

export const useCreateCycle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, data }: { pondId: string; data: ICreateCyclePayload }) =>
            cycleApi.createCycle(pondId, data),
        onSuccess: async (_responseData, variables) => {
            // Invalidate relevant queries to refresh data
            queryClient.invalidateQueries({ queryKey: farmKeys.cycles.byPond(variables.pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.ponds.all() });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            Toast.show({
                type: 'success',
                text1: 'Đã tạo chu kỳ nuôi thành công',
                topOffset: 0,
            });
        },
        onError: error => {
            const normalized = normalizeApiError(error);
            Toast.show({
                type: 'error',
                text1: 'Có lỗi xảy ra',
                text2: normalized.message,
                position: 'top',
            });
        },
    });
};

export const useUpdateCycle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            pondId,
            cycleId,
            data,
        }: {
            pondId: string;
            cycleId: string;
            data: IUpdateCyclePayload;
        }) => cycleApi.updateCycle(pondId, cycleId, data),
        onSuccess: async (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: farmKeys.cycles.byPond(variables.pondId) });
            queryClient.invalidateQueries({
                queryKey: farmKeys.cycles.detail(variables.pondId, variables.cycleId),
            });
            // Refresh ALL pond lists
            queryClient.invalidateQueries({ queryKey: farmKeys.ponds.all() });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            Toast.show({
                type: 'success',
                text1: 'Đã cập nhật chu kỳ thành công',
                topOffset: 0,
            });
        },
        onError: error => {
            const normalized = normalizeApiError(error);
            Toast.show({
                type: 'error',
                text1: 'Có lỗi xảy ra',
                text2: normalized.message,
                position: 'top',
            });
        },
    });
};

export const useDeleteCycle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, cycleId }: { pondId: string; cycleId: string }) =>
            cycleApi.deleteCycle(pondId, cycleId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: farmKeys.cycles.byPond(variables.pondId) });
            queryClient.invalidateQueries({
                queryKey: farmKeys.cycles.detail(variables.pondId, variables.cycleId),
            });
            // Refresh ALL pond lists
            queryClient.invalidateQueries({ queryKey: farmKeys.ponds.all() });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            Toast.show({
                type: 'success',
                text1: 'Đã xóa chu kỳ thành công',
                position: 'top',
            });
        },
        onError: error => {
            const normalized = normalizeApiError(error);
            Toast.show({
                type: 'error',
                text1: 'Xóa thất bại',
                text2: normalized.message,
                visibilityTime: 4000,
            });
        },
    });
};

export const useCyclesByPond = (pondId: string) => {
    return useQuery({
        queryKey: farmKeys.cycles.byPond(pondId),
        queryFn: () => cycleApi.getCyclesByPond(pondId),
        enabled: !!pondId,
        staleTime: 0,
        refetchOnMount: 'always',
    });
};

export const useActiveCycle = (pondId: string) => {
    const {
        data: cyclesResponse,
        refetch: refetchList,
        isLoading: isLoadingList,
        isRefetching: isRefetchingList,
    } = useQuery({
        queryKey: farmKeys.cycles.byPond(pondId),
        queryFn: () => cycleApi.getCyclesByPond(pondId),
        enabled: !!pondId,
        staleTime: 1000 * 60 * 5, // Cache 5 minutes
    });

    const activeCycleSummary = useMemo(() => {
        const items = cyclesResponse?.data?.items;
        if (!items || items.length === 0) return null;

        return (
            items.find(
                c =>
                    c.status === 'InProgress' ||
                    c.status === 'Chưa hoàn thành' ||
                    c.status === 'Hoạt động'
            ) || null
        );
    }, [cyclesResponse]);

    const activeCycleId = activeCycleSummary?.id;

    const {
        data: cycleDetailResponse,
        refetch: refetchDetail,
        isLoading: isLoadingDetail,
        isRefetching: isRefetchingDetail,
    } = useQuery({
        queryKey: farmKeys.cycles.detail(pondId, activeCycleId || ''),
        queryFn: () => cycleApi.getCycleDetail(pondId, activeCycleId!),
        enabled: !!pondId && !!activeCycleId,
        staleTime: 1000 * 60 * 5, // Cache 5 minutes
    });

    const data = cycleDetailResponse?.data || activeCycleSummary || null;
    const refetch = useCallback(() => {
        refetchList();
        if (activeCycleId) refetchDetail();
    }, [refetchList, refetchDetail, activeCycleId]);
    const isLoading = isLoadingList || isLoadingDetail;
    const isRefetching = isRefetchingList || isRefetchingDetail;

    return { data, refetch, isLoading, isRefetching };
};

export const useCycleDetail = (pondId: string, cycleId: string) => {
    return useQuery({
        queryKey: farmKeys.cycles.detail(pondId, cycleId),
        queryFn: () => cycleApi.getCycleDetail(pondId, cycleId),
        enabled: !!pondId && !!cycleId,
    });
};

export const useAllCycles = (params?: ICycleListParams) => {
    return useQuery({
        queryKey: [...farmKeys.cycles.all(), params],
        queryFn: () => cycleApi.getCycles(params),
    });
};
