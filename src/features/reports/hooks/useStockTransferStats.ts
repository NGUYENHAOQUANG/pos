/**
 * @file useStockTransferStats.ts
 * @description hook for stock transfer stats
 * @author Antigravity
 * @created 2026-03-09
 */
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';
import { StockTransferStatsParams } from '../types/stock-transfer-stats';

export const useStockTransferStats = (params: StockTransferStatsParams) => {
    return useQuery({
        queryKey: [
            'report',
            'stock-transfer-stats',
            params.ZoneId,
            params.Id,
            params.CycleId,
            params.StartDate,
            params.EndDate,
            params.PageNumber,
            params.PageSize,
        ],
        queryFn: () => {
            if (!params.ZoneId) throw new Error('ZoneId is required');
            return reportApi.getStockTransferStats(params);
        },
        enabled: !!params.ZoneId,
    });
};
