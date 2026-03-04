import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cleanRenovationApi } from '@/features/farm/api/cleanRenovationApi';
import { documentApi } from '@/features/material/api/documentApi';
import { farmKeys } from './farmKeys';
import {
    ICleanRenovationParams,
    ICleanRenovationDetail,
} from '@/features/farm/types/cleanRenovation.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { useFarmMaterials } from '@/features/farm/hooks/useFarmMaterials';

export const useCleanRenovations = (pondId: string, params?: ICleanRenovationParams) => {
    return useQuery({
        queryKey: farmKeys.cleanRenovations.byPond(pondId, params),
        queryFn: () => cleanRenovationApi.getAll(pondId, params),
        enabled: !!pondId,
    });
};

export const useCleanRenovationsAsJobs = (pondId: string, params?: ICleanRenovationParams) => {
    const { data, isLoading: isQueryLoading, error, refetch } = useCleanRenovations(pondId, params);
    const { materialMap } = useFarmMaterials();
    const [jobs, setJobs] = useState<JobExecution[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const processData = async () => {
            if (!data?.data?.items) {
                setJobs([]);
                return;
            }

            setIsProcessing(true);
            try {
                const rawItems = data.data.items;

                // Count daily items
                const totalPerDay: Record<string, number> = {};
                rawItems.forEach((item: any) => {
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

                const processedJobs = await Promise.all(
                    sortedItems.map(async item => {
                        const dateObj = item.createdAt ? new Date(item.createdAt) : new Date();
                        const dateKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;

                        if (!dayCounts[dateKey]) {
                            dayCounts[dateKey] = 0;
                        }
                        dayCounts[dateKey]++;
                        const total = totalPerDay[dateKey] ?? dayCounts[dateKey];
                        const dailyIndex = total - dayCounts[dateKey] + 1;

                        let imageUrls: string[] = [];

                        // Prefer documents with publicUrl if available
                        if (item.documents && item.documents.length > 0) {
                            imageUrls = item.documents
                                .map((doc: { publicUrl?: string }) => doc.publicUrl)
                                .filter((url: string | undefined): url is string => !!url);
                        } else if (item.documentIds && item.documentIds.length > 0) {
                            // Fallback: resolve URLs from documentIds via documentApi.getUrl
                            imageUrls = await documentApi.getUrls(item.documentIds);
                        }
                        return {
                            id: item.id,
                            createdAt: item.createdAt,
                            label: `Lần ${dailyIndex}`,
                            date: item.createdAt,
                            time: item.createdAt
                                ? new Date(item.createdAt).toLocaleTimeString('en-GB', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                  })
                                : '00:00',
                            note: item.detail?.notes || undefined,
                            pondId: item.pondId,
                            images: imageUrls,
                            meta: {
                                ...item.detail,
                                images: imageUrls,
                                documentIds: item.documentIds || [],
                            },
                            materials: item.detail?.materials?.map(m => {
                                const mat = materialMap[m.warehouseItemId];
                                return {
                                    material: {
                                        id: m.warehouseItemId,
                                        name: mat?.name || 'Vật tư',
                                        group: (mat?.group as any) || '',
                                        unit: mat?.unitName || '',
                                    },
                                    quantity: m.quantity,
                                    unit: mat?.unitName || '',
                                };
                            }),
                        };
                    })
                );

                setJobs(processedJobs);
            } catch (_err) {
                setJobs([]);
            } finally {
                setIsProcessing(false);
            }
        };

        processData();
    }, [data, materialMap]);

    return { jobs, isLoading: isQueryLoading || isProcessing, error, refetch };
};

export const useCleanRenovation = (pondId: string, id: string) => {
    return useQuery({
        queryKey: farmKeys.cleanRenovations.detail(id),
        queryFn: () => cleanRenovationApi.getById(pondId, id),
        enabled: !!pondId && !!id,
    });
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
        },
    });
};
