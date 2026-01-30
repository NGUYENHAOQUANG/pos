import { useQuery } from '@tanstack/react-query';
import { siphonApi } from '@/features/farm/api/siphonApi';
import { farmKeys } from './farmKeys';
import { ISiphonParams, ISiphonRecord } from '@/features/farm/types/siphon.types';
import { JobExecution } from '@/features/farm/types/farm.types';

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
    const { data, isLoading, error } = useSiphonRecords(pondId, params);

    const jobs: JobExecution[] = (data?.data?.items || []).map((item: ISiphonRecord) => ({
        id: item.id,
        label: `Lần ${item.no || 0}`,
        date: item.createdAt,
        time: item.createdAt
            ? new Date(item.createdAt).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
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

    return { jobs, isLoading, error };
};
