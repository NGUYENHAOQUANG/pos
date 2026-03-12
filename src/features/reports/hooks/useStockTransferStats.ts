/**
 * @file useStockTransferStats.ts
 * @description Hooks for stock transfer stats (normal query + infinite scroll)
 */
import React from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';
import {
    StockTransferStatsParams,
    StockTransferRecordDto,
    TransferData,
} from '../types/stock-transfer-stats';
import { APP_CONFIG } from '@/shared/constants/config';
import { PondData } from '@/features/farm/types/pond.types';
import { formatDate } from '@/shared/utils/formatters';

// Standard query hook (kept for backward compatibility)
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

// Infinite scroll hook
interface UseInfiniteStockTransferParams {
    ZoneId: string;
    Id?: string;
    CycleId?: string;
    ponds?: PondData[];
    enabled?: boolean;
}

export const useInfiniteStockTransferStats = ({
    ZoneId,
    Id,
    CycleId,
    ponds,
    enabled = true,
}: UseInfiniteStockTransferParams) => {
    const pageSize = APP_CONFIG.DEFAULT_PAGE_SIZE;

    const query = useInfiniteQuery({
        queryKey: ['report', 'stock-transfer-stats', 'infinite', ZoneId, Id, CycleId],
        queryFn: async ({ pageParam = 1 }) => {
            if (!ZoneId) throw new Error('ZoneId is required');
            return reportApi.getStockTransferStats({
                ZoneId,
                Id,
                CycleId,
                PageNumber: pageParam,
                PageSize: pageSize,
            });
        },
        initialPageParam: 1,
        getNextPageParam: lastPage => {
            if (!lastPage.data?.hasNextPage) return undefined;
            return lastPage.data.pageNumber + 1;
        },
        enabled: enabled && !!ZoneId,
    });

    // Create Map for O(1) pond lookup
    const pondMap = React.useMemo(() => new Map(ponds?.map(p => [p.code, p.name]) || []), [ponds]);

    // Also map by id for fallback
    const pondIdMap = React.useMemo(() => new Map(ponds?.map(p => [p.id, p.name]) || []), [ponds]);

    // Flatten pages into a single array with UI-ready data
    const dataList: TransferData[] = React.useMemo(() => {
        if (!query.data) return [];

        const getPondName = (code: string | null): string => {
            if (!code) return 'N/A';
            return pondMap.get(code) || pondIdMap.get(code) || code;
        };

        return query.data.pages.reduce<TransferData[]>((acc, page) => {
            const items = page.data?.items || [];
            const mapped = items.map((record: StockTransferRecordDto) => ({
                id: record.recordId,
                sourcePond: getPondName(record.fromPondCode),
                targetPond: getPondName(record.toPondCode),
                transferDate: formatDate(record.transferDate),
                doc: record.doc,
                amount: record.transferQuantity.toLocaleString(),
                size: record.shrimpCountPerKg.toString(),
                stockingDate: formatDate(record.releaseDate),
                stockingAmount: record.releaseQuantity.toLocaleString(),
                expectedAmount: record.estimatedShrimpCount.toLocaleString(),
            }));
            acc.push(...mapped);
            return acc;
        }, []);
    }, [query.data, pondMap, pondIdMap]);

    return {
        dataList,
        isLoading: query.isLoading,
        isFetchingNextPage: query.isFetchingNextPage,
        hasNextPage: query.hasNextPage,
        fetchNextPage: query.fetchNextPage,
        refetch: query.refetch,
        isRefetching: query.isRefetching,
    };
};
