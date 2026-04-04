import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sizeMeasurementApi } from '@/features/farm/api/sizeMeasurementApi';
import { sizeMeasurementLogService } from '@/features/farm/services/work-log';
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

export const useSizeMeasurementsAsJobs = (
    pondId: string | undefined,
    params?: ISizeMeasurementParams
) => {
    const { data, isLoading, error, refetch } = useSizeMeasurements(pondId || '', params);

    const rawItems = data?.data?.items || [];
    const jobs: JobExecution[] = sizeMeasurementLogService.mapRecordsToJobs(rawItems);

    return { jobs, isLoading, error, refetch };
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
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
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
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
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
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
        },
    });
};
