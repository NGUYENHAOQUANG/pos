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
import { formatDate } from '@/features/farm/utils/dateUtils';

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
        },
    });
};

/** Fetch incident detail by id (GET /pond/{pondId}/incident/{id}) – cho màn chỉnh sửa */
export const useIncidentDetail = (pondId: string, incidentId: string | undefined) => {
    return useQuery({
        queryKey: [...farmKeys.incident.byPond(pondId || ''), 'detail', incidentId],
        queryFn: () => incidentApi.getDetail(pondId, incidentId!),
        enabled: !!pondId && !!incidentId,
    });
};

/** Xóa incident (DELETE /pond/{pondId}/incident/{id}) */
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
        },
    });
};

/** Cập nhật incident (PATCH /pond/{pondId}/incident/{id}) */
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

/** Map incident list API to JobExecution[] for card display (Xử lý sự cố) and log screen */
export const useIncidentsAsJobs = (pondId: string, params?: GetIncidentListParams) => {
    const { data, isLoading, error, refetch, isRefetching } = useIncidentList(pondId, params);

    const rawItems: IncidentListItem[] = data?.data?.items ?? [];
    // Sort by createdAt ascending so daily index is correct (Lần 1, 2, ... per day)
    const sortedItems = [...rawItems].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
    });

    const dayCounts: Record<string, number> = {};
    const jobs: JobExecution[] = sortedItems.map(item => {
        const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
        const dateKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}-${createdDate.getDate()}`;
        if (!dayCounts[dateKey]) dayCounts[dateKey] = 0;
        dayCounts[dateKey]++;
        const dailyIndex = dayCounts[dateKey];

        const timeStr = createdDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
        const dateStr = formatDate(createdDate);
        return {
            id: item.id,
            label: `Lần ${dailyIndex}`,
            time: timeStr,
            date: dateStr,
            note: item.detail?.notes ?? undefined,
            pondId: item.pondId,
            materials: item.detail?.materials?.map(m => ({
                material: {
                    id: m.warehouseItemId,
                    name: 'Vật tư',
                    unitName: '',
                } as any,
                quantity: m.quantity,
                unit: '',
            })),
            documentIds: item.documentIds,
            images: item.documentIds ?? [],
            createdAt: item.createdAt,
        };
    });

    return { jobs, isLoading, error, refetch, isRefetching };
};
