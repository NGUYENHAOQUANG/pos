import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';
import { colors } from '@/styles/colors';
import { abbreviateNumber } from '@/shared/utils/formatters';
import {
    ProductionAreaData,
    ProdChartGroupData,
    ProdSummaryCardData,
    UseProdChartDataResult,
    ProdChartViewMode,
} from '../types/production-distribution';

// ----------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------

/** Scale calculation result */
interface ProdChartScale {
    yMax: number;
    yLabels: string[];
}

/** Color for "Đã thu" bars and legend */
const HARVESTED_COLOR = colors.orange[900];
/** Maximum Y-axis labels to prevent rendering overflow */
const MAX_Y_LABELS = 8;
/** Minimum chart height in px */
const MIN_CHART_HEIGHT = 220;
/** Maximum chart height in px */
const MAX_CHART_HEIGHT = 260;
/** Height per Y-axis label in px */
const HEIGHT_PER_LABEL = 40;
/** Conversion factor: 1 Tấn = 1000 Kg */
const KG_TO_TON = 1000;

/** Color for "Còn lại" bars and legend */
const REMAINING_COLOR = colors.blue[600];

// ----------------------------------------------------------------------
// API HOOK
// ----------------------------------------------------------------------

export const useProductionDistribution = (params: {
    ZoneId: string | null | undefined;
    PondIds?: string[];
    SeasonId?: string;
}) => {
    return useQuery({
        queryKey: [
            'report',
            'production-distribution',
            params.ZoneId,
            params.PondIds,
            params.SeasonId,
        ],
        queryFn: () => {
            if (!params.ZoneId) throw new Error('ZoneId is required');
            return reportApi.getProductionDistribution({
                ZoneId: params.ZoneId,
                PondIds: params.PondIds,
                SeasonId: params.SeasonId,
            });
        },
        enabled: !!params.ZoneId,
    });
};
/**
 * Format a numeric value with Vietnamese unit abbreviation
 * for Y-axis labels.
 */
const formatLabel = (value: number): string => {
    if (value === 0) return '0';
    return abbreviateNumber(value).abbreviated.replace('Triệu', 'Tr').replace('Nghìn', 'Ng');
};

/**
 * Calculate Y-axis scale with dynamic step size to avoid too many labels.
 * Maximum Y-axis labels is capped at MAX_Y_LABELS for performance.
 */
const calculateScale = (values: number[]): ProdChartScale => {
    const maxVal = values.length > 0 ? Math.max(...values, 1) : 1;

    const rawStep = (maxVal * 1.1) / MAX_Y_LABELS;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const niceSteps = [1, 2, 5, 10];
    let step = niceSteps[niceSteps.length - 1] * magnitude;
    for (const ns of niceSteps) {
        if (ns * magnitude >= rawStep) {
            step = ns * magnitude;
            break;
        }
    }

    step = Math.max(1, step);

    const yMax = Math.max(step, Math.ceil((maxVal * 1.1) / step) * step);

    // Use integer iteration to avoid floating-point precision drift
    const labelCount = Math.round(yMax / step);
    const labels: string[] = [];
    for (let i = 0; i <= labelCount; i++) {
        labels.push(formatLabel(Math.round(i * step)));
    }

    labels.reverse();

    return { yMax, yLabels: labels };
};

/**
 * Hook that fetches production distribution data and transforms it
 * into chart-ready grouped bar format with remaining + harvested per pond.
 */
export const useProdChartData = (
    zoneId: string,
    pondId?: string,
    enabled = true,
    viewMode: ProdChartViewMode = 'area',
    seasonId?: string
): UseProdChartDataResult => {
    const { data: response, isLoading } = useProductionDistribution({
        ZoneId: enabled ? zoneId : null,
        PondIds: pondId ? [pondId] : undefined,
        SeasonId: seasonId,
    });

    const apiData = response?.data;

    const activeData = useMemo((): ProdChartGroupData[] => {
        if (!apiData) return [];

        const sourceData = viewMode === 'doc' ? apiData.docData : apiData.areaData;
        if (!sourceData) return [];

        return sourceData.map((d: ProductionAreaData) => {
            const remaining = d.remainingAmount / KG_TO_TON;
            const harvested = d.harvestedAmount / KG_TO_TON;

            return {
                label: d.label,
                remainingPercent:
                    viewMode === 'area' && d.totalAmount > 0 ? d.remainingPercent ?? 0 : undefined,
                items: [
                    remaining > 0
                        ? {
                              value: remaining,
                              color: REMAINING_COLOR,
                              label: 'Còn lại',
                          }
                        : null,
                    harvested > 0
                        ? {
                              value: harvested,
                              color: HARVESTED_COLOR,
                              label: 'Đã thu',
                          }
                        : null,
                ],
            };
        });
    }, [apiData, viewMode]);

    const { yMax, yLabels } = useMemo(() => {
        const allValues: number[] = [];
        activeData.forEach(group => {
            group.items.forEach(item => {
                if (item) allValues.push(item.value);
            });
        });
        return calculateScale(allValues);
    }, [activeData]);

    const chartHeight = useMemo(
        () =>
            Math.min(
                MAX_CHART_HEIGHT,
                Math.max(MIN_CHART_HEIGHT, yLabels.length * HEIGHT_PER_LABEL)
            ),
        [yLabels]
    );

    const summaryCards = useMemo((): ProdSummaryCardData[] => {
        if (!apiData?.summary) return [];

        return [
            {
                title: 'Đã thu',
                value: apiData.summary.totalHarvested / KG_TO_TON,
                unit: 'tấn',
                color: HARVESTED_COLOR,
            },
            {
                title: 'Còn lại',
                value: apiData.summary.totalRemaining / KG_TO_TON,
                unit: 'tấn',
                color: REMAINING_COLOR,
            },
        ];
    }, [apiData]);

    return {
        isLoading,
        activeData,
        yLabels,
        yMax,
        chartHeight,
        summaryCards,
    };
};
