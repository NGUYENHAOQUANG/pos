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
    TREATMENT_TYPE_LABELS,
} from '@/features/farm/types/waterTreatment.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { useFarmMaterials } from '@/features/farm/hooks/useFarmMaterials';
import { IMaterial } from '@/features/material/types/material.types';

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

    // Fetch material definitions for name lookup
    const { materialMap } = useFarmMaterials();

    // Count daily items for "Lần X" numbering
    const totalPerDay: Record<string, number> = {};
    rawItems.forEach((item: IWaterTreatmentRecord) => {
        const d = item.createdAt ? new Date(item.createdAt) : new Date();
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        totalPerDay[key] = (totalPerDay[key] || 0) + 1;
    });

    // Sort descending (newest first)
    const sortedItems = [...rawItems].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
    });

    const dayCounts: Record<string, number> = {};

    const jobs: JobExecution[] = sortedItems.map((item: IWaterTreatmentRecord) => {
        const dateObj = item.createdAt ? new Date(item.createdAt) : new Date();
        const dateKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;

        if (!dayCounts[dateKey]) dayCounts[dateKey] = 0;
        dayCounts[dateKey]++;
        const total = totalPerDay[dateKey] ?? dayCounts[dateKey];
        const dailyIndex = total - dayCounts[dateKey] + 1;

        // Map treatmentType enum to Vietnamese label
        const treatmentType = item.waterTreatmentDetail?.treatmentType;
        const treatmentLabel = treatmentType
            ? TREATMENT_TYPE_LABELS[treatmentType] || treatmentType
            : undefined;

        return {
            id: item.id,
            label: `Lần ${dailyIndex}`,
            date: item.createdAt,
            time: item.createdAt
                ? dateObj.toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                  })
                : '00:00',
            note: item.waterTreatmentDetail?.notes?.trim() || undefined,
            pondId: item.pondId,
            waterTreatmentType: treatmentLabel,
            materials: item.waterTreatmentDetail?.materials?.map(m => {
                const matDef = m.warehouseItemId ? materialMap[m.warehouseItemId] : undefined;
                return {
                    material: {
                        id: m.warehouseItemId,
                        name: matDef?.name || 'Vật tư',
                        unitName: matDef?.unitName || '',
                    } as IMaterial,
                    quantity: m.quantity,
                    unit: matDef?.unitName || '',
                };
            }),
            images: item.documentIds || [],
            documentIds: item.documentIds || [],
        };
    });

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
        },
    });
};
