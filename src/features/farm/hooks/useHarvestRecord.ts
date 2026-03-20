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
import { formatDate } from '@/features/farm/utils/dateUtils';
import { getHarvestTypeDisplay } from '@/features/farm/schemas/harvestFormSchema';
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
    const { data, isLoading, error, refetch } = useHarvestRecords(pondId, {
        PageSize: 1000,
        ...params,
    });

    const rawItems: IHarvestRecord[] = data?.data?.items ?? [];

    // Sort by createdAt ascending first for "Lần x" counting (oldest → newest)
    const ascItems = [...rawItems].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
    });

    // Count total occurrences per day
    const totalPerDay: Record<string, number> = {};
    ascItems.forEach(item => {
        const d = item.createdAt ? new Date(item.createdAt) : new Date();
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        totalPerDay[key] = (totalPerDay[key] || 0) + 1;
    });

    // Assign "Lần x" labels in ascending order
    const dayCounts: Record<string, number> = {};
    const labelMap = new Map<string, string>();
    ascItems.forEach(item => {
        const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
        const dateKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}-${createdDate.getDate()}`;
        if (!dayCounts[dateKey]) dayCounts[dateKey] = 0;
        dayCounts[dateKey]++;
        labelMap.set(item.id, `Lần ${dayCounts[dateKey]}`);
    });

    // Sort descending (newest first) for card display — slice(0,3) shows latest items
    const sortedDesc = [...rawItems].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
    });

    const jobs: JobExecution[] = sortedDesc.map(item => {
        const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();

        const timeStr = createdDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
        const dateStr = formatDate(createdDate);

        const detail = item.harvestDetail ?? item.harvest;

        return {
            id: item.id,
            label: labelMap.get(item.id) || 'Lần 1',
            time: timeStr,
            date: dateStr,
            note: detail?.notes ?? undefined,
            pondId: item.pondId,
            documentIds: item.documentIds,
            images: item.documentIds ?? [],
            createdAt: item.createdAt,
            meta: detail
                ? {
                      harvestType: getHarvestTypeDisplay(detail.harvestType),
                      yieldAmount: detail.totalWeightKg?.toString(),
                      shrimpSize: detail.shrimpSize?.toString(),
                      referencePrice: detail.referencePrice?.toString(),
                      revenue: detail.revenue,
                      notes: detail.notes,
                  }
                : undefined,
        };
    });

    return { jobs, isLoading, error, refetch };
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
