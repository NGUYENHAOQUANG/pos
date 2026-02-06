import { useQuery } from '@tanstack/react-query';
import { metricApi } from '@/features/farm/api/metricApi';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import { GetMetricsResponse } from '@/features/farm/types/metric.types';

export const useMetrics = () => {
    return useQuery<GetMetricsResponse>({
        queryKey: farmKeys.metric.list(),
        queryFn: metricApi.getMetrics,
        staleTime: 1000 * 60 * 60,
    });
};
