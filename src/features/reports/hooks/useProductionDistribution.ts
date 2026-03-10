import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';

export const useProductionDistribution = (params: {
    ZoneId: string | null | undefined;
    Id?: string | null | undefined;
}) => {
    return useQuery({
        queryKey: ['report', 'production-distribution', params.ZoneId, params.Id],
        queryFn: () => {
            if (!params.ZoneId) throw new Error('ZoneId is required');
            return reportApi.getProductionDistribution({
                ZoneId: params.ZoneId,
                Id: params.Id || undefined,
            });
        },
        enabled: !!params.ZoneId,
    });
};
