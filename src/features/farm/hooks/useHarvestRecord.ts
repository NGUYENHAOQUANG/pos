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
 * GET harvest records và map sang JobExecution[] cho màn công việc + nhật ký.
 * Logic "Lần x" giống useFeedingRecordsAsJobs: đếm theo từng ngày.
 * @param params - Optional filter (CreateAtFrom, CreateAtTo, ...); PageSize mặc định 1000.
 */
export const useHarvestRecordsAsJobs = (pondId: string, params?: IHarvestRecordParams) => {
    const { data, isLoading, error, refetch } = useHarvestRecords(pondId, {
        PageSize: 1000,
        ...params,
    });

    const rawItems: IHarvestRecord[] = data?.data?.items ?? [];

    // Sort theo createdAt tăng dần để Lần 1, 2... đúng thứ tự trong ngày
    const sortedItems = [...rawItems].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
    });

    const dayCounts: Record<string, number> = {};
    const jobs: JobExecution[] = sortedItems.map(item => {
        const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
        const dateKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}-${createdDate.getDate()}`;
        if (!dayCounts[dateKey]) dayCounts[dateKey] = 0;
        dayCounts[dateKey]++;
        const dailyIndex = dayCounts[dateKey];

        const timeStr = createdDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
        const dateStr = formatDate(createdDate);

        const detail = item.harvestDetail ?? item.harvest;

        return {
            id: item.id,
            label: `Lần ${dailyIndex}`,
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
            queryClient.invalidateQueries({ queryKey: farmKeys.ponds.detail(pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.ponds.all() });
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
            queryClient.invalidateQueries({ queryKey: farmKeys.ponds.detail(pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.ponds.all() });
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
            queryClient.invalidateQueries({ queryKey: farmKeys.ponds.detail(pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.ponds.all() });
        },
        onError: handleError,
    });
};
