/**
 * @file useStockTransferStats.ts
 * @description Hook for stock transfer stats with infinite scroll
 */
import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';
import {
    StockTransferStatsParams,
    StockTransferRecordDto,
    TransferData,
} from '../types/stock-transfer-stats';
import { APP_CONFIG } from '@/shared/constants/config';

/** Format date as dd/MM/yyyy (e.g. 03/12/2026) */
const formatDateDDMMYYYY = (dateStr: string): string => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

// Infinite scroll hook
interface UseInfiniteStockTransferParams
    extends Omit<StockTransferStatsParams, 'Page' | 'PageSize'> {
    enabled?: boolean;
}

export const useInfiniteStockTransferStats = ({
    enabled = true,
    ...apiParams
}: UseInfiniteStockTransferParams) => {
    const pageSize = APP_CONFIG.DEFAULT_PAGE_SIZE;

    const query = useInfiniteQuery({
        queryKey: ['report', 'stock-transfer-stats', 'infinite', apiParams],
        queryFn: async ({ pageParam = 1 }) => {
            if (!apiParams.ZoneId) throw new Error('ZoneId is required');
            return reportApi.getStockTransferStats({
                ...apiParams,
                Page: pageParam,
                PageSize: pageSize,
            });
        },
        initialPageParam: 1,
        getNextPageParam: lastPage => {
            if (!lastPage.data?.hasNextPage) return undefined;
            return lastPage.data.pageNumber + 1;
        },
        enabled: enabled && !!apiParams.ZoneId,
    });

    // Flatten pages into a single array with UI-ready data
    const dataList: TransferData[] = React.useMemo(() => {
        if (!query.data) return [];

        return query.data.pages.reduce<TransferData[]>((acc, page) => {
            const items = page.data?.items || [];
            const mapped = items.map((record: StockTransferRecordDto) => ({
                id: record.recordId,
                sourcePond: record.fromPondName || 'N/A',
                targetPond: record.toPondName || 'N/A',
                transferDate: formatDateDDMMYYYY(record.transferDate),
                doc: record.doc,
                amount: record.transferQuantity.toLocaleString(),
                size: record.shrimpCountPerKg.toString(),
                stockingDate: formatDateDDMMYYYY(record.releaseDate),
                stockingAmount: record.releaseQuantity.toLocaleString(),
                expectedAmount: record.estimatedShrimpCount.toLocaleString(),
            }));
            acc.push(...mapped);
            return acc;
        }, []);
    }, [query.data]);

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
