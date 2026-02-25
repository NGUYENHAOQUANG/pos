import { useQuery } from '@tanstack/react-query';
import { zoneApi } from '@/features/farm/api/zoneApi';
import { farmKeys } from './farmKeys';

export const useZones = () => {
    return useQuery({
        queryKey: farmKeys.zones(),
        queryFn: zoneApi.getZones,
        staleTime: 1000 * 60 * 5,
    });
};
