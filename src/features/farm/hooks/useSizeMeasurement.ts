import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sizeMeasurementApi } from '@/features/farm/api/sizeMeasurementApi';
import { farmKeys } from './farmKeys';
import {
    ICreateSizeMeasurementReq,
    IUpdateSizeMeasurementReq,
    ISizeMeasurementParams,
} from '@/features/farm/types/sizeMeasurement.types';
import { JobExecution } from '@/features/farm/types/farm.types';

export const useSizeMeasurements = (pondId: string, params?: ISizeMeasurementParams) => {
    return useQuery({
        queryKey: farmKeys.sizeMeasurements.byPond(pondId, params),
        queryFn: () => sizeMeasurementApi.getAll(pondId, params),
        enabled: !!pondId,
    });
};

export const useSizeMeasurementsAsJobs = (pondId: string, params?: ISizeMeasurementParams) => {
    const { data, isLoading, error } = useSizeMeasurements(pondId, params);

    const jobs: JobExecution[] = (data?.data?.items || []).map(item => ({
        id: item.id,
        label: `Lần ${item.no || 0}`,
        date: item.createdAt,
        time: item.createdAt
            ? new Date(item.createdAt).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
              })
            : '00:00',
        note: item.sizeMeasurement?.notes || undefined,
        pondId: item.pondId,
        images: item.documentIds || [],
        meta: {
            shrimpSize: item.sizeMeasurement?.shrimpSizePcsPerKg?.toString(),
            remainingWeight: item.sizeMeasurement?.estimatedRemainingStockKg?.toString(),
            totalShrimpCount: item.sizeMeasurement?.totalShrimpCount || null,
            survivalRate: item.sizeMeasurement?.survivalRatePercentage || null,
            notes: item.sizeMeasurement?.notes,
            images: item.documentIds || [],
        },
    }));

    return { jobs, isLoading, error };
};

export const useSizeMeasurement = (pondId: string, id: string) => {
    return useQuery({
        queryKey: farmKeys.sizeMeasurements.detail(id),
        queryFn: () => sizeMeasurementApi.getDetail(pondId, id),
        enabled: !!pondId && !!id,
    });
};

export const useCreateSizeMeasurement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, data }: { pondId: string; data: ICreateSizeMeasurementReq }) =>
            sizeMeasurementApi.create(pondId, data),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.sizeMeasurements.byPond(pondId),
            });
        },
    });
};

export const useUpdateSizeMeasurement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            pondId,
            id,
            data,
        }: {
            pondId: string;
            id: string;
            data: IUpdateSizeMeasurementReq;
        }) => sizeMeasurementApi.update(pondId, id, data),
        onSuccess: (data, { pondId, id }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.sizeMeasurements.byPond(pondId),
            });
            queryClient.invalidateQueries({
                queryKey: farmKeys.sizeMeasurements.detail(id),
            });
        },
    });
};

export const useDeleteSizeMeasurement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, id }: { pondId: string; id: string }) =>
            sizeMeasurementApi.delete(pondId, id),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.sizeMeasurements.byPond(pondId),
            });
        },
    });
};
