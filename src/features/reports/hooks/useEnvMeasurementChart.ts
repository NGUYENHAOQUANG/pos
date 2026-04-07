import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';
import { EnvMeasurementChartParams } from '../types/env-measurement-chart';

export const useEnvMeasurementChart = (params: {
    ZoneId: string | null | undefined;
    MetricId?: string | null;
    PondCategoryIds?: string[];
    PondIds?: string[];
    CycleId?: string | null;
    SeasonId?: string | null;
    FromDate?: string;
    ToDate?: string;
}) => {
    return useQuery({
        queryKey: [
            'report',
            'env-measurement-chart',
            params.ZoneId,
            params.MetricId,
            params.PondIds,
            params.CycleId,
            params.SeasonId,
            params.FromDate,
            params.ToDate,
        ],
        queryFn: () => {
            if (!params.ZoneId) throw new Error('ZoneId is required');
            const apiParams: EnvMeasurementChartParams = {
                ZoneId: params.ZoneId,
                MetricId: params.MetricId || undefined,
                PondIds: params.PondIds,
                CycleId: params.CycleId || undefined,
                SeasonId: params.SeasonId || undefined,
                FromDate: params.FromDate,
                ToDate: params.ToDate,
            };
            return reportApi.getEnvMeasurementChart(apiParams);
        },
        enabled: !!params.ZoneId,
        staleTime: 1000 * 30,
    });
};
