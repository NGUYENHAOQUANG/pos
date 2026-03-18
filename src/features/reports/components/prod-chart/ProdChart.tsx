import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { BasicDropDownButton } from '../BasicDropDownButton';
import { Loading } from '@/shared/components/ui/Loading';
import chartStyles from '@/features/reports/styles/chart.styles';
import ProdChartIcon from '@/assets/Icon/IconReport/ProdChartIcon.svg';
import { useProdChartData } from '../../hooks/useProductionDistribution';
import {
    ProdChartProps,
    ProdVisualChartProps,
    ProdChartGroupData,
    ProdSummaryCardData,
    ProdLegendItem,
} from '../../types/production-distribution';

// ----------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------

const X_AXIS_HEIGHT = 24;
const DEFAULT_BAR_WIDTH = 24;

// ----------------------------------------------------------------------
// SUB-COMPONENT: LEGEND DOT
// ----------------------------------------------------------------------

interface LegendDotProps {
    item: ProdLegendItem;
}

const LegendDot = React.memo(({ item }: LegendDotProps) => (
    <View style={legendStyles.container}>
        <View style={[legendStyles.dot, { backgroundColor: item.color }]} />
        <Text style={legendStyles.label}>{item.label}</Text>
    </View>
));

LegendDot.displayName = 'LegendDot';

// ----------------------------------------------------------------------
// SUB-COMPONENT: SUMMARY CARD
// ----------------------------------------------------------------------

interface SummaryCardProps {
    card: ProdSummaryCardData;
}

const SummaryCard = React.memo(({ card }: SummaryCardProps) => {
    // Format number: thousand separator (.) + decimal separator (,)
    const formattedValue = useMemo(() => {
        const [intPart, decPart] = card.value.toFixed(2).split('.');
        const withSeparator = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return `${withSeparator},${decPart}`;
    }, [card.value]);

    return (
        <View style={summaryStyles.card}>
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
                <Text style={summaryStyles.valueUnit}> {card.unit}</Text>
            </View>
            {card.legends.length > 0 && (
                <View style={summaryStyles.legendRow}>
                    {card.legends.map((legend, index) => (
                        <LegendDot key={index} item={legend} />
                    ))}
                </View>
            )}
        </View>
    );
});

SummaryCard.displayName = 'SummaryCard';

// ----------------------------------------------------------------------
// SUB-COMPONENT: BAR GROUP (single pond column)
// ----------------------------------------------------------------------

interface BarGroupProps {
    group: ProdChartGroupData;
    maxValue: number;
    chartHeight: number;
    barWidth: number;
    columnWidth: number;
}

const BarGroup = React.memo(
    ({ group, maxValue, chartHeight, barWidth, columnWidth }: BarGroupProps) => (
        <View style={[barStyles.column, { width: columnWidth }]}>
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
        </View>
    )
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
    }: ProdVisualChartProps) => {
        const columnWidth = useMemo(() => {
            const maxItems = data.reduce((max, g) => Math.max(max, g.items.length), 0);
            return Math.max(barWidth * maxItems + 16, 60);
        }, [data, barWidth]);

        const totalWidth = useMemo(() => data.length * columnWidth, [data.length, columnWidth]);

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

        const renderXLabel = useCallback(
            (group: ProdChartGroupData, index: number) => (
                <View key={index} style={[barStyles.column, { width: columnWidth }]}>
                    <Text style={chartInnerStyles.xAxisLabel} numberOfLines={1}>
                        {group.label}
                    </Text>
                </View>
            ),
            [columnWidth]
        );

        return (
            <View style={chartInnerStyles.mainArea}>
                <View style={[chartInnerStyles.yAxisContainer, { height }]}>{yAxisElements}</View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    removeClippedSubviews
                    nestedScrollEnabled
                >
                    <View
                        style={[
                            chartInnerStyles.contentContainer,
                            {
                                height: height + X_AXIS_HEIGHT,
                                width: totalWidth,
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
                                    group={group}
                                    maxValue={maxValue}
                                    chartHeight={height}
                                    barWidth={barWidth}
                                    columnWidth={columnWidth}
                                />
                            ))}
                        </View>

                        <View style={chartInnerStyles.xAxisRow}>{data.map(renderXLabel)}</View>
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

export const ProdChart = ({ zoneId, pondId }: ProdChartProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const { isLoading, activeData, yLabels, yMax, chartHeight, summaryCards } = useProdChartData(
        zoneId,
        pondId,
        isExpanded
    );

    const handleToggle = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    // Only show chart when there is valid data
    const hasData = activeData.length > 0;

    return (
        <View style={chartStyles.container}>
            <BasicDropDownButton
                prefixIcon={<ProdChartIcon width={16} height={16} />}
                label="Biểu đồ sản lượng"
                isExpanded={isExpanded}
                onPress={handleToggle}
                style={styles.header}
            />

            {isExpanded && (
                <View style={styles.content}>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <Loading />
                        </View>
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
                                        data={activeData}
                                        yLabels={yLabels}
                                        maxValue={yMax}
                                        height={chartHeight}
                                        barWidth={DEFAULT_BAR_WIDTH}
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
    content: {
        paddingTop: 12,
        paddingRight: 16,
        paddingBottom: 16,
        paddingLeft: 12,
        gap: 24,
    },
    summaryContainer: {
        flexDirection: 'column',
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
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.gray[200],
        padding: 8,
        gap: 2,
        backgroundColor: colors.white,
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
        fontSize: 14,
        color: colors.gray[950],
        fontWeight: '700',
        lineHeight: 20,
        flexShrink: 1,
    },
    valueUnit: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '400',
        lineHeight: 20,
        marginLeft: 2,
        flexShrink: 0,
    },
    legendRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
    },
});

// ----------------------------------------------------------------------
// STYLES: LEGEND DOT
// ----------------------------------------------------------------------

const legendStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 18,
        gap: 4,
    },
    dot: {
        width: 8,
        height: 3,
        borderRadius: 8,
    },
    label: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '400',
        lineHeight: 18,
    },
});

// ----------------------------------------------------------------------
// STYLES: BAR GROUP
// ----------------------------------------------------------------------

const barStyles = StyleSheet.create({
    column: {
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    barsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        alignSelf: 'center',
        flex: 1,
    },
    wrapper: {
        alignItems: 'center',
        marginHorizontal: 1,
        justifyContent: 'flex-end',
        flex: 1,
    },
    bar: {
        width: '100%',
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
        alignItems: 'flex-end',
    },
    xAxisRow: {
        flexDirection: 'row',
        height: X_AXIS_HEIGHT,
        alignItems: 'center',
    },
    xAxisLabel: {
        fontSize: 12,
        color: colors.gray[600],
        textAlign: 'center',
        fontWeight: '400',
    },
});
