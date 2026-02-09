import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { waterSupplyApi } from '@/features/farm/api/waterChangeApi';
import { farmKeys } from './farmKeys';
import {
    IWaterSupplyParams,
    IWaterSupplyRecord,
    CreateWaterSupplyCommand,
} from '@/features/farm/types/waterChange.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { useMaterials } from '@/features/material/hooks/useMaterials';

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
    const { data: listData, isLoading, error, refetch } = useWaterSupplyRecords(pondId, params);

    // 2. Determine IDs to fetch details for
    const responseData = listData?.data;
    const rawItems: IWaterSupplyRecord[] = Array.isArray(responseData)
        ? responseData
        : responseData?.items || [];

    // Fetch Material Definitions for name lookup
    const { data: materialsData } = useMaterials();

    const sortedItems = [...rawItems].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB; // Sort ascending by time (Lần 1, Lần 2...)
    });

    const jobs: JobExecution[] = sortedItems.map((item: IWaterSupplyRecord, index: number) => ({
        id: item.id,
        label: `Lần ${index + 1}`,
        date: item.createdAt,
        time: item.createdAt
            ? new Date(item.createdAt).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
              })
            : '00:00',
        note: item.waterChangeDetail?.note || undefined,
        pondId: item.pondId,
        materials: item.waterChangeDetail?.materials?.map(m => {
            const matDef = materialsData?.find(d => d.id === m.materialId);
            return {
                material: {
                    id: m.materialId,
                    name: m.warehouseItemName || matDef?.name || 'Vật tư',
                    unitName: m.unitName || matDef?.unitName || '',
                } as any,
                quantity: m.quantity,
                unit: m.unitName || matDef?.unitName || '',
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
    }));

    return { jobs, isLoading, error, refetch };
};

export const useCreateWaterSupplyRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ pondId, data }: { pondId: string; data: CreateWaterSupplyCommand }) =>
            waterSupplyApi.create(pondId, data),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({ queryKey: farmKeys.waterSupply.list(pondId) });
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
        },
    });
};
