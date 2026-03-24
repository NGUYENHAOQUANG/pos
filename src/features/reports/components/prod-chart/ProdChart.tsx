import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { BasicDropDownButton } from '../BasicDropDownButton';
import { Loading } from '@/shared/components/ui/Loading';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import chartStyles from '@/features/reports/styles/chart.styles';
import ProdChartIcon from '@/assets/Icon/IconReport/ProdChartIcon.svg';
import { useProdChartData } from '../../hooks/useProductionDistribution';
import {
    ProdChartProps,
    ProdVisualChartProps,
    ProdChartGroupData,
    ProdSummaryCardData,
    ProdChartViewMode,
} from '../../types/production-distribution';
import { HeadingBar, HeadingBarItem } from '@/shared/components/layout/HeadingBar';

// ----------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------

const X_AXIS_HEIGHT = 24;
const DEFAULT_BAR_WIDTH = 26.25;

/** Format for summary cards: truncate to 2 decimals without rounding */
const formatSummary = (value: number) => {
    const factor = 100;
    const truncated = Math.floor(value * factor + 1e-9) / factor;
    const [intPart, decPart] = truncated.toFixed(2).split('.');
    const withSeparator = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${withSeparator},${decPart}`;
};

/** Format for tooltip: preserve all significant decimals from backend */
const formatTooltip = (value: number) => {
    const cleanStr = parseFloat(value.toFixed(10)).toString();
    const dotIndex = cleanStr.indexOf('.');
    const naturalDecimals = dotIndex === -1 ? 0 : cleanStr.length - dotIndex - 1;
    const decimals = Math.max(2, naturalDecimals);
    const [intPart, decPart = ''] = cleanStr.split('.');
    const paddedDec = decPart.padEnd(decimals, '0');
    const withSeparator = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${withSeparator},${paddedDec}`;
};

// ----------------------------------------------------------------------
// SUB-COMPONENT: SUMMARY CARD
// ----------------------------------------------------------------------

interface SummaryCardProps {
    card: ProdSummaryCardData;
}

const SummaryCard = React.memo(({ card }: SummaryCardProps) => {
    const formattedValue = useMemo(() => formatSummary(card.value), [card.value]);

    return (
        <View style={summaryStyles.card}>
            <View style={[summaryStyles.dot, { backgroundColor: card.color }]} />
            <Text style={summaryStyles.title}>{card.title}</Text>
            <View style={summaryStyles.valueRow}>
                <Text
                    style={summaryStyles.valueNumber}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.5}
                >
                    {formattedValue}
                </Text>
                <Text style={summaryStyles.valueUnit}>{card.unit}</Text>
            </View>
        </View>
    );
});

SummaryCard.displayName = 'SummaryCard';

// ----------------------------------------------------------------------
// SUB-COMPONENT: BAR GROUP (single pond column)
// ----------------------------------------------------------------------

interface BarGroupProps {
    group: ProdChartGroupData;
    index: number;
    maxValue: number;
    chartHeight: number;
    barWidth: number;
    columnWidth: number;
    isSelected?: boolean;
    onPress?: (index: number) => void;
    isLast?: boolean;
}

