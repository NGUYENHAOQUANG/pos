import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';
import { PondStatusDistributionParams } from '../types/pond-status-distribution';

export const usePondStatusDistribution = (params: PondStatusDistributionParams) => {
    return useQuery({
        queryKey: ['pond-status-distribution', params],
        queryFn: () => reportApi.getPondStatusDistribution(params),
        enabled: !!params.zoneId,
    });
};
