import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stockTransferApi } from '../api/stockTransferApi';
import {
    CreateStockTransferRequest,
    GetStockTransfersParams,
    IStockTransfer,
    IStockTransferToPond,
} from '../types/stockTransfer.types';
import { showSuccessToast, showErrorToast } from '@/features/material/utils/validationToast';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import { JobExecution } from '@/features/farm/types/farm.types';
import { handleError } from '@/shared/utils/errorHandler';

const KEYS = {
    list: (pondId: string, params?: GetStockTransfersParams) => ['stock-transfers', pondId, params],
    detail: (pondId: string, id: string) => ['stock-transfer', pondId, id],
};

export const useStockTransfers = (pondId: string, params?: GetStockTransfersParams) => {
    return useQuery({
        queryKey: KEYS.list(pondId, params),
        queryFn: async () => {
            const { data } = await stockTransferApi.getList(pondId, {
                ...params,
                Page: 1,
                PageSize: 50,
            });
            return data;
        },
        enabled: !!pondId,
    });
};

export const useStockTransfersAsJobs = (pondId: string, params?: GetStockTransfersParams) => {
    const { data, isLoading, error, refetch } = useStockTransfers(pondId, params);

    const jobs = useMemo((): JobExecution[] => {
        if (!data?.items) return [];

        const rawItems = data.items;

        // Count occurrences per day
        const totalPerDay: Record<string, number> = {};
        rawItems.forEach((item: IStockTransfer) => {
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

        const processedJobs: JobExecution[] = sortedItems.map((item: IStockTransfer) => {
            const dateObj = item.createdAt ? new Date(item.createdAt) : new Date();
            const dateKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;

            if (!dayCounts[dateKey]) dayCounts[dateKey] = 0;
            dayCounts[dateKey]++;
            const total = totalPerDay[dateKey] ?? dayCounts[dateKey];
            const dailyIndex = total - dayCounts[dateKey] + 1;

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
                note: item.notes || undefined,
                pondId: item.fromPondId,
                meta: {
                    shrimpSize: item.shrimpSizePcsPerKg?.toString(),
                    transferMethod: 'Sang hết',
                    receivingPonds:
                        item.toPonds?.map((tp: IStockTransferToPond) => ({
                            id: tp.toPondId,
                            receivingPond: tp.toPondId,
                            quantity: tp.quantity.toString(),
                        })) || [],
                },
            };
        });

        // Sort ascending for card UI (oldest first, newest at end)
        return [...processedJobs].sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeA - timeB;
        });
    }, [data]);

    return { jobs, isLoading, error, refetch };
};

export const useStockTransferDetail = (pondId: string, id: string) => {
    return useQuery({
        queryKey: KEYS.detail(pondId, id),
        queryFn: async () => {
            const response = await stockTransferApi.getDetail(pondId, id);
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.message || 'Không thể tải chi tiết sang ao');
        },
        enabled: !!pondId && !!id,
    });
};

export const useCreateStockTransfer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            pondId,
            data,
        }: {
            pondId: string;
            data: CreateStockTransferRequest;
            zoneId?: string;
        }) => stockTransferApi.create(pondId, data),
        onSuccess: (_, variables) => {
            showSuccessToast('Đã sang ao thành công');
            queryClient.invalidateQueries({ queryKey: KEYS.list(variables.pondId) });
            queryClient.invalidateQueries({
                queryKey: farmKeys.ponds.byZone(variables.zoneId || 'all'),
            });
            // Invalidate cycles for receiving ponds
            if (variables.data.toPonds) {
                variables.data.toPonds.forEach(p => {
                    queryClient.invalidateQueries({ queryKey: farmKeys.cycles.byPond(p.toPondId) });
                });
                // Invalidate all pond queries to refresh pond list
                queryClient.invalidateQueries({ queryKey: farmKeys.ponds.all() });
            }
        },
        onError: error => handleError(error),
    });
};

export const useDeleteStockTransfer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, id }: { pondId: string; id: string }) =>
            stockTransferApi.delete(pondId, id),
        onSuccess: (_, variables) => {
            showSuccessToast('Đã xoá phiếu sang ao');
            queryClient.invalidateQueries({ queryKey: KEYS.list(variables.pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
        },
        onError: error => {
            const message = getErrorMessage(error, 'Xoá phiếu sang ao thất bại');
            showErrorToast(message);
        },
    });
};
