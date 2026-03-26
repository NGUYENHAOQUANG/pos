import { useQuery } from '@tanstack/react-query';
import { stockTransferApi } from '@/features/farm/api/stockTransferApi';
import { IStockTransferDetail } from '@/features/farm/types/stockTransfer.types';
import { POND_TYPES } from '@/features/farm/types/farm.types';

export type IncomingStockTransfer = {
    fromPondId: string;
    fromPondName: string;
    shrimpSizePcsPerKg?: number;
    quantity?: number;
    createdAt?: string;
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

                let result: IncomingStockTransfer | null = null;

                // ── 1. Incoming: toPondId === pondId & toCycleId === cycleId ──
                // Chỉ áp dụng cho Ao nuôi / Ao sẵn sàng (ao NHẬN)
                if (pondType === POND_TYPES.CULTIVATION || pondType === POND_TYPES.READY) {
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
                                    const fromPondName = detail.fromPoneName || transfer.fromPondId;
                                    result = {
                                        fromPondId: transfer.fromPondId,
                                        fromPondName,
                                        shrimpSizePcsPerKg: detail.shrimpSizePcsPerKg,
                                        quantity: matchingToPond.quantity,
                                        createdAt: transfer.createdAt,
                                    };
                                }
                            } catch {
                                result = {
                                    fromPondId: transfer.fromPondId,
                                    fromPondName: transfer.fromPondId,
                                    shrimpSizePcsPerKg: transfer.shrimpSizePcsPerKg,
                                    quantity: matchingToPond.quantity,
                                    createdAt: transfer.createdAt,
                                };
                            }
                            break;
                        }
                    }
                }

                // ── 2. Outgoing: fromPondId === pondId & fromCycleId === cycleId ──
                // Áp dụng cho TẤT CẢ loại ao (vèo, nuôi, sẵn sàng)
                for (const transfer of transfers) {
                    if (transfer.fromPondId === pondId && transfer.fromCycleId === cycleId) {
                        try {
                            const detailRes = await stockTransferApi.getDetail(pondId, transfer.id);
                            const detail = detailRes?.data;
                            if (detail) {
                                if (result) {
                                    // Đã có incoming → bổ sung transferDetail
                                    result.transferDetail = detail;
                                } else {
                                    // Chưa có incoming → tạo mới với transferDetail
                                    result = {
                                        fromPondId: pondId,
                                        fromPondName: detail.fromPoneName || pondId,
                                        shrimpSizePcsPerKg: detail.shrimpSizePcsPerKg,
                                        quantity: transfer.totalStocking,
                                        createdAt: transfer.createdAt,
                                        transferDetail: detail,
                                    };
                                }
                            }
                        } catch {
                            if (!result) {
                                result = {
                                    fromPondId: pondId,
                                    fromPondName: pondId,
                                    shrimpSizePcsPerKg: transfer.shrimpSizePcsPerKg,
                                    quantity: transfer.totalStocking,
                                    createdAt: transfer.createdAt,
                                };
                            }
                        }
                        break;
                    }
                }

                return result;
            } catch (err) {
                console.error('Error fetching stock transfer:', err);
            }

            return null;
        },
        enabled: !!pondId && !!cycleId,
        staleTime: 5 * 60 * 1000,
    });
}
