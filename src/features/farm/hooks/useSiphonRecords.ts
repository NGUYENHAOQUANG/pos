import { useMemo } from 'react';
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
import { useFarmMaterials } from '@/features/farm/hooks/useFarmMaterials';
import { siphonLogService } from '@/features/farm/services/work-log';

export const useSiphonMaterials = (_zoneId?: string) => {
    const { materials: allMaterials } = useFarmMaterials();

    const materials = useMemo(() => {
        if (!allMaterials.length) return [];

        return allMaterials.filter(m => {
            if (!m.group) return false;
            const name = m.group.toLowerCase();
            return name.includes('thiết bị điện') || name.includes('công cụ');
        });
    }, [allMaterials]);

    return { materials };
};

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

export const useSiphonDetail = (pondId?: string, siphonId?: string) => {
    return useQuery({
        queryKey: farmKeys.siphon.detail(siphonId || ''),
        queryFn: async () => {
            const response = await siphonApi.getDetail(pondId!, siphonId!);
            return response?.data as ISiphonRecord;
        },
        enabled: !!pondId && !!siphonId,
    });
};

export const useSiphonRecordsAsJobs = (pondId: string, params?: ISiphonParams) => {
    const { data, isFetching, error, refetch } = useSiphonRecords(pondId, params);

    const rawItems: ISiphonRecord[] = data?.data?.items || [];
    const jobs: JobExecution[] = siphonLogService.mapRecordsToJobs(rawItems);

    return { jobs, isLoading: isFetching, error, refetch };
};
export const useCreateSiphonRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ pondId, data }: { pondId: string; data: CreateSiphonCommand }) =>
            siphonApi.create(pondId, data),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({ queryKey: farmKeys.siphon.list(pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
            // Invalidate report charts
            queryClient.invalidateQueries({ queryKey: ['cost-donut'] });
            queryClient.invalidateQueries({ queryKey: ['report', 'profit-stats'] });
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
        onSuccess: (_, { pondId, id }) => {
            queryClient.invalidateQueries({ queryKey: farmKeys.siphon.list(pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.siphon.detail(id) });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
            // Invalidate report charts
            queryClient.invalidateQueries({ queryKey: ['cost-donut'] });
            queryClient.invalidateQueries({ queryKey: ['report', 'profit-stats'] });
        },
        onError: error => handleError(error),
    });
};

export const useDeleteSiphonRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ pondId, id }: { pondId: string; id: string }) =>
            siphonApi.delete(pondId, id),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({ queryKey: farmKeys.siphon.list(pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
            // Invalidate report charts
            queryClient.invalidateQueries({ queryKey: ['cost-donut'] });
            queryClient.invalidateQueries({ queryKey: ['report', 'profit-stats'] });
        },
        onError: error => handleError(error),
    });
};
