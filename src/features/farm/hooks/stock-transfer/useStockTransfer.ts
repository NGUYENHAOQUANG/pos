import { useQuery } from '@tanstack/react-query';
import { stockTransferApi } from '@/features/farm/api/stockTransferApi';

export type IncomingStockTransfer = {
    fromPondId: string;
    fromPondName: string;
    shrimpSizePcsPerKg?: number;
    quantity?: number;
};

type ZonePond = { id: string; name: string };

/**
 * Fetches stock transfers from all zone ponds and returns the incoming transfer
 * to the current pond (transfer where this pond is in toPonds).
 */
export function useIncomingStockTransfer(pondId: string | undefined, zonePonds: ZonePond[]) {
    return useQuery({
        queryKey: ['incoming-stock-transfer', pondId, zonePonds.length],
        queryFn: async (): Promise<IncomingStockTransfer | null> => {
            if (!pondId || zonePonds.length === 0) return null;

            for (const zonePond of zonePonds) {
                if (zonePond.id === pondId) continue;

                try {
                    const response = await stockTransferApi.getList(zonePond.id, {
                        PageSize: 100,
                        OrderBy: 'CreatedAt desc',
                    });

                    const transfers = response?.data?.items || [];

                    for (const transfer of transfers) {
                        const matchingToPond = transfer.toPonds?.find(
                            (tp: { toPondId: string }) => tp.toPondId === pondId
                        );
                        if (matchingToPond) {
                            return {
                                fromPondId: transfer.fromPondId,
                                fromPondName: zonePond.name,
                                shrimpSizePcsPerKg: transfer.shrimpSizePcsPerKg,
                                quantity: matchingToPond.quantity,
                            };
                        }
                    }
                } catch {
                    // ignore
                }
            }
            return null;
        },
        enabled: !!pondId && zonePonds.length > 0,
        staleTime: 5 * 60 * 1000,
    });
}
