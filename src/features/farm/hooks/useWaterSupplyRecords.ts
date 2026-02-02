import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { waterSupplyApi } from '@/features/farm/api/waterSupplyApi';
import { farmKeys } from './farmKeys';
import {
    IWaterSupplyParams,
    IWaterSupplyRecord,
    CreateWaterSupplyCommand,
} from '@/features/farm/types/waterSupply.types';
import { JobExecution } from '@/features/farm/types/farm.types';

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
    const { data, isLoading, error, refetch } = useWaterSupplyRecords(pondId, params);

    // Fix: API returns { success: true, data: [...] } instead of { data: { items: [...] } }
    const responseData = data?.data;
    const rawItems = Array.isArray(responseData) ? responseData : responseData?.items || [];

    const sortedItems = [...rawItems].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
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
        note: item.waterChangeDetail?.notes || undefined,
        pondId: item.pondId,
        materials: item.waterChangeDetail?.materials?.map(m => ({
            material: {
                id: m.materialId,
                name: m.warehouseItemName || 'Vật tư',
                unitName: m.unitName || '',
            } as any,
            quantity: m.quantity,
            unit: m.unitName || '',
        })),
        images: item.documentIds || [],
        meta: {
            targetLevel: item.waterChangeDetail?.targetWaterLevel,
            supplyLevel: item.waterChangeDetail?.waterAdded,
            // drainLevel/volumes are potentially calculated client-side if not returned
            // but if the user wants them stored, they should be in the API result.
            // For now map what we have.
            images: item.documentIds || [],
        },
    }));

    console.log('useWaterSupplyRecordsAsJobs - Processed jobs length:', jobs.length);

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
