import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';

export const useHarvestStats = (params: {
    ZoneId: string | null | undefined;
    Id?: string | null | undefined;
    PondIds?: string[];
}) => {
    return useQuery({
        queryKey: ['report', 'harvest-stats', params.ZoneId, params.Id, params.PondIds],
        queryFn: () => {
            if (!params.ZoneId) throw new Error('ZoneId is required');
            return reportApi.getHarvestStats({
                ZoneId: params.ZoneId,
                Id: params.Id || undefined,
                PondIds: params.PondIds,
            });
        },
        enabled: !!params.ZoneId,
    });
};
