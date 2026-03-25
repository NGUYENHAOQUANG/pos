import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, borderRadius } from '@/styles';

import { BasicDropDownButton } from '../BasicDropDownButton';
import { HeadingEnvChart } from './HeadingEnvChart';
import { PondIndex } from './PondIndex';
import EnvChar from './EnvChar';
import { Loading } from '@/shared/components/ui/Loading';
import Peformance from '@/assets/Icon/IconReport/Peformance.svg';
import chartStyles from '@/features/reports/styles/chart.styles';
import { useEnvMeasurementChart } from '@/features/reports/hooks/useEnvMeasurementChart';
import { useMetrics } from '@/features/farm/hooks/metric/useMetric';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';

// Color palette for dynamically assigning colors to ponds
const POND_COLOR_PALETTE = [
    '#7B2CBF', // purple
    '#E85D04', // orange
    '#2D6A4F', // green
    '#1D4ED8', // blue
    '#9D174D', // magenta
    '#0E7490', // cyan
    '#DC2626', // red
    '#1E3A5F', // dark blue
    '#CA8A04', // yellow
    '#C2410C', // volcano
    '#059669', // emerald
    '#7C3AED', // violet
    '#DB2777', // pink
    '#0284C7', // sky
    '#65A30D', // lime
];

interface CompilationEnvChartProps {
    zoneId: string;
    pondIds?: string[];
    cycleId?: string;
}

const CompilationEnvChart = ({ zoneId, pondIds, cycleId }: CompilationEnvChartProps) => {
    const [isExpanded, setIsExpanded] = useState(true);

    // Fetch available metrics from API
    const { data: metricsResponse } = useMetrics();
    const metrics = useMemo(() => metricsResponse?.data || [], [metricsResponse?.data]);

    // Build heading items from metrics
    const headingItems = useMemo(() => {
        if (metrics.length === 0) return [];
        return metrics.map(m => ({
            key: m.id,
            label: m.name,
        }));
    }, [metrics]);

    // Selected metric tab (by MetricId)
    const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);

    // Auto-select first metric when metrics load
    React.useEffect(() => {
        if (metrics.length > 0 && !selectedMetricId) {
            setSelectedMetricId(metrics[0].id);
        }
    }, [metrics, selectedMetricId]);

    // Fetch chart data from API
    const {
        data: chartResponse,
        isLoading,
        isRefetching,
    } = useEnvMeasurementChart({
        ZoneId: zoneId,
        MetricId: selectedMetricId,
        PondIds: pondIds,
        CycleId: cycleId,
    });

    const chartData = chartResponse?.data;
    const series = useMemo(() => chartData?.series || [], [chartData?.series]);
    const metadata = useMemo(
        () => chartData?.metadata || { minY: 0, maxY: 10, xAxis: [] as string[] },
        [chartData?.metadata]
    );
    const unitMetric = useMemo(() => {
        if (selectedMetricId && metrics.length > 0) {
            const metric = metrics.find(m => m.id === selectedMetricId);
            if (metric?.unitDisplay) return metric.unitDisplay;
        }
        return chartData?.unitMetric || '';
    }, [selectedMetricId, metrics, chartData?.unitMetric]);

    // Get selected metric name for chart title
    const selectedMetricName = useMemo(() => {
        if (!selectedMetricId || metrics.length === 0) return '';
        const metric = metrics.find(m => m.id === selectedMetricId);
        const name = metric?.name || '';
        if (name.toLowerCase() === 'ph') return `Độ ${name}`;
        return name;
    }, [selectedMetricId, metrics]);

    // Build color map for ponds (stable per pondId)
    const pondColors = useMemo(() => {
        const colorMap: Record<string, string> = {};
        series.forEach((s, i) => {
            colorMap[s.pondId] = POND_COLOR_PALETTE[i % POND_COLOR_PALETTE.length];
        });
        return colorMap;
    }, [series]);

    // Build PondIndex data from series
    const pondData = useMemo(() => {
        return series.map(s => ({
            id: s.pondId,
            name: s.pondName,
            value: unitMetric
                ? `${String(s.averageValue).replace('.', ',')} ${unitMetric}`
                : `${String(s.averageValue).replace('.', ',')}`,
            color: pondColors[s.pondId] || '#999',
        }));
    }, [series, pondColors, unitMetric]);

    const showLoading = isLoading || isRefetching;
    const isEmpty = !showLoading && series.length === 0;

    // --- Pond card filter ---
    const [selectedPondId, setSelectedPondId] = useState<string | null>(null);

    // Reset selected pond when metric/data changes
    React.useEffect(() => {
        setSelectedPondId(null);
    }, [selectedMetricId, zoneId, pondIds]);

    const handlePondPress = (pondId: string) => {
        // Toggle: tap same card → deselect (show all)
        setSelectedPondId(prev => (prev === pondId ? null : pondId));
    };

    // Filter series for chart: show only selected pond, or all if none selected
    const filteredSeries = useMemo(() => {
        if (!selectedPondId) return series;
        return series.filter(s => s.pondId === selectedPondId);
    }, [series, selectedPondId]);

    return (
        <View style={chartStyles.container}>
            <BasicDropDownButton
                prefixIcon={<Peformance width={20} height={20} />}
                label="Biểu đồ thông số môi trường"
                isExpanded={isExpanded}
                onPress={() => setIsExpanded(!isExpanded)}
                style={styles.header}
            />

            {isExpanded && (
                <View style={styles.content}>
                    <HeadingEnvChart
                        items={headingItems}
                        selected={selectedMetricId || undefined}
                        onSelect={setSelectedMetricId}
                    />

                    {showLoading ? (
                        <View style={{ height: 300 }}>
                            <Loading />
                        </View>
                    ) : isEmpty ? (
                        <EmptyStateCard message="Không có dữ liệu thông số môi trường" />
                    ) : (
                        <>
                            <PondIndex
                                data={pondData}
                                selectedId={selectedPondId}
                                onPress={handlePondPress}
                            />

                            {selectedMetricName ? (
                                <Text style={styles.chartTitle}>{selectedMetricName}</Text>
                            ) : null}
                            <View style={styles.chartContainer}>
                                <EnvChar
                                    series={filteredSeries}
                                    metadata={metadata}
                                    unit={unitMetric}
                                    pondColors={pondColors}
                                    showSinglePointDots={!!selectedPondId}
                                />
                            </View>
                        </>
                    )}
                </View>
            )}
        </View>
    );
};

export default CompilationEnvChart;

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    content: {
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        borderBottomLeftRadius: borderRadius.sm,
        borderBottomRightRadius: borderRadius.sm,
    },
    chartContainer: {
        marginVertical: 16,
    },
    chartTitle: {
        fontSize: 12,
        color: colors.text,
        paddingLeft: 0,
        marginTop: 12,
        marginBottom: 8,
    },
});
