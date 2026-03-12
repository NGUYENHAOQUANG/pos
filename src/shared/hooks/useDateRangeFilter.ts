import { useState, useMemo } from 'react';
import { toCreateAtFromISO, toCreateAtToISO } from '@/features/farm/utils/dateUtils';

export interface DateRangeFilterResult {
    /** Start date state */
    startDate: Date;
    /** End date state */
    endDate: Date;
    /** Setter for start date */
    setStartDate: (date: Date) => void;
    /** Setter for end date */
    setEndDate: (date: Date) => void;
    /** API-ready params: { CreateAtFrom, CreateAtTo } */
    dateParams: {
        CreateAtFrom: string;
        CreateAtTo: string;
    };
}

/**
 * Hook quản lý date range filter cho các log screens.
 * - Default: đầu tháng hiện tại → hôm nay
 * - Tự convert sang ISO params đúng timezone cho API (dùng toCreateAtFromISO/toCreateAtToISO)
 *
 * @example
 * ```tsx
 * const { startDate, endDate, setStartDate, setEndDate, dateParams } = useDateRangeFilter();
 *
 * const { jobs } = useHarvestRecordsAsJobs(pondId, dateParams);
 *
 * return (
 *   <BaseLogScreen
 *     startDate={startDate}
 *     endDate={endDate}
 *     onStartDateChange={setStartDate}
 *     onEndDateChange={setEndDate}
 *     ...
 *   />
 * );
 * ```
 */
export function useDateRangeFilter(): DateRangeFilterResult {
    const [startDate, setStartDate] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [endDate, setEndDate] = useState(new Date());

    const dateParams = useMemo(
        () => ({
            CreateAtFrom: toCreateAtFromISO(startDate),
            CreateAtTo: toCreateAtToISO(endDate),
        }),
        [startDate, endDate]
    );

    return {
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        dateParams,
    };
}
