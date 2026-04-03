/**
 * @file useWaterTreatmentRecords.ts
 * @description React Query hooks for Water Treatment API (Xử lý nước)
 * Follows same pattern as useWaterChangeRecords.ts
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { waterTreatmentApi } from '@/features/farm/api/waterTreatmentApi';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import {
    IWaterTreatmentParams,
    IWaterTreatmentRecord,
    CreateWaterTreatmentCommand,
    UpdateWaterTreatmentCommand,
} from '@/features/farm/types/waterTreatment.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { waterTreatmentLogService } from '@/features/farm/services/work-log';

// --- Query Hooks ---

/** Fetch paginated list of water treatment records */
export const useWaterTreatmentRecords = (pondId: string, params?: IWaterTreatmentParams) => {
    return useQuery({
        queryKey: farmKeys.waterTreatment.list(pondId, params),
        queryFn: async () => {
            const response = await waterTreatmentApi.getAll(pondId, params);
            return response;
        },
        enabled: !!pondId,
    });
};

/** Fetch & transform water treatment records to JobExecution[] for LogScreen */
export const useWaterTreatmentRecordsAsJobs = (pondId: string, params?: IWaterTreatmentParams) => {
    const { data: listData, isLoading, error, refetch } = useWaterTreatmentRecords(pondId, params);

    // Extract items from API response
    const responseData = listData?.data;
    const rawItems: IWaterTreatmentRecord[] = Array.isArray(responseData)
        ? responseData
        : responseData?.items || [];

    const jobs: JobExecution[] = waterTreatmentLogService.mapRecordsToJobs(rawItems);

    return { jobs, isLoading, error, refetch };
};

// --- Mutation Hooks ---

/** Create a new water treatment record */
export const useCreateWaterTreatment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ pondId, data }: { pondId: string; data: CreateWaterTreatmentCommand }) =>
            waterTreatmentApi.create(pondId, data),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({ queryKey: farmKeys.waterTreatment.list(pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
            // Invalidate report charts
            queryClient.invalidateQueries({ queryKey: ['cost-donut'] });
            queryClient.invalidateQueries({ queryKey: ['report', 'profit-stats'] });
        },
    });
};

/** Update an existing water treatment record */
export const useUpdateWaterTreatment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            pondId,
            id,
            data,
        }: {
            pondId: string;
            id: string;
            data: UpdateWaterTreatmentCommand;
        }) => waterTreatmentApi.update(pondId, id, data),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({ queryKey: farmKeys.waterTreatment.list(pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
            // Invalidate report charts
            queryClient.invalidateQueries({ queryKey: ['cost-donut'] });
            queryClient.invalidateQueries({ queryKey: ['report', 'profit-stats'] });
        },
    });
};

/** Delete a water treatment record */
export const useDeleteWaterTreatment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ pondId, id }: { pondId: string; id: string }) =>
            waterTreatmentApi.delete(pondId, id),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({ queryKey: farmKeys.waterTreatment.list(pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
            // Invalidate report charts
            queryClient.invalidateQueries({ queryKey: ['cost-donut'] });
            queryClient.invalidateQueries({ queryKey: ['report', 'profit-stats'] });
        },
    });
};
