import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { waterSupplyApi } from '@/features/farm/api/waterChangeApi';
import { farmKeys } from './farmKeys';
import {
    IWaterSupplyParams,
    IWaterSupplyRecord,
    CreateWaterSupplyCommand,
} from '@/features/farm/types/waterChange.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { useFarmMaterials } from '@/features/farm/hooks/useFarmMaterials';

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

    // Fetch Material Definitions for name lookup
    const { materialMap } = useFarmMaterials();

    // Count daily items
    const totalPerDay: Record<string, number> = {};
    rawItems.forEach((item: IWaterSupplyRecord) => {
        const d = item.createdAt ? new Date(item.createdAt) : new Date();
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        totalPerDay[key] = (totalPerDay[key] || 0) + 1;
    });

    // Sort descending (newest first)
    const sortedItems = [...rawItems].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
    });

    const dayCounts: Record<string, number> = {};

    const jobs: JobExecution[] = sortedItems.map((item: IWaterSupplyRecord) => {
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
            note: item.waterChangeDetail?.note || undefined,
            pondId: item.pondId,
            materials: item.waterChangeDetail?.materials?.map(m => {
                const matDef = m.warehouseItemId ? materialMap[m.warehouseItemId] : undefined;
                return {
                    material: {
                        id: m.warehouseItemId,
                        name: matDef?.name || m.warehouseItemName || 'Vật tư',
                        unitName: matDef?.unitName || m.unitName || '',
                    } as any,
                    quantity: m.quantity,
                    unit: matDef?.unitName || m.unitName || '',
                };
            }),
            images: item.waterChangeDetail?.documentIds || item.documentIds || [],
            meta: {
                targetLevel: item.waterChangeDetail?.targetWaterLevel,
                supplyLevel: item.waterChangeDetail?.waterAdded,
                drainLevel: item.waterChangeDetail?.waterRemoved?.toString(),
                volumeAfterDrain: item.waterChangeDetail?.previousVolume?.toString(),
                volumeSupply: item.waterChangeDetail?.addedVolume?.toString(),
                volumeAfterSupply: item.waterChangeDetail?.finalVolume?.toString(),
                images: item.waterChangeDetail?.documentIds || item.documentIds || [],
            },
        };
    });

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
