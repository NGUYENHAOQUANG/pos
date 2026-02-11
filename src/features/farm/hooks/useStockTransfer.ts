import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stockTransferApi } from '../api/stockTransferApi';
import { CreateStockTransferRequest, GetStockTransfersParams } from '../types/stockTransfer.types';
import { showSuccessToast, showErrorToast } from '@/features/material/utils/validationToast';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import { JobExecution } from '@/features/farm/types/farm.types';
import { parseDate } from '@/features/farm/utils/dateUtils';

const KEYS = {
    list: (pondId: string, params?: GetStockTransfersParams) => ['stock-transfers', pondId, params],
    detail: (pondId: string, id: string) => ['stock-transfer', pondId, id],
};

export const useStockTransfers = (pondId: string, params?: GetStockTransfersParams) => {
    return useQuery({
        queryKey: KEYS.list(pondId, params),
        queryFn: async () => {
            const response = await stockTransferApi.getList(pondId, {
                ...params,
                Page: 1,
                PageSize: 100, // Fetch first 100 items
            });

            // Handle both 'success' and 'isSuccess' from backend
            const isSuccess = response.success || (response as any).isSuccess;
            if (isSuccess && response.data) {
                return response.data;
            }
            throw new Error(response.message || 'Không thể tải danh sách sang ao');
        },
        enabled: !!pondId,
    });
};

export const useStockTransfersAsJobs = (pondId: string, params?: GetStockTransfersParams) => {
    const { data, isLoading: isQueryLoading, error, refetch } = useStockTransfers(pondId, params);
    const [jobs, setJobs] = useState<JobExecution[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const processData = async () => {
            if (!data?.items) {
                setJobs([]);
                return;
            }

            setIsProcessing(true);
            try {
                const rawItems = data.items;

                // Đếm tổng số lượt mỗi ngày
                const totalPerDay: Record<string, number> = {};
                rawItems.forEach((item: any) => {
                    const d = item.createdAt ? new Date(item.createdAt) : new Date();
                    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                    totalPerDay[key] = (totalPerDay[key] || 0) + 1;
                });

                // Sắp xếp giảm dần (mới nhất trước)
                const sortedItems = [...rawItems].sort((a, b) => {
                    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return timeB - timeA;
                });

                const dayCounts: Record<string, number> = {};

                const processedJobs: JobExecution[] = sortedItems.map((item: any) => {
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
                                item.toPonds?.map((tp: any) => ({
                                    id: tp.toPondId,
                                    receivingPond: tp.toPondId,
                                    quantity: tp.quantity.toString(),
                                })) || [],
                        },
                    };
                });

                // Hiển thị cũ→mới (mới nhất ở cuối cho giao diện thẻ)
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
                const sortedAsc = [...processedJobs].sort(
                    (a, b) => getItemTime(a) - getItemTime(b)
                );

                setJobs(sortedAsc);
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
            showSuccessToast('Tạo phiếu sang ao thành công');
            queryClient.invalidateQueries({ queryKey: KEYS.list(variables.pondId) });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({
                queryKey: farmKeys.ponds.byZone(variables.zoneId || 'all'),
            });
        },
        onError: error => {
            const message = getErrorMessage(error, 'Tạo phiếu sang ao thất bại');
            showErrorToast(message);
        },
    });
};
