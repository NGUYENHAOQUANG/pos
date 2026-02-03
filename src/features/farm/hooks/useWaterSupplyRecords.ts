import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { waterSupplyApi } from '@/features/farm/api/waterSupplyApi';
import { farmKeys } from './farmKeys';
import {
    IWaterSupplyParams,
    IWaterSupplyRecord,
    CreateWaterSupplyCommand,
} from '@/features/farm/types/waterSupply.types';
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
    const {
        data: listData,
        isLoading: isListLoading,
        error: listError,
        refetch: refetchList,
    } = useWaterSupplyRecords(pondId, params);

    // 2. Determine IDs to fetch details for
    const responseData = listData?.data;
    const rawItems: IWaterSupplyRecord[] = Array.isArray(responseData)
        ? responseData
        : responseData?.items || [];

    // Fetch Material Definitions for name lookup
    const { data: materialsData } = useMaterials();

    // 3. Fetch details for ALL items because List API returns empty/zero fields
    const {
        data: detailedItems,
        isLoading: isDetailsLoading,
        error: detailsError,
        refetch: refetchDetails,
    } = useQuery({
        queryKey: ['waterSupplyDetails', pondId, rawItems.map(i => i.id).join(',')],
        queryFn: async () => {
            if (rawItems.length === 0) return [];
            const detailPromises = rawItems.map(item =>
                waterSupplyApi
                    .getDetail(pondId, item.id)
                    .then(res => res.data)
                    .catch(err => {
                        // If item is not found (404), it means it was deleted. Return null to filter it out.
                        if (err?.response?.status === 404 || err?.statusCode === 404) {
                            return null;
                        }
                        console.error(`Failed to fetch detail for ${item.id}`, err);
                        return item; // Fallback to list item if other error
                    })
            );
            const results = await Promise.all(detailPromises);
            return results.filter(item => item !== null);
        },
        enabled: rawItems.length > 0,
    });

    const isLoading = isListLoading || (rawItems.length > 0 && isDetailsLoading);
    const error = listError || detailsError;

    // Use detailed items if available, otherwise raw items (while loading or if empty)
    const itemsToRender = detailedItems && detailedItems.length > 0 ? detailedItems : rawItems;

    const sortedItems = [...itemsToRender].sort((a, b) => {
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

    const refetch = async () => {
        await refetchList();
        if (rawItems.length > 0) {
            await refetchDetails();
        }
    };

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
