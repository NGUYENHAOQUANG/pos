import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { pondRecordApi } from '@/features/farm/api/pondRecordApi';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import { APP_CONFIG } from '@/shared/constants/config';
import { toCreateAtFromISO, toCreateAtToISO } from '@/features/farm/utils/dateUtils';
import { JOB_TYPE_TO_OPERATION_TYPES } from '@/features/farm/utils/operationTypeMapping';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import type {
    IPondRecordItem,
    IPondRecordListParams,
} from '@/features/farm/types/pondRecord.types';
import type { PondRecordListResponse } from '@/features/farm/types/pondRecord.types';

/**
 * Hook to fetch only the latest pond record activity
 */
export const useLatestPondActivity = (pondId: string) => {
    return useQuery({
        queryKey: farmKeys.pondRecords.list(pondId, { PageSize: 1, OrderBy: 'CreatedAt desc' }),
        queryFn: () => pondRecordApi.list(pondId, { PageSize: 1, OrderBy: 'CreatedAt desc' }),
        enabled: !!pondId,
    });
};

const PAGE_SIZE = APP_CONFIG.DEFAULT_PAGE_SIZE;

/**
 * useInfiniteQuery cho work log: phân trang infinite, flatten + dedupe theo id.
 * QueryKey có 'infinite' để tránh conflict với usePondRecords list thường.
 */
export const usePondRecordGroups = (
    pondId: string,
    options?: {
        startDate?: Date;
        endDate?: Date;
        operationNameFilter?: string[];
    }
) => {
    const baseParams = useMemo((): Omit<IPondRecordListParams, 'Page' | 'PageSize'> => {
        const p: Omit<IPondRecordListParams, 'Page' | 'PageSize'> = {
            OrderBy: 'CreatedAt desc',
        };
        if (options?.startDate) p.CreateAtFrom = toCreateAtFromISO(options.startDate);
        if (options?.endDate) p.CreateAtTo = toCreateAtToISO(options.endDate);
        if (options?.operationNameFilter?.length) {
            p.OperationTypes = (options.operationNameFilter as JobType[]).reduce<string[]>(
                (acc, jobType) => acc.concat(JOB_TYPE_TO_OPERATION_TYPES[jobType] ?? []),
                []
            );
        }
        return p;
    }, [options?.startDate, options?.endDate, options?.operationNameFilter]);

    const queryKey = useMemo(
        () => [
            ...farmKeys.pondRecords.list(pondId, baseParams as Record<string, unknown>),
            'infinite',
        ],
        [pondId, baseParams]
    );

    const query = useInfiniteQuery({
        queryKey,
        queryFn: async ({ pageParam = 1 }): Promise<PondRecordListResponse> => {
            return pondRecordApi.list(pondId, {
                ...baseParams,
                Page: pageParam,
                PageSize: PAGE_SIZE,
            });
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage): number | undefined => {
            const data = lastPage?.data;
            if (!data?.hasNextPage) return undefined;
            return data.pageNumber + 1;
        },
        enabled: !!pondId,
    });

    const rawItems: IPondRecordItem[] = useMemo(() => {
        if (!query.data?.pages?.length) return [];
        const byId = new Map<string, IPondRecordItem>();
        query.data.pages.forEach(page => {
            const items = page?.data?.items ?? [];
            items.forEach(item => {
                if (item?.id) byId.set(item.id, item);
            });
        });
        return Array.from(byId.values());
    }, [query.data]);

    return {
        rawItems,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        fetchNextPage: query.fetchNextPage,
        hasNextPage: query.hasNextPage ?? false,
        isFetchingNextPage: query.isFetchingNextPage,
    };
};
