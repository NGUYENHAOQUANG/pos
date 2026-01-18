import { useQuery } from '@tanstack/react-query';
import { zoneApi } from '@/features/farm/api/zoneApi';
import { farmKeys } from './farmKeys';

export const useZones = () => {
    return useQuery({
        queryKey: farmKeys.zones(),
        queryFn: zoneApi.getZones,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
