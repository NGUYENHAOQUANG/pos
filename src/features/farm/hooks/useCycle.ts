import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cycleApi } from '@/features/farm/api/cycleAPI';
import { CreateCycleCommand } from '@/features/farm/types/farm.types';
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
