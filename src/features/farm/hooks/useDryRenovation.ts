import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dryRenovationApi } from '@/features/farm/api/dryRenovationApi';
import { documentApi } from '@/features/material/api/documentApi';
import { farmKeys } from './farmKeys';
import {
    IDryRenovationParams,
    IDryRenovationDetail,
} from '@/features/farm/types/dryRenovation.types';
import { JobExecution } from '@/features/farm/types/farm.types';

export const useDryRenovations = (pondId: string, params?: IDryRenovationParams) => {
    return useQuery({
        queryKey: farmKeys.dryRenovations.byPond(pondId, params),
        queryFn: () => dryRenovationApi.getAll(pondId, params),
        enabled: !!pondId,
    });
};

export const useDryRenovationsAsJobs = (pondId: string, params?: IDryRenovationParams) => {
    const { data, isLoading: isQueryLoading, error, refetch } = useDryRenovations(pondId, params);
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

                // Sort by createdAt ascending
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

                        if (item.documents && item.documents.length > 0) {
                            imageUrls = item.documents
                                .map((doc: { publicUrl?: string }) => doc.publicUrl)
                                .filter((url: string | undefined): url is string => !!url);
                        } else if (item.documentIds && item.documentIds.length > 0) {
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
                            note: item.dryRenovationDetail?.notes || undefined,
                            pondId: item.pondId,
                            images: imageUrls,
                            meta: {
                                ...item.dryRenovationDetail,
                                images: imageUrls,
                                documentIds: item.documentIds || [],
                            },
                            materials: item.dryRenovationDetail?.materials?.map(m => ({
                                material: {
                                    id: m.warehouseItemId,
                                    name: 'Vật tư', // Name resolution requires warehouse item lookup
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

export const useDryRenovation = (pondId: string, id: string) => {
    return useQuery({
        queryKey: farmKeys.dryRenovations.detail(id),
        queryFn: () => dryRenovationApi.getById(pondId, id),
        enabled: !!pondId && !!id,
    });
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
        }) => {
            console.log('Update Dry Renovation Payload:', {
                pondId,
                id,
                detail,
                documentIds,
            });
            return dryRenovationApi.update(pondId, id, detail, documentIds);
        },
        onSuccess: (_, { pondId, id }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.dryRenovations.byPond(pondId),
            });
            queryClient.invalidateQueries({
                queryKey: farmKeys.dryRenovations.detail(id),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
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
        },
    });
};
