import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';

interface UseWaterUsageStatsOptions {
    zoneId: string;
    pondIds?: string[];
    startDate?: string;
    endDate?: string;
    enabled?: boolean;
}

export const useWaterUsageStats = ({
    zoneId,
    pondIds,
    startDate,
    endDate,
    enabled = true,
}: UseWaterUsageStatsOptions) => {
    return useQuery({
        queryKey: ['water-usage-stats', zoneId, pondIds, startDate, endDate],
        queryFn: () =>
            reportApi.getDailyWaterStats({
                zoneId,
                pondIds,
                startDate,
                endDate,
            }),
        enabled: Boolean(zoneId) && enabled,
    });
};
