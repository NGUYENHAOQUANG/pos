import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';
import { colors } from '@/styles/colors';
import {
    ProductionAreaData,
    ProdChartGroupData,
    ProdLegendItem,
    ProdSummaryCardData,
    UseProdChartDataResult,
} from '../types/production-distribution';

// ----------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------

/** Scale calculation result */
interface ProdChartScale {
    yMax: number;
    yLabels: string[];
}

/** Color for "Còn lại" bars */
const REMAINING_COLOR = colors.blue[600];
/** Color for "Đã thu" bars */
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

/**
 * Color palette for "Còn lại" legends ordered by DOC range
 * (darkest → lightest, maps to highest DOC → lowest DOC)
 */
const REMAINING_COLOR_PALETTE: string[] = [
    '#102A56',
    colors.blue[700],
    colors.blue[600],
    colors.blue[400],
];

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
/**
 * Format a numeric value with Vietnamese unit abbreviation
 * for Y-axis labels.
 */
const formatLabel = (value: number): string => {
    if (value === 0) return '0';
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1).replace(/\.0$/, '')} Tỷ`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')} Tr`;
    if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')} Ng`;
    return Math.round(value).toString();
};

/**
 * Calculate Y-axis scale with dynamic step size to avoid too many labels.
 * Maximum Y-axis labels is capped at MAX_Y_LABELS for performance.
 */
const calculateScale = (values: number[]): ProdChartScale => {
    const maxVal = values.length > 0 ? Math.max(...values, 1) : 1;

    // Determine a nice step that keeps labels count <= MAX_Y_LABELS
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

    // Ensure minimum step of 1
    step = Math.max(1, step);

    const yMax = Math.max(step, Math.ceil((maxVal * 1.1) / step) * step);

    const labels: string[] = [];
    for (let v = 0; v <= yMax + 0.1; v += step) {
        labels.push(formatLabel(Math.round(v)));
    }

    const yLabels = [...labels].reverse();

    return { yMax, yLabels };
};

/**
 * Hook that fetches production distribution data and transforms it
 * into chart-ready grouped bar format with remaining + harvested per pond.
 */
export const useProdChartData = (zoneId: string, pondId?: string): UseProdChartDataResult => {
    const { data: response, isLoading } = useProductionDistribution({
        ZoneId: zoneId,
        Id: pondId,
    });

    const apiData = response?.data;

    const activeData = useMemo((): ProdChartGroupData[] => {
        if (!apiData?.areaData) return [];
        return apiData.areaData.map((d: ProductionAreaData) => {
            const remaining = d.remainingAmount / KG_TO_TON;
            const harvested = d.harvestedAmount / KG_TO_TON;
            return {
                label: d.label,
                items: [
                    remaining > 0
                        ? {
                              value: remaining,
                              color: REMAINING_COLOR,
                          }
                        : null,
                    harvested > 0
                        ? {
                              value: harvested,
                              color: HARVESTED_COLOR,
                          }
                        : null,
                ],
            };
        });
    }, [apiData]);

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

        const reversedDocData = [...(apiData.docData || [])].reverse();

        const remainingLegends: ProdLegendItem[] = reversedDocData.map(
            (doc: ProductionAreaData, index: number): ProdLegendItem => ({
                label: doc.label,
                color: REMAINING_COLOR_PALETTE[index % REMAINING_COLOR_PALETTE.length],
            })
        );

        return [
            {
                title: 'Còn lại',
                value: apiData.summary.totalRemaining / KG_TO_TON,
                unit: 'tấn',
                legends: remainingLegends,
            },
            {
                title: 'Đã thu',
                value: apiData.summary.totalHarvested / KG_TO_TON,
                unit: 'tấn',
                legends: [{ label: '> 80', color: HARVESTED_COLOR }],
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
