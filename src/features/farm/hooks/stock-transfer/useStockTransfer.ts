import { useQuery } from '@tanstack/react-query';
import { stockTransferApi } from '@/features/farm/api/stockTransferApi';

export type IncomingStockTransfer = {
    fromPondId: string;
    fromPondName: string;
    shrimpSizePcsPerKg?: number;
    quantity?: number;
};

// type ZonePond = { id: string; name: string };

/**
 * Fetches stock transfers from all zone ponds and returns the incoming transfer
 * to the current pond (transfer where this pond is in toPonds).
 */
export function useIncomingStockTransfer(pondId: string | undefined) {
    return useQuery({
        queryKey: ['incoming-stock-transfer', pondId],
        queryFn: async (): Promise<IncomingStockTransfer | null> => {
            if (pondId) {
                try {
                    await stockTransferApi.getList(pondId, {
                        PageSize: 100,
                        OrderBy: 'CreatedAt desc',
                    });
                } catch {
                    // ignore
                }
            }
            return null;
        },
        enabled: !!pondId,
        staleTime: 5 * 60 * 1000,
    });
}
