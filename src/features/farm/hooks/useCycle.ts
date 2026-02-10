import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { cycleApi } from '@/features/farm/api/cycleAPI';
import { CreateCycleCommand, UpdateCycleCommand } from '@/features/farm/types/farm.types';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { formatDate } from '@/features/farm/utils/dateUtils';

export const useCreateCycle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, data }: { pondId: string; data: CreateCycleCommand }) =>
            cycleApi.createCycle(pondId, data),
        onSuccess: async (responseData, variables) => {
            // Invalidate relevant queries to refresh data
            queryClient.invalidateQueries({ queryKey: farmKeys.cycles.byPond(variables.pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.ponds.detail(variables.pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.ponds.all() });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });

            // Sync to store using response data immediately to avoid extra round-trip
            try {
                const detail = responseData as any;
                if (detail && detail.id) {
                    const mappedCycle = {
                        ...detail,
                        cycleName: detail.name || detail.cycleName,
                        sourcePonds: detail.sourcePonds || (detail.pondId ? [detail.pondId] : []),
                        receivingPonds: detail.receivingPonds || [],
                        stockingQuantity: detail.stockingQuantity || detail.totalStocking || 0,
                        stockingDate: formatDate(
                            new Date(detail.createdAt || detail.stockingDate || new Date())
                        ),
                        status:
                            detail.status === 'InProgress'
                                ? 'Chưa hoàn thành'
                                : detail.status === 'Completed'
                                ? 'Hoàn thành'
                                : detail.status,
                    };
                    useFarmStore.getState().saveActiveCycle(variables.pondId, mappedCycle);
                }
            } catch (err) {
                console.warn('Failed to sync created cycle to store', err);
            }
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
            data: UpdateCycleCommand;
        }) => cycleApi.updateCycle(pondId, cycleId, data),
        onSuccess: async (data, variables) => {
            queryClient.invalidateQueries({ queryKey: farmKeys.cycles.byPond(variables.pondId) });
            // Refresh pond detail (status update)
            queryClient.invalidateQueries({ queryKey: farmKeys.ponds.detail(variables.pondId) });
            // Refresh ALL pond lists
            queryClient.invalidateQueries({ queryKey: farmKeys.ponds.all() });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });

            // Sync to store using response data immediately
            try {
                const detail = data as any;
                if (detail) {
                    const mappedCycle = {
                        ...detail,
                        cycleName: detail.name || detail.cycleName,
                        sourcePonds: detail.sourcePonds || (detail.pondId ? [detail.pondId] : []),
                        receivingPonds: detail.receivingPonds || [],
                        stockingQuantity: detail.stockingQuantity || detail.totalStocking || 0,
                        stockingDate: formatDate(
                            new Date(detail.createdAt || detail.stockingDate || new Date())
                        ),
                        status:
                            detail.status === 'InProgress'
                                ? 'Chưa hoàn thành'
                                : detail.status === 'Completed'
                                ? 'Hoàn thành'
                                : detail.status,
                    };

                    // Update active cycle in store
                    useFarmStore.getState().saveActiveCycle(variables.pondId, mappedCycle);
                }
            } catch (err) {
                console.warn('Failed to sync updated cycle to store', err);
            }
        },
    });
};

export const useDeleteCycle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, cycleId }: { pondId: string; cycleId: string }) =>
            cycleApi.deleteCycle(pondId, cycleId),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: farmKeys.cycles.byPond(variables.pondId) });
            // Refresh pond detail (status might change from Active -> Empty)
            queryClient.invalidateQueries({ queryKey: farmKeys.ponds.detail(variables.pondId) });
            // Refresh ALL pond lists
            queryClient.invalidateQueries({ queryKey: farmKeys.ponds.all() });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
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
