import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';

export const useProfitStats = (params: {
    ZoneId: string | null | undefined;
    PondIds?: string[];
    SeasonId?: string;
}) => {
    return useQuery({
        queryKey: ['report', 'profit-stats', params.ZoneId, params.PondIds, params.SeasonId],
        queryFn: () => {
            if (!params.ZoneId) throw new Error('ZoneId is required');
            return reportApi.getProfitStats({
                ZoneId: params.ZoneId,
                PondIds: params.PondIds,
                SeasonId: params.SeasonId,
            });
        },
        enabled: !!params.ZoneId,
        staleTime: 0,
    });
};
