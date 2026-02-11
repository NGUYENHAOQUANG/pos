import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFarmStore } from '@/features/farm/store/farmStore';
import Toast from 'react-native-toast-message';
import { useMaterials } from '@/features/material/hooks/useMaterials';
import { useMaterialGroups } from '@/features/material/hooks/useMaterialGroups';
import { useWarehouses, useWarehouseItems } from '@/features/material/hooks/useWarehouses';
import { feedingRecordApi } from '@/features/farm/api/feedingRecordApi';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import { JobExecution } from '@/features/farm/types/farm.types';
import { formatDate } from '@/features/farm/utils/dateUtils';
import type { IMaterial } from '@/features/material/types/material.types';
import type {
    FeedingRecordItem,
    CreateFeedingRecordPayload,
} from '@/features/farm/types/feedingRecord.types';

/**
 * Lấy danh sách vật tư cho màn Cho ăn (dropdown chọn vật tư).
 * Dùng lại logic đã dùng trong useHandleProblemForm:
 * - Lấy selectedZoneId từ farmStore
 * - Lấy warehouse theo ZoneId
 * - Lấy warehouse items
 * - Map ra IMaterial[] với id = warehouseItemId
 */
export const useFeeding = () => {
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    // Danh sách vật tư master
    const { data: allMaterials = [] } = useMaterials();

    // Lấy danh sách nhóm vật tư để filter "Nuôi"
    const { data: groups = [] } = useMaterialGroups();
    const feedGroupId = useMemo(() => {
        return groups.find(g => g.name.toLowerCase().includes('nuôi'))?.id;
    }, [groups]);

    // Kho theo ZoneId
    const { data: warehouses = [] } = useWarehouses({ ZoneId: selectedZoneId || undefined });
    const defaultWarehouseId = warehouses?.[0]?.id;

    // Items trong kho
    const { data: warehouseItemsData } = useWarehouseItems(
        defaultWarehouseId,
        {
            PageSize: 1000,
            MaterialGroupId: feedGroupId,
        },
        { enabled: !!defaultWarehouseId }
    );

    // Map ra IMaterial[]
    const materials: IMaterial[] = useMemo(() => {
        return (warehouseItemsData?.items || []).map((item: any) => {
            const materialDef = allMaterials.find((m: any) => m.id === item.materialId);

            return {
                id: item.id,
                name: item.materialName || item.material?.name || materialDef?.name || 'Unknown',
                group: item.material?.materialGroup?.name || '',
                unit: item.unitId || (materialDef as any)?.unit || '',
                unitName:
                    item.unitName ||
                    item.material?.unit?.name ||
                    (materialDef as any)?.unitName ||
                    '',
                remaining: item.quantity || 0,
            } as IMaterial;
        });
    }, [warehouseItemsData, allMaterials]);

    return {
        materials,
    };
};

/**
 * GET /feeding-records và map sang JobExecution[] cho màn công việc + nhật ký.
 * Logic "Lần x" giống useIncidentsAsJobs: đếm theo từng ngày.
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
    const { materials: availableMaterials } = useFeeding();

    const materialMap = useMemo(() => {
        return availableMaterials.reduce((acc, curr) => {
            acc[curr.id] = curr;
            return acc;
        }, {} as Record<string, IMaterial>);
    }, [availableMaterials]);

    const rawItems: FeedingRecordItem[] = data?.data?.items ?? [];

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
