import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { waterSupplyApi } from '@/features/farm/api/waterChangeApi';
import { farmKeys } from './farmKeys';
import {
    IWaterSupplyParams,
    IWaterSupplyRecord,
    CreateWaterSupplyCommand,
} from '@/features/farm/types/waterChange.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { waterChangeLogService } from '@/features/farm/services/work-log';

export const useWaterSupplyRecords = (pondId: string, params?: IWaterSupplyParams) => {
    return useQuery({
        queryKey: farmKeys.waterSupply.list(pondId, params),
        queryFn: async () => {
            const response = await waterSupplyApi.getAll(pondId, params);
            return response;
        },
        enabled: !!pondId,
    });
};

export const useWaterSupplyRecordsAsJobs = (pondId: string, params?: IWaterSupplyParams) => {
    // 1. Fetch List keys
    const {
        data: listData,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useWaterSupplyRecords(pondId, params);

    // 2. Determine IDs to fetch details for
    const responseData = listData?.data;
    const rawItems: IWaterSupplyRecord[] = Array.isArray(responseData)
        ? responseData
        : responseData?.items || [];

    // Count daily items
    const jobs: JobExecution[] = waterChangeLogService.mapRecordsToJobs(rawItems);

    return { jobs, isLoading, isFetching, error, refetch };
};

export const useCreateWaterSupplyRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ pondId, data }: { pondId: string; data: CreateWaterSupplyCommand }) =>
            waterSupplyApi.create(pondId, data),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({ queryKey: farmKeys.waterSupply.list(pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
            queryClient.invalidateQueries({ queryKey: ['water-usage-stats'] });
        },
    });
};

export const useUpdateWaterSupplyRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            pondId,
            id,
            data,
        }: {
            pondId: string;
            id: string;
            data: CreateWaterSupplyCommand;
        }) => waterSupplyApi.update(pondId, id, data),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({ queryKey: farmKeys.waterSupply.list(pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
            queryClient.invalidateQueries({ queryKey: ['water-usage-stats'] });
        },
    });
};

export const useDeleteWaterSupplyRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ pondId, id }: { pondId: string; id: string }) =>
            waterSupplyApi.delete(pondId, id),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({ queryKey: farmKeys.waterSupply.list(pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
            queryClient.invalidateQueries({ queryKey: ['water-usage-stats'] });
        },
    });
};
