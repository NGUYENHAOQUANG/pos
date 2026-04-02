import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmKeys } from './farmKeys';
import { shrimpHealthCheckApi } from '@/features/farm/api/shrimpHealthCheckApi';
import type {
    CreateShrimpHealthCheckPayload,
    UpdateShrimpHealthCheckPayload,
    IShrimpHealthListParams,
} from '@/features/farm/types/shrimpHealthCheck.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { shrimpHealthLogService } from '@/features/farm/services/work-log';
import { handleError } from '@/shared/utils/errorHandler';

/**
 * Hook to fetch shrimp health checks as JobExecution list (for cards)
 */
export const useShrimpHealthChecksAsJobs = (pondId: string, params?: IShrimpHealthListParams) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [...farmKeys.shrimpHealthChecks.byPond(pondId), params],
        queryFn: async () => {
            if (!pondId) {
                throw new Error('No pondId provided');
            }
            return await shrimpHealthCheckApi.list(pondId, params);
        },
        enabled: !!pondId,
        staleTime: 30000,
        gcTime: 5 * 60 * 1000,
    });

    const rawItems = data?.data?.items || [];
    const jobs: JobExecution[] = shrimpHealthLogService.mapRecordsToJobs(rawItems).map(job => ({
        ...job,
        pondId: pondId, // enforce pondId
    }));

    return { jobs, isLoading, error, refetch };
};

export const useCreateShrimpHealthCheck = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            pondId,
            payload,
        }: {
            pondId: string;
            payload: CreateShrimpHealthCheckPayload;
        }) => {
            return await shrimpHealthCheckApi.create(pondId, payload);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.shrimpHealthChecks.byPond(variables.pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
        },
        onError: handleError,
    });
};

export const useUpdateShrimpHealthCheck = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            pondId,
            id,
            payload,
        }: {
            pondId: string;
            id: string;
            payload: UpdateShrimpHealthCheckPayload;
        }) => {
            return await shrimpHealthCheckApi.update(pondId, id, payload);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.shrimpHealthChecks.byPond(variables.pondId),
            });
            queryClient.invalidateQueries({
                queryKey: farmKeys.shrimpHealthChecks.detail(variables.id),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
        },
        onError: handleError,
    });
};

export const useDeleteShrimpHealthCheck = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ pondId, id }: { pondId: string; id: string }) => {
            return await shrimpHealthCheckApi.delete(pondId, id);
        },
        onSuccess: (_data, variables) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({
                queryKey: farmKeys.shrimpHealthChecks.byPond(variables.pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
        },
        onError: handleError,
    });
};

export const useShrimpHealthCheckDetail = (pondId: string, id: string) => {
    return useQuery({
        queryKey: farmKeys.shrimpHealthChecks.detail(id),
        queryFn: async () => {
            if (!pondId || !id) {
                throw new Error('Missing pondId or id');
            }
            return await shrimpHealthCheckApi.getDetail(pondId, id);
        },
        enabled: !!pondId && !!id,
        staleTime: 30000,
    });
};
