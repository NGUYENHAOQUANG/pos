import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cleanRenovationApi } from '@/features/farm/api/cleanRenovationApi';

import { farmKeys } from './farmKeys';
import {
    ICleanRenovationParams,
    ICleanRenovationDetail,
} from '@/features/farm/types/cleanRenovation.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { cleanRenovationLogService } from '@/features/farm/services/work-log';

export const useCleanRenovations = (pondId: string, params?: ICleanRenovationParams) => {
    return useQuery({
        queryKey: farmKeys.cleanRenovations.byPond(pondId, params),
        queryFn: () => cleanRenovationApi.getAll(pondId, params),
        enabled: !!pondId,
    });
};

export const useCleanRenovationsAsJobs = (pondId: string, params?: ICleanRenovationParams) => {
    const { data, isLoading, error, refetch } = useCleanRenovations(pondId, params);

    const rawItems = data?.data?.items || [];
    const jobs: JobExecution[] = cleanRenovationLogService.mapRecordsToJobs(rawItems);

    return { jobs, isLoading, error, refetch };
};

export const useCreateCleanRenovation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            pondId,
            detail,
            documentIds,
        }: {
            pondId: string;
            detail: ICleanRenovationDetail;
            documentIds?: string[];
        }) => cleanRenovationApi.create(pondId, detail, documentIds),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.cleanRenovations.byPond(pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
        },
    });
};

export const useUpdateCleanRenovation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            pondId,
            id,
            detail,
            documentIds,
        }: {
            pondId: string;
            id: string;
            detail: ICleanRenovationDetail;
            documentIds?: string[];
        }) => cleanRenovationApi.update(pondId, id, detail, documentIds),
        onSuccess: (_, { pondId, id }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.cleanRenovations.byPond(pondId),
            });
            queryClient.invalidateQueries({
                queryKey: farmKeys.cleanRenovations.detail(id),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
        },
    });
};

export const useDeleteCleanRenovation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, id }: { pondId: string; id: string }) =>
            cleanRenovationApi.delete(pondId, id),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.cleanRenovations.byPond(pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
        },
    });
};
