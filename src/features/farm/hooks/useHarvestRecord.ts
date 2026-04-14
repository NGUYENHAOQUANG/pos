import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { harvestRecordApi } from '@/features/farm/api/harvestRecordApi';
import { farmKeys } from './farmKeys';
import {
    ICreateHarvestRecordReq,
    IUpdateHarvestRecordReq,
    IHarvestRecordParams,
    IHarvestRecord,
} from '@/features/farm/types/harvestRecord.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { harvestLogService } from '@/features/farm/services/work-log';
import { handleError } from '@/shared/utils/errorHandler';

export const useHarvestRecords = (pondId: string, params?: IHarvestRecordParams) => {
    return useQuery({
        queryKey: farmKeys.harvestRecords.byPond(pondId, params),
        queryFn: () => harvestRecordApi.getAll(pondId, params),
        enabled: !!pondId,
    });
};

/**
 * GET harvest records and map to JobExecution[] for work + log screens.
 * "Lần x" logic similar to useFeedingRecordsAsJobs: count per day.
 * @param params - Optional filter (CreateAtFrom, CreateAtTo, ...); PageSize defaults to 1000.
 */
export const useHarvestRecordsAsJobs = (pondId: string, params?: IHarvestRecordParams) => {
    const {
        data,
        isLoading: isFetching,
        error,
        refetch,
    } = useHarvestRecords(pondId, {
        PageSize: 1000,
        ...params,
    });

    const rawItems: IHarvestRecord[] = data?.data?.items ?? [];

    const jobs: JobExecution[] = harvestLogService.mapRecordsToJobs(rawItems);

    return { jobs, isLoading: isFetching, error, refetch };
};

export const useHarvestRecord = (pondId: string, id: string) => {
    return useQuery({
        queryKey: farmKeys.harvestRecords.detail(id),
        queryFn: () => harvestRecordApi.getDetail(pondId, id),
        enabled: !!pondId && !!id,
    });
};

export const useCreateHarvestRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, data }: { pondId: string; data: ICreateHarvestRecordReq }) => {
            return harvestRecordApi.create(pondId, data);
        },
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.harvestRecords.byPond(pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: farmKeys.cycles.byPond(pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.ponds.all() });
            // Invalidate report charts
            queryClient.invalidateQueries({ queryKey: ['report', 'harvest-stats'] });
            queryClient.invalidateQueries({ queryKey: ['report', 'harvest-stats-table'] });
            queryClient.invalidateQueries({ queryKey: ['report', 'profit-stats'] });
            queryClient.invalidateQueries({ queryKey: ['report', 'production-distribution'] });
            queryClient.invalidateQueries({ queryKey: ['cost-donut'] });
        },
        onError: handleError,
    });
};

export const useUpdateHarvestRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            pondId,
            id,
            data,
        }: {
            pondId: string;
            id: string;
            data: IUpdateHarvestRecordReq;
        }) => harvestRecordApi.update(pondId, id, data),
        onSuccess: (data, { pondId, id }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.harvestRecords.byPond(pondId),
            });
            queryClient.invalidateQueries({
                queryKey: farmKeys.harvestRecords.detail(id),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: farmKeys.cycles.byPond(pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.ponds.all() });
            // Invalidate report charts
            queryClient.invalidateQueries({ queryKey: ['report', 'harvest-stats'] });
            queryClient.invalidateQueries({ queryKey: ['report', 'harvest-stats-table'] });
            queryClient.invalidateQueries({ queryKey: ['report', 'profit-stats'] });
            queryClient.invalidateQueries({ queryKey: ['report', 'production-distribution'] });
            queryClient.invalidateQueries({ queryKey: ['cost-donut'] });
        },
        onError: handleError,
    });
};

export const useDeleteHarvestRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, id }: { pondId: string; id: string }) =>
            harvestRecordApi.delete(pondId, id),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.harvestRecords.byPond(pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: farmKeys.cycles.byPond(pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.ponds.all() });
            // Invalidate report charts
            queryClient.invalidateQueries({ queryKey: ['report', 'harvest-stats'] });
            queryClient.invalidateQueries({ queryKey: ['report', 'harvest-stats-table'] });
            queryClient.invalidateQueries({ queryKey: ['report', 'profit-stats'] });
            queryClient.invalidateQueries({ queryKey: ['report', 'production-distribution'] });
            queryClient.invalidateQueries({ queryKey: ['cost-donut'] });
        },
        onError: handleError,
    });
};
