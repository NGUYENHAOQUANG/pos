import React, { useState, useMemo, useCallback } from 'react';
import { useAppTheme } from '@/styles/themeContext';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import {
    ProdSummaryCardData,
    ProdVisualChartProps,
    ProdChartGroupData,
} from '../../types/production-distribution';
import { calculateDynamicYAxisWidth } from '@/features/reports/utils/chartHelpers';

// ----------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------

const X_AXIS_HEIGHT = 24;
export const DEFAULT_BAR_WIDTH = 26.25;

/** Format for summary cards: truncate to 2 decimals without rounding */
export const formatSummary = (value: number) => {
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

export const SummaryCard = React.memo(({ card }: SummaryCardProps) => {
    const theme = useAppTheme();
    const formattedValue = useMemo(() => formatSummary(card.value), [card.value]);

    return (
        <View
            style={[
                summaryStyles.card,
                { backgroundColor: theme.background, borderColor: theme.border },
            ]}
        >
            <View style={[summaryStyles.dot, { backgroundColor: card.color }]} />
            <Text style={[summaryStyles.title, { color: theme.textSecondary }]}>{card.title}</Text>
            <View style={summaryStyles.valueRow}>
                <Text
                    style={[summaryStyles.valueNumber, { color: theme.text }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.5}
                >
                    {formattedValue}
                </Text>
                <Text style={[summaryStyles.valueUnit, { color: theme.textSecondary }]}>
                    {card.unit}
                </Text>
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

export const BarGroup = React.memo(
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
        const theme = useAppTheme();
        const maxItemValue = Math.max(0, ...group.items.map(item => item?.value || 0));
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
                    isSelected && [
                        barStyles.columnSelected,
                        {
                            backgroundColor: theme.isDark
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(243, 244, 246, 0.5)',
                        },
                    ],
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
                        <Text style={[barStyles.tooltipTitle, { color: colors.white }]}>
                            {group.label}
                        </Text>
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
                                        <Text
                                            style={[
                                                barStyles.tooltipLabel,
                                                {
                                                    color: colors.white,
                                                },
                                            ]}
                                        >
                                            {item!.label}
                                        </Text>
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

export const VisualChart = React.memo(
    ({
        data,
        yLabels,
        maxValue,
        height = 220,
        barWidth = DEFAULT_BAR_WIDTH,
        viewMode = 'area',
    }: ProdVisualChartProps) => {
        const theme = useAppTheme();
        const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

        const dynamicAutoWidth = useMemo(() => {
            return calculateDynamicYAxisWidth(yLabels, val => String(val), 12, 10);
        }, [yLabels]);

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
                        <View
                            key={index}
                            style={[
                                chartInnerStyles.gridLine,
                                {
                                    top: topPos,
                                    backgroundColor: theme.isDark ? theme.border : '#E5E7EB33',
                                },
                            ]}
                        />
                    );
                }),
            [yLabels, height, theme.border, theme.isDark]
        );

        const yAxisElements = useMemo(
            () =>
                yLabels.map((label, index) => {
                    const topPos = index * (height / (yLabels.length - 1));
                    return (
                        <View key={index} style={[chartInnerStyles.yLabelWrapper, { top: topPos }]}>
                            <Text
                                style={[
                                    chartInnerStyles.yAxisLabel,
                                    { color: theme.textSecondary },
                                ]}
                            >
                                {label}
                            </Text>
                        </View>
                    );
                }),
            [yLabels, height, theme.textSecondary]
        );

        return (
            <View style={chartInnerStyles.mainArea}>
                <View
                    style={[chartInnerStyles.yAxisContainer, { height, width: dynamicAutoWidth }]}
                >
                    {yAxisElements}
                </View>

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
                                    <Text
                                        style={[
                                            chartInnerStyles.xAxisLabel,
                                            { color: theme.textSecondary },
                                        ]}
                                        numberOfLines={1}
                                    >
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
// STYLES: SUMMARY CARD
// ----------------------------------------------------------------------

const summaryStyles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 8,
        borderWidth: 1,

        padding: 8,
        gap: 2,
    },
    dot: {
        width: 12,
        height: 4,
        borderRadius: 3,
    },
    title: {
        fontSize: 12,

        fontWeight: '400',
        lineHeight: 20,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    valueNumber: {
        fontSize: 18,

        fontWeight: '700',
        lineHeight: 24,
        flexShrink: 1,
    },
    valueUnit: {
        fontSize: 14,

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
        backgroundColor: '#0B1117',
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
        color: colors.white,
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
        color: colors.textSecondary,
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
        color: '#8E9199',
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
        backgroundColor: '#E5E7EB33',
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
        color: '#8E9199',
        textAlign: 'center',
        fontWeight: '400',
    },
});
