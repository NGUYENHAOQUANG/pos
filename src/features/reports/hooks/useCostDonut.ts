import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';
import { CostDonutParams } from '../types/cost-donut';

interface UseCostDonutOptions extends CostDonutParams {
    enabled?: boolean;
}

export const useCostDonut = ({
    ZoneId,
    PondCategoryIds,
    PondIds,
    CycleId,
    enabled = true,
}: UseCostDonutOptions) => {
    return useQuery({
        queryKey: ['cost-donut', ZoneId, PondCategoryIds, PondIds, CycleId],
        queryFn: () =>
            reportApi.getCostDonut({
                ZoneId,
                PondCategoryIds,
                PondIds,
                CycleId,
            }),
        enabled: Boolean(ZoneId) && enabled,
        staleTime: 0,
    });
};
