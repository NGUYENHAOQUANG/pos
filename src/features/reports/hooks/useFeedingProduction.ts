import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';

export const useFeedingProduction = (params: {
    ZoneId: string | null | undefined;
    Id?: string | null | undefined; // SeasonId or PondId
    PondIds?: string[];
    SeasonId?: string;
    CreatedAtFrom?: string;
    CreatedAtTo?: string;
}) => {
    return useQuery({
        queryKey: [
            'report',
            'feeding-production',
            params.ZoneId,
            params.Id,
            params.PondIds,
            params.SeasonId,
            params.CreatedAtFrom,
            params.CreatedAtTo,
        ],
        queryFn: () => {
            if (!params.ZoneId) throw new Error('ZoneId is required');
            return reportApi.getFeedingProduction({
                ZoneId: params.ZoneId,
                Id: params.Id || undefined,
                PondIds: params.PondIds,
                SeasonId: params.SeasonId,
                CreatedAtFrom: params.CreatedAtFrom,
                CreatedAtTo: params.CreatedAtTo,
            });
        },
        enabled: !!params.ZoneId,
    });
};
