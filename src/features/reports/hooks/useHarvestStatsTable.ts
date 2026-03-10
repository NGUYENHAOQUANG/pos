import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';
import { HarvestStatsTableParams } from '../types/harvest-stats-table';

export const useHarvestStatsTable = (params: HarvestStatsTableParams & { enabled?: boolean }) => {
    const { enabled = true, ...apiParams } = params;

    return useQuery({
        queryKey: ['report', 'harvest-stats-table', apiParams],
        queryFn: () => {
            if (!apiParams.ZoneId) throw new Error('ZoneId is required');
            return reportApi.getHarvestStatsTable(apiParams);
        },
        enabled: enabled && !!apiParams.ZoneId,
    });
};
