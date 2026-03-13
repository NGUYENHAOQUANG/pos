import { useQuery } from '@tanstack/react-query';
import { stockTransferApi } from '@/features/farm/api/stockTransferApi';
import { IStockTransferDetail } from '@/features/farm/types/stockTransfer.types';
import { POND_TYPES } from '@/features/farm/types/farm.types';

export type IncomingStockTransfer = {
    fromPondId: string;
    fromPondName: string;
    shrimpSizePcsPerKg?: number;
    quantity?: number;
    transferDetail?: IStockTransferDetail;
};

type PondTypeValue = (typeof POND_TYPES)[keyof typeof POND_TYPES];

interface UseIncomingStockTransferParams {
    pondId?: string;
    cycleId?: string;
    pondType?: PondTypeValue | string;
}

export function useIncomingStockTransfer({
    pondId,
    cycleId,
    pondType,
}: UseIncomingStockTransferParams) {
    return useQuery({
        queryKey: ['incoming-stock-transfer', pondId, cycleId, pondType],
        queryFn: async (): Promise<IncomingStockTransfer | null> => {
            if (!pondId || !cycleId) return null;

            try {
                const transferRes = await stockTransferApi.getList(pondId, {
                    PageSize: 50,
                    OrderBy: 'CreatedAt desc',
                });

                const transfers = transferRes?.data?.items || [];

                if (pondType === POND_TYPES.CULTIVATION || pondType === POND_TYPES.READY) {
                    // Ao nuôi: tìm transfer có toPondId === pondId & toCycleId === cycleId
                    for (const transfer of transfers) {
                        const matchingToPond = transfer.toPonds?.find(
                            (tp: any) => tp.toPondId === pondId && tp.toCycleId === cycleId
                        );
                        if (matchingToPond) {
                            try {
                                const detailRes = await stockTransferApi.getDetail(
                                    transfer.fromPondId,
                                    transfer.id
                                );
                                const detail = detailRes?.data;
                                if (detail) {
                                    const fromPondName = detail.pond?.name || transfer.fromPondId;
                                    return {
                                        fromPondId: transfer.fromPondId,
                                        fromPondName,
                                        shrimpSizePcsPerKg: detail.shrimpSizePcsPerKg,
                                        quantity: matchingToPond.quantity,
                                    };
                                }
                            } catch {
                                return {
                                    fromPondId: transfer.fromPondId,
                                    fromPondName: transfer.fromPondId,
                                    shrimpSizePcsPerKg: transfer.shrimpSizePcsPerKg,
                                    quantity: matchingToPond.quantity,
                                };
                            }
                        }
                    }
                } else if (pondType === POND_TYPES.NURSERY) {
                    // Ao vèo: tìm transfer có fromPondId === pondId & fromCycleId === cycleId
                    for (const transfer of transfers) {
                        if (transfer.fromPondId === pondId && transfer.fromCycleId === cycleId) {
                            try {
                                const detailRes = await stockTransferApi.getDetail(
                                    pondId,
                                    transfer.id
                                );
                                const detail = detailRes?.data;
                                if (detail) {
                                    return {
                                        fromPondId: pondId,
                                        fromPondName: detail.pond?.name || pondId,
                                        shrimpSizePcsPerKg: detail.shrimpSizePcsPerKg,
                                        quantity: transfer.totalStocking,
                                        transferDetail: detail,
                                    };
                                }
                            } catch {
                                return {
                                    fromPondId: pondId,
                                    fromPondName: pondId,
                                    shrimpSizePcsPerKg: transfer.shrimpSizePcsPerKg,
                                    quantity: transfer.totalStocking,
                                };
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching stock transfer:', err);
            }

            return null;
        },
        enabled: !!pondId && !!cycleId,
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