const BarGroup = React.memo(
    ({
        group,
        index,
        maxValue,
        chartHeight,
        barWidth,
        columnWidth,
        isSelected,
        onPress,
        isLast,
    }: BarGroupProps) => {
        const maxItemValue = Math.max(0, ...group.items.map(item => item?.value || 0));
        // Add 8px buffer hovering above the top of the bar. Caps at chart height limits (so it doesn't get clipped)
        const highestBarPx = Math.max(
            2,
            maxValue > 0 ? (maxItemValue / maxValue) * chartHeight : 2
        );
        const tooltipBottomPosition = Math.min(highestBarPx + 12, chartHeight - 85);

        const handlePress = useCallback(() => {
            onPress?.(index);
        }, [onPress, index]);

        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={handlePress}
                style={[
                    barStyles.column,
                    { minWidth: columnWidth, flex: 1 },
                    isSelected && barStyles.columnSelected,
                ]}
            >
                {isSelected && (
                    <View
                        style={[
                            barStyles.tooltipContainer,
                            isLast ? { right: '50%' } : { left: '50%' },
                            { bottom: tooltipBottomPosition },
                        ]}
                    >
                        <Text style={barStyles.tooltipTitle}>{group.label}</Text>
                        <View style={barStyles.tooltipItems}>
                            {group.items.filter(Boolean).map((item, idx) => (
                                <View key={idx} style={barStyles.tooltipRow}>
                                    <View style={barStyles.tooltipLeft}>
                                        <View
                                            style={[
                                                barStyles.tooltipDot,
                                                { backgroundColor: item!.color },
                                            ]}
                                        />
                                        <Text style={barStyles.tooltipLabel}>{item!.label}</Text>
                                    </View>
                                    <View style={barStyles.tooltipValueContainer}>
                                        <Text style={barStyles.tooltipValue}>
                                            {formatTooltip(item!.value)}
                                        </Text>
                                        <Text style={barStyles.tooltipUnit}>tấn</Text>
                                    </View>
                                </View>
                            ))}
                            {group.remainingPercent !== undefined && (
                                <View style={barStyles.tooltipRow}>
                                    <View style={barStyles.tooltipLeft}>
                                        <View
                                            style={[
                                                barStyles.tooltipDot,
                                                { backgroundColor: colors.gray[400] },
                                            ]}
                                        />
                                        <Text style={barStyles.tooltipLabel}>Tỷ lệ còn lại</Text>
                                    </View>
                                    <View style={barStyles.tooltipValueContainer}>
                                        <Text style={barStyles.tooltipValue}>
                                            {formatTooltip(group.remainingPercent)}
                                        </Text>
                                        <Text style={barStyles.tooltipUnit}>%</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                )}
                <View style={barStyles.barsRow}>
                    {group.items.map((item, itemIndex) => {
                        if (!item) return <View key={itemIndex} style={{ width: barWidth }} />;
                        const bHeight = Math.max(2, (item.value / maxValue) * chartHeight);
                        return (
                            <View key={itemIndex} style={[barStyles.wrapper, { width: barWidth }]}>
                                <View
                                    style={[
                                        barStyles.bar,
                                        {
                                            height: bHeight,
                                            backgroundColor: item.color,
                                        },
                                    ]}
                                />
                            </View>
                        );
                    })}
                </View>
            </TouchableOpacity>
        );
    }
);

BarGroup.displayName = 'BarGroup';

// ----------------------------------------------------------------------
// SUB-COMPONENT: VISUAL CHART
// ----------------------------------------------------------------------

const VisualChart = React.memo(
    ({
        data,
        yLabels,
        maxValue,
        height = 220,
        barWidth = DEFAULT_BAR_WIDTH,
        viewMode = 'area',
    }: ProdVisualChartProps) => {
        const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

        const columnWidth = useMemo(() => {
            const maxItems = data.reduce((max, g) => Math.max(max, g.items.length), 0);
            if (viewMode === 'doc') {
                return Math.max(barWidth * maxItems + 16, 60);
            }
            return Math.max(barWidth * maxItems + 40, 96);
        }, [data, barWidth, viewMode]);

        const handleBarGroupPress = useCallback((index: number) => {
            setSelectedIndex(prev => (prev === index ? null : index));
        }, []);

        const minTotalWidth = useMemo(() => data.length * columnWidth, [data.length, columnWidth]);

        const gridLines = useMemo(
            () =>
                yLabels.map((_, index) => {
                    const topPos = index * (height / (yLabels.length - 1));
                    return (
                        <View key={index} style={[chartInnerStyles.gridLine, { top: topPos }]} />
                    );
                }),
            [yLabels, height]
        );

        const yAxisElements = useMemo(
            () =>
                yLabels.map((label, index) => {
                    const topPos = index * (height / (yLabels.length - 1));
                    return (
                        <View key={index} style={[chartInnerStyles.yLabelWrapper, { top: topPos }]}>
                            <Text style={chartInnerStyles.yAxisLabel}>{label}</Text>
                        </View>
                    );
                }),
            [yLabels, height]
        );

        return (
            <View style={chartInnerStyles.mainArea}>
                <View style={[chartInnerStyles.yAxisContainer, { height }]}>{yAxisElements}</View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    nestedScrollEnabled
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <View
                        style={[
                            chartInnerStyles.contentContainer,
                            {
                                height: height + X_AXIS_HEIGHT,
                                minWidth: minTotalWidth,
                                flex: 1,
                            },
                        ]}
                    >
                        <View style={[chartInnerStyles.gridContainer, { height }]}>
                            {gridLines}
                        </View>

                        <View style={[chartInnerStyles.barsArea, { height }]}>
                            {data.map((group, groupIndex) => (
                                <BarGroup
                                    key={groupIndex}
                                    index={groupIndex}
                                    group={group}
                                    maxValue={maxValue}
                                    chartHeight={height}
                                    barWidth={barWidth}
                                    columnWidth={columnWidth}
                                    isSelected={selectedIndex === groupIndex}
                                    isLast={groupIndex >= data.length - 2 && groupIndex > 0}
                                    onPress={handleBarGroupPress}
                                />
                            ))}
                        </View>

                        <View style={chartInnerStyles.xAxisRow}>
                            {data.map((group, index) => (
                                <View
                                    key={index}
                                    style={[
                                        barStyles.column,
                                        {
                                            minWidth: columnWidth,
                                            flex: 1,
                                            justifyContent: 'center',
                                            paddingHorizontal: 8,
                                        },
                                    ]}
                                >
                                    <Text style={chartInnerStyles.xAxisLabel} numberOfLines={1}>
                                        {group.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }
);

VisualChart.displayName = 'VisualChart';

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

const VIEW_MODE_TABS: HeadingBarItem[] = [
    { key: 'doc', label: 'Ngày tuổi' },
    { key: 'area', label: 'Khu vực' },
];

export const ProdChart = ({ zoneId, pondId }: ProdChartProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [viewMode, setViewMode] = useState<ProdChartViewMode>('area');

    const { isLoading, activeData, yLabels, yMax, chartHeight, summaryCards } = useProdChartData(
        zoneId,
        pondId,
        isExpanded,
        viewMode
    );

    const handleToggle = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    const handleTabSelect = useCallback((tab: string) => {
        setViewMode(tab as ProdChartViewMode);
    }, []);

    // Only show chart when there is valid data
    const hasData = activeData.length > 0;

    return (
        <View style={chartStyles.container}>
            <BasicDropDownButton
                prefixIcon={<ProdChartIcon width={20} height={20} />}
                label="Biểu đồ sản lượng"
                isExpanded={isExpanded}
                onPress={handleToggle}
                style={styles.header}
            />

            {isExpanded && (
                <View style={styles.content}>
                    {/* Tab: Ngày tuổi / Khu vực */}
                    <HeadingBar
                        tabs={VIEW_MODE_TABS}
                        selectedTab={viewMode}
                        onTabSelect={handleTabSelect}
                        flexTabs
                        containerStyle={styles.tabContainer}
                    />

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <Loading />
                        </View>
                    ) : !hasData ? (
                        <EmptyStateCard message="Không có dữ liệu sản lượng" />
                    ) : (
                        <>
                            {/* Summary Cards Row */}
                            <View style={styles.summaryContainer}>
                                {summaryCards.map((card, index) => (
                                    <SummaryCard key={index} card={card} />
                                ))}
                            </View>

                            {/* Chart Section */}
                            {hasData && (
                                <View style={styles.chartSection}>
                                    <Text style={styles.chartTitle}>Khối lượng (Tấn)</Text>
                                    <VisualChart
                                        key={viewMode}
                                        data={activeData}
                                        yLabels={yLabels}
                                        maxValue={yMax}
                                        height={chartHeight}
                                        barWidth={DEFAULT_BAR_WIDTH}
                                        viewMode={viewMode}
                                    />
                                </View>
                            )}
                        </>
                    )}
                </View>
            )}
        </View>
    );
};

// ----------------------------------------------------------------------
// STYLES: MAIN
// ----------------------------------------------------------------------

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    tabContainer: {
        marginHorizontal: -12,
    },
    content: {
        paddingTop: 12,
        paddingRight: 16,
        paddingBottom: 16,
        paddingLeft: 12,
        gap: 24,
    },
    summaryContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    chartSection: {
        gap: 24,
    },
    chartTitle: {
        marginBottom: spacing.sm,
        fontSize: 12,
        fontWeight: '500',
        color: colors.textSecondary,
    },
    loadingContainer: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

// ----------------------------------------------------------------------
// STYLES: SUMMARY CARD
// ----------------------------------------------------------------------

const summaryStyles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.gray[200],
        padding: 8,
        gap: 2,
        backgroundColor: colors.white,
    },
    dot: {
        width: 12,
        height: 4,
        borderRadius: 3,
    },
    title: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '400',
        lineHeight: 20,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    valueNumber: {
        fontSize: 18,
        color: colors.gray[950],
        fontWeight: '700',
        lineHeight: 24,
        flexShrink: 1,
    },
    valueUnit: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '400',
        lineHeight: 20,
        marginLeft: 4,
        flexShrink: 0,
    },
});

