import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sizeMeasurementApi } from '@/features/farm/api/sizeMeasurementApi';
import { documentApi } from '@/features/material/api/documentApi';
import { farmKeys } from './farmKeys';
import {
    ICreateSizeMeasurementReq,
    IUpdateSizeMeasurementReq,
    ISizeMeasurementParams,
} from '@/features/farm/types/sizeMeasurement.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { parseDate } from '@/features/farm/utils/dateUtils';

export const useSizeMeasurements = (pondId: string, params?: ISizeMeasurementParams) => {
    return useQuery({
        queryKey: farmKeys.sizeMeasurements.byPond(pondId, params),
        queryFn: () => sizeMeasurementApi.getAll(pondId, params),
        enabled: !!pondId,
    });
};

export const useSizeMeasurementsAsJobs = (
    pondId: string | undefined,
    params?: ISizeMeasurementParams
) => {
    const {
        data,
        isLoading: isQueryLoading,
        error,
        refetch,
    } = useSizeMeasurements(pondId || '', params);
    const [jobs, setJobs] = useState<JobExecution[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const processData = async () => {
            if (data === undefined) return;

            if (!data?.data?.items) {
                setJobs([]);
                return;
            }

            setIsProcessing(true);
            try {
                const rawItems = data.data.items;

                // Count total occurrences per day
                const totalPerDay: Record<string, number> = {};
                rawItems.forEach((item: { createdAt?: string }) => {
                    const d = item.createdAt ? new Date(item.createdAt) : new Date();
                    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                    totalPerDay[key] = (totalPerDay[key] || 0) + 1;
                });

                // Sort descending (newest first), Lần 1 = oldest, Lần N = newest
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

                        if (!dayCounts[dateKey]) dayCounts[dateKey] = 0;
                        dayCounts[dateKey]++;
                        const total = totalPerDay[dateKey] ?? dayCounts[dateKey];
                        const dailyIndex = total - dayCounts[dateKey] + 1;

                        let imageUrls: string[] = [];

                        // Prefer documents with publicUrl if available
                        if (item.documents && item.documents.length > 0) {
                            imageUrls = item.documents
                                .map(doc => doc.publicUrl)
                                .filter((url): url is string => !!url);
                        } else if (item.documentIds && item.documentIds.length > 0) {
                            // Fallback: resolve URLs from documentIds via documentApi.getUrl
                            imageUrls = await documentApi.getUrls(item.documentIds);
                        }
                        const sizeDetail = item.sizeMeasurementDetail ?? item.sizeMeasurement;
                        return {
                            id: item.id,
                            label: `Lần ${dailyIndex}`,
                            date: item.createdAt,
                            createdAt: item.createdAt,
                            time: item.createdAt
                                ? new Date(item.createdAt).toLocaleTimeString('en-GB', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                  })
                                : '00:00',
                            note: sizeDetail?.notes || undefined,
                            pondId: item.pondId,
                            images: imageUrls,
                            meta: {
                                shrimpSize: sizeDetail?.shrimpSizePcsPerKg?.toString(),
                                remainingWeight: sizeDetail?.estimatedRemainingStockKg?.toString(),
                                totalShrimpCount: sizeDetail?.totalShrimpCount || null,
                                survivalRate: sizeDetail?.survivalRatePercentage || null,
                                averageShrimpSize: sizeDetail?.averageShrimpSize ?? null,
                                notes: sizeDetail?.notes,
                                images: imageUrls,
                                documentIds: item.documentIds || [],
                            },
                        };
                    })
                );

                // Card: slice(0, 3) = 3 newest, display old->new. Sort ascending.
                const getItemTime = (x: JobExecution) => {
                    if (x.createdAt) return new Date(x.createdAt).getTime();
                    try {
                        const dateStr = (x as any).date || '';
                        const timeStr = x.time || '00:00';
                        const combined =
                            typeof dateStr === 'string' && dateStr.includes(' ')
                                ? dateStr
                                : `${dateStr} ${timeStr}`.trim();
                        if (!combined) return 0;
                        return parseDate(combined).getTime();
                    } catch {
                        return 0;
                    }
                };
                const sortedDesc = [...processedJobs].sort(
                    (a, b) => getItemTime(b) - getItemTime(a)
                );

                setJobs(sortedDesc);
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

export const useSizeMeasurement = (pondId: string, id: string) => {
    return useQuery({
        queryKey: farmKeys.sizeMeasurements.detail(id),
        queryFn: () => sizeMeasurementApi.getDetail(pondId, id),
        enabled: !!pondId && !!id,
    });
};

export const useCreateSizeMeasurement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, data }: { pondId: string; data: ICreateSizeMeasurementReq }) =>
            sizeMeasurementApi.create(pondId, data),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.sizeMeasurements.byPond(pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
        },
    });
};

export const useUpdateSizeMeasurement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            pondId,
            id,
            data,
        }: {
            pondId: string;
            id: string;
            data: IUpdateSizeMeasurementReq;
        }) => sizeMeasurementApi.update(pondId, id, data),
        onSuccess: (data, { pondId, id }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.sizeMeasurements.byPond(pondId),
            });
            queryClient.invalidateQueries({
                queryKey: farmKeys.sizeMeasurements.detail(id),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
        },
    });
};

export const useDeleteSizeMeasurement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, id }: { pondId: string; id: string }) =>
            sizeMeasurementApi.delete(pondId, id),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.sizeMeasurements.byPond(pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
        },
    });
};
