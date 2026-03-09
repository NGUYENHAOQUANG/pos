import { useQuery } from '@tanstack/react-query';
import { stockTransferApi } from '@/features/farm/api/stockTransferApi';
import { IStockTransferDetail } from '@/features/farm/types/stockTransfer.types';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { apiClient } from '@/core/api/client';

export type IncomingStockTransfer = {
    fromPondId: string;
    fromPondName: string;
    shrimpSizePcsPerKg?: number;
    quantity?: number;
};

export function useIncomingStockTransfer(zoneId: string | undefined, pondId: string | undefined) {
    return useQuery({
        queryKey: ['incoming-stock-transfer', zoneId, pondId],
        queryFn: async (): Promise<IncomingStockTransfer | null> => {
            if (pondId) {
                try {
                    await stockTransferApi.getList(pondId, {
                        PageSize: 100,
                        OrderBy: 'CreatedAt desc',
                    });
                } catch {}

                if (zoneId) {
                    try {
                        const pondsRes = await apiClient.get<{ data: { items: any[] } }>(
                            API_ENDPOINTS.ZONE.PONDS(zoneId),
                            { params: { PageSize: 100 } }
                        );

                        const ponds = pondsRes.data?.data?.items || [];

                        for (const pond of ponds) {
                            if (pond.id === pondId) continue;

                            try {
                                const transferRes = await stockTransferApi.getList(pond.id, {
                                    PageSize: 100,
                                    OrderBy: 'CreatedAt desc',
                                });

                                const transfers = transferRes?.data?.items || [];
                                for (const transfer of transfers) {
                                    const isToThisPond = transfer.toPonds?.some(
                                        (tp: any) => tp.toPondId === pondId
                                    );
                                    if (isToThisPond) {
                                        try {
                                            const detailRes = await stockTransferApi.getDetail(
                                                pond.id,
                                                transfer.id
                                            );
                                            const detail = detailRes?.data;
                                            if (detail) {
                                                const targetToPond = detail.toPonds?.find(
                                                    tp => tp.toPondId === pondId
                                                );
                                                return {
                                                    fromPondId: pond.id,
                                                    fromPondName: pond.name || transfer.fromPondId,
                                                    shrimpSizePcsPerKg: detail.shrimpSizePcsPerKg,
                                                    quantity: targetToPond?.quantity,
                                                };
                                            }
                                        } catch {
                                            return {
                                                fromPondId: pond.id,
                                                fromPondName: pond.name || transfer.fromPondId,
                                                shrimpSizePcsPerKg: transfer.shrimpSizePcsPerKg,
                                            };
                                        }
                                    }
                                }
                            } catch {
                                continue;
                            }
                        }
                    } catch (err) {
                        console.error('Error fetching fallback incoming transfer:', err);
                    }
                }
            }
            return null;
        },
        enabled: !!pondId && !!zoneId,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetches a single stock transfer detail by pondId and transferId.
 * Returns full pond, cycle, and toPonds[].pond data.
 */
export function useStockTransferDetail(pondId: string | undefined, transferId: string | undefined) {
    return useQuery<IStockTransferDetail>({
        queryKey: ['stock-transfer-detail', pondId, transferId],
        queryFn: async () => {
            const { data } = await stockTransferApi.getDetail(pondId!, transferId!);
            return data;
        },
        enabled: !!pondId && !!transferId,
        staleTime: 5 * 60 * 1000,
    });
}
