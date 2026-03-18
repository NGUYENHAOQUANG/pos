import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';
import { colors } from '@/styles/colors';
import {
    ProductionAreaData,
    ProductionDocData,
    ProdChartGroupData,
    ProdChartItemData,
    ProdChartScale,
    UseProdChartDataResult,
} from '../types/production-distribution';

// ----------------------------------------------------------------------
// API HOOK
// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------

/** Get the bar color for production chart */
const getBarColor = (): string => {
    return colors.orange[900];
};

/**
 * Calculate Y-axis scale with dynamic step size to avoid too many labels.
 * Maximum Y-axis labels is capped at 8 for performance.
 */
const calculateScale = (values: number[]): ProdChartScale => {
    const maxVal = values.length > 0 ? Math.max(...values, 1) : 1;
    const MAX_LABELS = 8;

    // Determine a nice step that keeps labels count <= MAX_LABELS
    const rawStep = (maxVal * 1.1) / MAX_LABELS;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const niceSteps = [1, 2, 5, 10];
    let step = niceSteps[niceSteps.length - 1] * magnitude;
    for (const ns of niceSteps) {
        if (ns * magnitude >= rawStep) {
            step = ns * magnitude;
            break;
        }
    }

    // Ensure minimum step of 1
    step = Math.max(1, step);

    const yMax = Math.max(step, Math.ceil((maxVal * 1.1) / step) * step);

    const formatLabel = (value: number): string => {
        if (value === 0) return '0';
        if (value >= 1000000000) return `${(value / 1000000000).toFixed(1).replace(/\.0$/, '')} Tỷ`;
        if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')} Triệu`;
        if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')} Nghìn`;
        return Math.round(value).toString();
    };

    const labels: string[] = [];
    for (let v = 0; v <= yMax + 0.1; v += step) {
        labels.push(formatLabel(Math.round(v)));
    }

    const yLabels = [...labels].reverse();

    return { yMax, yLabels };
};

// ----------------------------------------------------------------------
// DATA HOOK
// ----------------------------------------------------------------------

/**
 * Hook that fetches production distribution data and transforms it
 * into chart-ready format (GroupData[], yLabels, yMax, chartHeight).
 */
export const useProdChartData = (zoneId: string, pondId?: string): UseProdChartDataResult => {
    const { data: response, isLoading } = useProductionDistribution({
        ZoneId: zoneId,
        Id: pondId,
    });

    const apiData = response?.data;

    // Group data by age group (docData)
    const ageGroupData = useMemo((): ProdChartGroupData[] => {
        if (!apiData?.docData) return [];
        return apiData.docData.map((d: ProductionDocData) => ({
            label: d.label,
            items: [
                d.totalAmount > 0
                    ? {
                          value: d.totalAmount,
                          color: getBarColor(),
                          label: d.totalAmount.toFixed(2).replace('.', ',') + ' T',
                      }
                    : null,
            ],
        }));
    }, [apiData]);

    // Data for Pond/Area tab (areaData)
    const pondData = useMemo((): ProdChartGroupData[] => {
        if (!apiData?.areaData) return [];
        return apiData.areaData.map((d: ProductionAreaData) => ({
            label: d.label,
            items: [
                d.totalAmount > 0
                    ? {
                          value: d.totalAmount,
                          color: getBarColor(),
                          label: d.totalAmount.toFixed(2).replace('.', ',') + ' T',
                      }
                    : null,
            ],
        }));
    }, [apiData]);

    // Currently active tab is always 'Khu vực'
    const activeData = pondData.length > 0 ? pondData : ageGroupData;

    // Calculate Y-axis scale
    const { yMax, yLabels } = useMemo(() => {
        const allValues: number[] = [];
        activeData.forEach((group: ProdChartGroupData) => {
            if (group?.items) {
                group.items.forEach((item: ProdChartItemData) => {
                    if (item) allValues.push(item.value);
                });
            }
        });
        return calculateScale(allValues);
    }, [activeData]);

    // Dynamic chart height, capped at 440px max
    const chartHeight = useMemo(() => Math.min(440, Math.max(220, yLabels.length * 55)), [yLabels]);

    return {
        isLoading,
        summary: apiData?.summary,
        activeData,
        yLabels,
        yMax,
        chartHeight,
    };
};
