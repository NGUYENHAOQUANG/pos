import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { harvestRecordApi } from '@/features/farm/api/harvestRecordApi';
import { farmKeys } from './farmKeys';
import {
    ICreateHarvestRecordReq,
    IUpdateHarvestRecordReq,
    IHarvestRecordParams,
} from '@/features/farm/types/harvestRecord.types';
import { handleError } from '@/shared/utils/errorHandler';

export const useHarvestRecords = (pondId: string, params?: IHarvestRecordParams) => {
    return useQuery({
        queryKey: farmKeys.harvestRecords.byPond(pondId, params),
        queryFn: () => harvestRecordApi.getAll(pondId, params),
        enabled: !!pondId,
    });
};

export const useHarvestRecord = (pondId: string, id: string) => {
    return useQuery({
        queryKey: farmKeys.harvestRecords.detail(id),
        queryFn: () => harvestRecordApi.getDetail(pondId, id),
        enabled: !!pondId && !!id,
    });
};

export const useCreateHarvestRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, data }: { pondId: string; data: ICreateHarvestRecordReq }) => {
            return harvestRecordApi.create(pondId, data);
        },
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.harvestRecords.byPond(pondId),
            });
        },
        onError: handleError,
    });
};

export const useUpdateHarvestRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            pondId,
            id,
            data,
        }: {
            pondId: string;
            id: string;
            data: IUpdateHarvestRecordReq;
        }) => harvestRecordApi.update(pondId, id, data),
        onSuccess: (data, { pondId, id }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.harvestRecords.byPond(pondId),
            });
            queryClient.invalidateQueries({
                queryKey: farmKeys.harvestRecords.detail(id),
            });
        },
        onError: handleError,
    });
};

export const useDeleteHarvestRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, id }: { pondId: string; id: string }) =>
            harvestRecordApi.delete(pondId, id),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.harvestRecords.byPond(pondId),
            });
        },
        onError: handleError,
    });
};
