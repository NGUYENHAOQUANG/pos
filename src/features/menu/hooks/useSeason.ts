import { useQuery } from '@tanstack/react-query';
import { seasonApiTemp, ISeasonListParams } from '@/features/menu/api/seasonApiTemp';
import { farmKeys } from '@/features/farm/hooks/farmKeys';

export const useSeasonList = (zoneId?: string, params?: ISeasonListParams) => {
    const enabled = !!zoneId;

    return useQuery({
        queryKey: zoneId ? [...farmKeys.seasons(zoneId), params] : ['season-list-null'],
        queryFn: () => seasonApiTemp.getSeasons(zoneId!, params),
        enabled,
    });
};

export const useSeason = (zoneId?: string, seasonId?: string) => {
    const enabled = !!zoneId && !!seasonId;

    return useQuery({
        queryKey: zoneId && seasonId ? farmKeys.detail(zoneId, seasonId) : ['season-detail-null'],
        queryFn: () => seasonApiTemp.getSeasonDetail(zoneId!, seasonId!),
        enabled,
    });
};
