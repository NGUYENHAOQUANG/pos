import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { feedingRecordApi } from '@/features/farm/api/feedingRecordApi';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import { JobExecution } from '@/features/farm/types/farm.types';
import { formatDate } from '@/features/farm/utils/dateUtils';
import type {
    FeedingRecordItem,
    CreateFeedingRecordPayload,
} from '@/features/farm/types/feedingRecord.types';
import { useFarmMaterials } from '@/features/farm/hooks/useFarmMaterials';

/**
 * Get list of materials for Feeding screen (material dropdown).
 */
export const useFeeding = () => {
    const { materials: allMaterials } = useFarmMaterials();

    const materials = useMemo(() => {
        return allMaterials.filter(m => m.group && m.group.toLowerCase().includes('nuôi'));
    }, [allMaterials]);

    return {
        materials,
    };
};

/**
 * GET /feeding-records and map to JobExecution[] for work + log screens.
 * "Lần x" logic similar to useIncidentsAsJobs: count per day.
 */
export const useFeedingRecords = (pondId: string) => {
    return useQuery({
        queryKey: farmKeys.feedingRecords.list(pondId),
        queryFn: () => feedingRecordApi.list(pondId),
        enabled: !!pondId,
    });
};

export const useFeedingRecordsAsJobs = (pondId: string) => {
    const { data, isLoading, error, refetch } = useFeedingRecords(pondId);
    const { materialMap } = useFarmMaterials();

    const rawItems: FeedingRecordItem[] = data?.data?.items ?? [];

    // Count daily items
    const totalPerDay: Record<string, number> = {};
    rawItems.forEach(item => {
        const d = item.createdAt ? new Date(item.createdAt) : new Date();
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        totalPerDay[key] = (totalPerDay[key] || 0) + 1;
    });

    const sortedItems = [...rawItems].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
    });

    const dayCounts: Record<string, number> = {};
    const jobs: JobExecution[] = sortedItems.map(item => {
        const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
        const dateKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}-${createdDate.getDate()}`;

        if (!dayCounts[dateKey]) dayCounts[dateKey] = 0;
        dayCounts[dateKey]++;
        const total = totalPerDay[dateKey] ?? dayCounts[dateKey];
        const dailyIndex = total - dayCounts[dateKey] + 1;

        const timeStr = createdDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
        const dateStr = formatDate(createdDate);

        return {
            id: item.id,
            label: `Lần ${dailyIndex}`,
            time: timeStr,
            date: dateStr,
            note: item.feedingDetail?.notes ?? undefined,
            pondId: item.pondId,
            materials: item.feedingDetail?.materials?.map(m => {
                const mat = materialMap[m.warehouseItemId];
                return {
                    material: {
                        id: m.warehouseItemId,
                        name: mat?.name || 'Vật tư',
                        unitName: mat?.unitName || '',
                    } as any,
                    quantity: m.quantity,
                    unit: mat?.unitName || '',
                };
            }),
            documentIds: item.documentIds,
            images: item.documentIds ?? [],
            createdAt: item.createdAt,
        };
    });

    return { jobs, isLoading, error, refetch };
};

interface NormalizedError {
    type: string;
    message: string;
    fields: Record<string, string[]>;
}

const handleError = (err: unknown) => {
    const error = err as NormalizedError;

    if (error.type === 'VALIDATION_ERROR') {
        const firstFieldKey = Object.keys(error.fields)[0];
        if (firstFieldKey && error.fields[firstFieldKey]?.length > 0) {
            Toast.show({
                type: 'error',
                text1: error.fields[firstFieldKey][0],
                visibilityTime: 4000,
            });
            return;
        }
    }

    if (error.type === 'NOT_FOUND_ERROR') {
        Toast.show({
            type: 'error',
            text1: error.message,
            visibilityTime: 4000,
        });
        return;
    }

    Toast.show({ type: 'error', text1: error.message || 'Có lỗi xảy ra' });
};

export const useCreateFeedingRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            pondId,
            payload,
        }: {
            pondId: string;
            payload: CreateFeedingRecordPayload;
        }) => feedingRecordApi.create(pondId, payload),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.feedingRecords.list(pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            Toast.show({
                type: 'success',
                text1: 'Đã cho ăn thành công',
                position: 'top',
            });
        },
        onError: (error: any) => {
            handleError(error);
        },
    });
};

export const useUpdateFeedingRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            pondId,
            id,
            payload,
        }: {
            pondId: string;
            id: string;
            payload: CreateFeedingRecordPayload;
        }) => feedingRecordApi.update(pondId, id, payload),
        onSuccess: (_, { pondId, id }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.feedingRecords.list(pondId),
            });
            queryClient.invalidateQueries({
                queryKey: farmKeys.feedingRecords.detail(id),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            Toast.show({
                type: 'success',
                text1: 'Cập nhật hồ sơ thành công',
                position: 'top',
            });
        },
        onError: (error: any) => {
            handleError(error);
        },
    });
};

export const useDeleteFeedingRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, id }: { pondId: string; id: string }) =>
            feedingRecordApi.delete(pondId, id),
        onSuccess: (_, { pondId, id }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.feedingRecords.list(pondId),
            });
            queryClient.invalidateQueries({
                queryKey: farmKeys.feedingRecords.detail(id),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            Toast.show({
                type: 'success',
                text1: 'Xóa hồ sơ thành công',
                position: 'top',
            });
        },
        onError: (error: any) => {
            handleError(error);
        },
    });
};

export const useFeedingRecordDetail = (pondId: string, id: string) => {
    return useQuery({
        queryKey: farmKeys.feedingRecords.detail(id),
        queryFn: () => feedingRecordApi.getDetail(pondId, id),
        enabled: !!pondId && !!id,
    });
};
