import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { siphonApi } from '@/features/farm/api/siphonApi';
import { farmKeys } from './farmKeys';
import {
    ISiphonParams,
    ISiphonRecord,
    CreateSiphonCommand,
} from '@/features/farm/types/siphon.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { handleError } from '@/shared/utils';
import { useMaterials } from '@/features/material/hooks/useMaterials';
import { useMaterialGroups } from '@/features/material/hooks/useMaterialGroups';
import { useWarehouses, useWarehouseItems } from '@/features/material/hooks/useWarehouses';
import { useMemo } from 'react';
import { IMaterial } from '@/features/material/types/material.types';

export const useSiphonMaterials = (zoneId?: string) => {
    // 1. Warehouses
    const { data: warehouses = [] } = useWarehouses({ ZoneId: zoneId });
    const defaultWarehouseId = warehouses?.[0]?.id;

    // 2. Materials & Groups
    const { data: allMaterials = [] } = useMaterials();
    const { data: groups = [] } = useMaterialGroups();

    // 3. Warehouse Items
    const { data: warehouseItemsData } = useWarehouseItems(
        defaultWarehouseId,
        {
            PageSize: 1000,
        },
        { enabled: !!defaultWarehouseId }
    );

    // 4. Allowed Groups
    const allowedGroupIds = useMemo(() => {
        return groups
            .filter(g => {
                const name = g.name.toLowerCase();
                return name.includes('thiết bị điện') || name.includes('công cụ');
            })
            .map(g => g.id);
    }, [groups]);

    // 5. Filter Logic
    const materials = useMemo(() => {
        const items = warehouseItemsData?.items || [];
        if (!items.length || !allMaterials.length) return [];

        return items
            .filter((item: any) => {
                const materialDef = allMaterials.find((m: any) => m.id === item.materialId);
                const groupId = item.material?.materialGroup?.id || materialDef?.groupId;
                return allowedGroupIds.includes(groupId);
            })
            .map((item: any) => {
                const materialDef = allMaterials.find((m: any) => m.id === item.materialId);
                return {
                    id: item.id,
                    name: item.materialName || materialDef?.name || '',
                    group: item.material?.materialGroup?.name || '',
                    unit: item.unitId,
                    unitName: item.unitName || materialDef?.unitName,
                    remaining: item.quantity,
                } as IMaterial;
            });
    }, [warehouseItemsData, allMaterials, allowedGroupIds]);

    return { materials };
};

export const useSiphonRecords = (pondId: string, params?: ISiphonParams) => {
    return useQuery({
        queryKey: farmKeys.siphon.list(pondId, params),
        queryFn: async () => {
            const response = await siphonApi.getAll(pondId, params);
            return response;
        },
        enabled: !!pondId,
    });
};

export const useSiphonRecordsAsJobs = (pondId: string, params?: ISiphonParams) => {
    const { data, isLoading, error, refetch } = useSiphonRecords(pondId, params);

    const rawItems = data?.data?.items || [];

    // Count daily items
    const totalPerDay: Record<string, number> = {};
    rawItems.forEach((item: ISiphonRecord) => {
        const d = item.createdAt ? new Date(item.createdAt) : new Date();
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        totalPerDay[key] = (totalPerDay[key] || 0) + 1;
    });

    // Sort Descending
    const sortedItems = [...rawItems].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
    });

    const dayCounts: Record<string, number> = {};

    const jobs: JobExecution[] = sortedItems.map((item: ISiphonRecord) => {
        const dateObj = item.createdAt ? new Date(item.createdAt) : new Date();
        const dateKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;

        if (!dayCounts[dateKey]) dayCounts[dateKey] = 0;
        dayCounts[dateKey]++;
        const total = totalPerDay[dateKey] ?? dayCounts[dateKey];
        const dailyIndex = total - dayCounts[dateKey] + 1;

        return {
            id: item.id,
            label: `Lần ${dailyIndex}`,
            date: item.createdAt,
            time: item.createdAt
                ? dateObj.toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                  })
                : '00:00',
            note: item.siphonDetail?.notes || undefined,
            pondId: item.pondId,
            materials: item.siphonDetail?.materials?.map(m => ({
                material: {
                    id: m.warehouseItemId,
                    name: m.warehouseItemName || 'Vật tư',
                    unitName: m.unitName || 'Đơn vị',
                } as any,
                quantity: m.quantity,
                unit: m.unitName || '',
            })),
            images: item.documentIds || [],
            meta: {
                lossAmount: item.siphonDetail?.shrimpLossKg?.toString(),
                images: item.documentIds || [],
            },
        };
    });

    return { jobs, isLoading, error, refetch };
};
export const useCreateSiphonRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ pondId, data }: { pondId: string; data: CreateSiphonCommand }) =>
            siphonApi.create(pondId, data),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({ queryKey: farmKeys.siphon.list(pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
        },
        onError: error => handleError(error),
    });
};

export const useUpdateSiphonRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            pondId,
            id,
            data,
        }: {
            pondId: string;
            id: string;
            data: CreateSiphonCommand;
        }) => siphonApi.update(pondId, id, data),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({ queryKey: farmKeys.siphon.list(pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
        },
    });
};

export const useDeleteSiphonRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ pondId, id }: { pondId: string; id: string }) =>
            siphonApi.delete(pondId, id),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({ queryKey: farmKeys.siphon.list(pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
        },
    });
};
