import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';
import { WaterUsageParams } from '../types/water-usage';

export interface UseWaterUsageStatsOptions extends WaterUsageParams {
    enabled?: boolean;
}

export const useWaterUsageStats = (options: UseWaterUsageStatsOptions) => {
    const { zoneId, pondIds, seasonId, startDate, endDate, enabled = true } = options;

    return useQuery({
        queryKey: ['water-usage-stats', zoneId, pondIds, seasonId, startDate, endDate],
        queryFn: () =>
            reportApi.getDailyWaterStats({
                zoneId,
                pondIds,
                seasonId,
                startDate,
                endDate,
            }),
        enabled: Boolean(zoneId) && enabled,
    });
};
