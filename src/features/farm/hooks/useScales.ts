import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scaleApi } from '@/features/farm/api/scaleApi';
import { farmKeys } from './farmKeys';
import {
    IScaleParams,
    IScale,
    IUpdateScaleUsageStatusRequest,
} from '@/features/farm/types/scale.types';
import { APP_CONFIG } from '@/shared/constants';

export const useScales = (params?: IScaleParams) => {
    return useQuery({
        queryKey: farmKeys.scales.list(params),
        queryFn: () => scaleApi.getAll(params),
        enabled: !!params?.ZoneId || !!params?.CurrentCycleId,
    });
};

export const useScaleDetail = (id: string) => {
    return useQuery({
        queryKey: farmKeys.scales.detail(id),
        queryFn: () => scaleApi.getDetail(id),
        enabled: !!id,
    });
};

export const useAvailableScales = (zoneId?: string) => {
    const { data, ...rest } = useScales({
        ZoneId: zoneId,
        PageSize: APP_CONFIG.MAX_PAGE_SIZE,
    });

    const items: IScale[] = data?.data?.items ?? [];

    return { ...rest, data, items };
};

export const useUpdateScaleUsageStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: IUpdateScaleUsageStatusRequest) => scaleApi.updateUsageStatus(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: farmKeys.scales.all() });
        },
    });
};