// ----------------------------------------------------------------------
// STYLES: BAR GROUP
// ----------------------------------------------------------------------

const barStyles = StyleSheet.create({
    column: {
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    columnSelected: {
        backgroundColor: 'rgba(243, 244, 246, 0.5)',
        zIndex: 10,
    },
    barsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    wrapper: {
        alignItems: 'center',
        marginHorizontal: 1,
        justifyContent: 'flex-end',
    },
    bar: {
        width: '100%',
    },
    tooltipContainer: {
        position: 'absolute',
        backgroundColor: colors.gray[950],
        borderRadius: 8,
        padding: 8,
        gap: 4,
        minWidth: 110,
        zIndex: 100,
        elevation: 12,
    },
    tooltipTitle: {
        color: colors.white,
        fontWeight: '500',
        fontSize: 12,
        lineHeight: 20,
    },
    tooltipItems: {
        gap: 4,
    },
    tooltipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    tooltipLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tooltipDot: {
        width: 12,
        height: 4,
        borderRadius: 2,
        marginRight: 6,
    },
    tooltipLabel: {
        color: colors.gray[400],
        fontSize: 12,
    },
    tooltipValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    tooltipValue: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    tooltipUnit: {
        color: colors.gray[400],
        fontSize: 12,
        marginLeft: 2,
    },
});

// ----------------------------------------------------------------------
// STYLES: CHART INNER
// ----------------------------------------------------------------------

const chartInnerStyles = StyleSheet.create({
    mainArea: {
        flexDirection: 'row',
        paddingRight: spacing.md,
    },
    yAxisContainer: {
        width: 45,
        position: 'relative',
        marginRight: spacing.xs,
    },
    yLabelWrapper: {
        position: 'absolute',
        left: 0,
        height: 24,
        justifyContent: 'center',
        marginTop: -12,
    },
    yAxisLabel: {
        fontSize: 12,
        color: colors.gray[500],
        fontWeight: '400',
        textAlign: 'left',
    },
    contentContainer: {
        flex: 1,
        position: 'relative',
    },
    gridContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
    },
    gridLine: {
        position: 'absolute',
        height: 1,
        backgroundColor: colors.gray[100],
        left: 0,
        right: 0,
    },
    barsArea: {
        flexDirection: 'row',
        alignItems: 'stretch',
        width: '100%',
    },
    xAxisRow: {
        flexDirection: 'row',
        height: X_AXIS_HEIGHT,
        alignItems: 'center',
        width: '100%',
    },
    xAxisLabel: {
        fontSize: 12,
        color: colors.gray[600],
        textAlign: 'center',
        fontWeight: '400',
    },
});
