import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';

interface UseWaterUsageStatsOptions {
    zoneId: string;
    startDate?: string;
    endDate?: string;
    enabled?: boolean;
}

export const useWaterUsageStats = ({
    zoneId,
    startDate,
    endDate,
    enabled = true,
}: UseWaterUsageStatsOptions) => {
    return useQuery({
        queryKey: ['water-usage-stats', zoneId, startDate, endDate],
        queryFn: () =>
            reportApi.getDailyWaterStats({
                zoneId,
                startDate,
                endDate,
            }),
        enabled: Boolean(zoneId) && enabled,
    });
};
