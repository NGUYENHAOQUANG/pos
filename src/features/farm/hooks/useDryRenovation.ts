import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dryRenovationApi } from '@/features/farm/api/dryRenovationApi';

import { farmKeys } from '@/features/farm/hooks/farmKeys';
import {
    IDryRenovationParams,
    IDryRenovationDetail,
} from '@/features/farm/types/dryRenovation.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { dryRenovationLogService } from '@/features/farm/services/work-log';

export const useDryRenovations = (pondId: string, params?: IDryRenovationParams) => {
    return useQuery({
        queryKey: farmKeys.dryRenovations.byPond(pondId, params),
        queryFn: () => dryRenovationApi.getAll(pondId, params),
        enabled: !!pondId,
    });
};

export const useDryRenovationsAsJobs = (pondId: string, params?: IDryRenovationParams) => {
    const { data, isLoading, error, refetch } = useDryRenovations(pondId, params);

    const rawItems = data?.data?.items || [];
    const jobs: JobExecution[] = dryRenovationLogService.mapRecordsToJobs(rawItems);

    return { jobs, isLoading, error, refetch };
};

export const useCreateDryRenovation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            pondId,
            detail,
            documentIds,
        }: {
            pondId: string;
            detail: IDryRenovationDetail;
            documentIds?: string[];
        }) => dryRenovationApi.create(pondId, detail, documentIds),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.dryRenovations.byPond(pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
        },
    });
};

export const useUpdateDryRenovation = () => {
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
            detail: IDryRenovationDetail;
            documentIds?: string[];
        }) => dryRenovationApi.update(pondId, id, detail, documentIds),
        onSuccess: (_, { pondId, id }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.dryRenovations.byPond(pondId),
            });
            queryClient.invalidateQueries({
                queryKey: farmKeys.dryRenovations.detail(id),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
        },
    });
};

export const useDeleteDryRenovation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, id }: { pondId: string; id: string }) =>
            dryRenovationApi.delete(pondId, id),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.dryRenovations.byPond(pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
        },
    });
};
