import { useMemo } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { cycleApi } from '@/features/farm/api/cycleAPI';
import { CreateCycleCommand, UpdateCycleCommand } from '@/features/farm/types/farm.types';
import { farmKeys } from '@/features/farm/hooks/farmKeys';

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

export const useActiveCycle = (pondId: string) => {
    const { data: cycles } = useQuery({
        queryKey: farmKeys.cycles.byPond(pondId),
        queryFn: () => cycleApi.getCyclesByPond(pondId),
        enabled: !!pondId,
        staleTime: 1000 * 60 * 5, // Cache 5 minutes
    });

    const activeCycleSummary = useMemo(() => {
        if (!cycles || cycles.length === 0) return null;

        return (
            cycles.find(
                c =>
                    c.status === 'InProgress' ||
                    c.status === 'Chưa hoàn thành' ||
                    c.status === 'Hoạt động'
            ) ||
            cycles[0] ||
            null
        );
    }, [cycles]);

    const activeCycleId = activeCycleSummary?.id;

    const { data: cycleDetail } = useQuery({
        queryKey: farmKeys.cycles.detail(activeCycleId || ''),
        queryFn: () => cycleApi.getCycleDetail(pondId, activeCycleId!),
        enabled: !!pondId && !!activeCycleId,
        staleTime: 1000 * 60 * 5, // Cache 5 minutes
    });

    return cycleDetail || activeCycleSummary || null;
};

export const useCycleDetail = (pondId: string, cycleId: string) => {
    return useQuery({
        queryKey: ['cycle', pondId, cycleId],
        queryFn: () => cycleApi.getCycleDetail(pondId, cycleId),
        enabled: !!pondId && !!cycleId,
    });
};
