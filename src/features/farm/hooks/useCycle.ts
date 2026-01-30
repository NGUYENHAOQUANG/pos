import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { cycleApi } from '@/features/farm/api/cycleAPI';
import { CreateCycleCommand, UpdateCycleCommand } from '@/features/farm/types/farm.types';
import { farmKeys } from './farmKeys';

export const useCreateCycle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, data }: { pondId: string; data: CreateCycleCommand }) =>
            cycleApi.createCycle(pondId, data),
        onSuccess: (data, variables) => {
            // Invalidate relevant queries to refresh data
            // Assuming we might have a query for cycles list
            queryClient.invalidateQueries({ queryKey: farmKeys.cycles.byPond(variables.pondId) });
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
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: farmKeys.cycles.byPond(variables.pondId) });
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
        },
    });
};

export const useCyclesByPond = (pondId: string) => {
    return useQuery({
        queryKey: farmKeys.cycles.byPond(pondId),
        queryFn: () => cycleApi.getCyclesByPond(pondId),
        enabled: !!pondId,
    });
};
