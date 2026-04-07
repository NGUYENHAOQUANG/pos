import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';

export const usePondStatusDistribution = (params: {
    ZoneId: string | null | undefined;
    SeasonId?: string;
}) => {
    return useQuery({
        queryKey: ['report', 'pond-status-distribution', params.ZoneId, params.SeasonId],
        queryFn: () => {
            if (!params.ZoneId) throw new Error('ZoneId is required');
            return reportApi.getPondStatusDistribution({
                zoneId: params.ZoneId,
                seasonId: params.SeasonId,
            });
        },
        enabled: !!params.ZoneId,
    });
};
