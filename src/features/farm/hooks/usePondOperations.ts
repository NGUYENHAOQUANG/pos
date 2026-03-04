import { useQuery } from '@tanstack/react-query';
import { pondOperationApi } from '@/features/farm/api/pondOperationApi';
import { GetPondOperationsParams } from '@/features/farm/types/pondOperation.types';
import { farmKeys } from '@/features/farm/hooks/farmKeys';

export const usePondOperations = (params?: GetPondOperationsParams) => {
    return useQuery({
        queryKey: [...farmKeys.masterData.operations(), params],
        queryFn: async () => {
            const res = await pondOperationApi.getPondOperations(params);
            return res?.data || [];
        },
        staleTime: 60 * 60 * 1000,
    });
};
