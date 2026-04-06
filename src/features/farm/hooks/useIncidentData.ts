import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { incidentApi } from '@/features/farm/api/incidentApi';
import { farmKeys } from './farmKeys';
import type {
    CreateIncidentPayload,
    UpdateIncidentPayload,
    GetIncidentListParams,
    IncidentListItem,
} from '@/features/farm/types/incident.types';
import { JobExecution } from '@/features/farm/types/farm.types';

import { incidentLogService } from '@/features/farm/services/work-log';

export const useCreateIncident = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            pondId,
            payload,
        }: {
            pondId: string;
            payload: CreateIncidentPayload;
        }) => incidentApi.create(pondId, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.incident.byPond(variables.pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
        },
    });
};

/** Delete incident (DELETE /pond/{pondId}/incident/{id}) */
export const useDeleteIncident = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ pondId, id }: { pondId: string; id: string }) =>
            incidentApi.delete(pondId, id),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.incident.byPond(variables.pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
        },
    });
};

/** Update incident (PATCH /pond/{pondId}/incident/{id}) */
export const useUpdateIncident = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            pondId,
            id,
            payload,
        }: {
            pondId: string;
            id: string;
            payload: UpdateIncidentPayload;
        }) => incidentApi.update(pondId, id, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.incident.byPond(variables.pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
        },
    });
};

/** Fetch incident list by pond (GET /pond/{pondId}/incident) */
export const useIncidentList = (pondId: string, params?: GetIncidentListParams) => {
    return useQuery({
        queryKey: [...farmKeys.incident.byPond(pondId), params],
        queryFn: () => incidentApi.list(pondId, params),
        enabled: !!pondId,
    });
};

export const useIncidentsAsJobs = (pondId: string, params?: GetIncidentListParams) => {
    const { data, isLoading, error, refetch, isRefetching } = useIncidentList(pondId, params);

    const rawItems: IncidentListItem[] = data?.data?.items ?? [];

    const jobs: JobExecution[] = incidentLogService.mapRecordsToJobs(rawItems);

    return { jobs, isLoading, error, refetch, isRefetching };
};
