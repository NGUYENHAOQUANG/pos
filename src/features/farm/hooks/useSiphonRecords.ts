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
    const sortedItems = [...rawItems].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
    });

    const jobs: JobExecution[] = sortedItems.map((item: ISiphonRecord, index: number) => ({
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
    }));

    return { jobs, isLoading, error, refetch };
};
export const useCreateSiphonRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ pondId, data }: { pondId: string; data: CreateSiphonCommand }) =>
            siphonApi.create(pondId, data),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({ queryKey: farmKeys.siphon.list(pondId) });
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
        },
    });
};
