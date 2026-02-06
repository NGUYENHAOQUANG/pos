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

export const useCleanRenovations = (pondId: string, params?: ICleanRenovationParams) => {
    return useQuery({
        queryKey: farmKeys.cleanRenovations.byPond(pondId, params),
        queryFn: () => cleanRenovationApi.getAll(pondId, params),
        enabled: !!pondId,
    });
};

export const useCleanRenovationsAsJobs = (pondId: string, params?: ICleanRenovationParams) => {
    const { data, isLoading: isQueryLoading, error, refetch } = useCleanRenovations(pondId, params);
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

                // Sort by createdAt ascending to ensure correct daily numbering
                const sortedItems = [...rawItems].sort((a, b) => {
                    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return timeA - timeB;
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
                        const dailyIndex = dayCounts[dateKey];

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
                            materials: item.detail?.materials?.map(m => ({
                                material: {
                                    id: m.warehouseItemId,
                                    name: 'Vật tư',
                                    group: '' as any,
                                    unit: '',
                                },
                                quantity: m.quantity,
                                unit: '',
                            })),
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
    }, [data]);

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
        },
    });
};
