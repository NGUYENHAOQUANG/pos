import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { spacing } from '@/styles/spacing';
import { BasicDropDownButton } from '../BasicDropDownButton';
import { PondIndexCard } from '@/features/reports/components/env-chart/PondIndexCard';
import { Loading } from '@/shared/components/ui/Loading';
import chartStyles from '@/features/reports/styles/chart.styles';
import ProdChartIcon from '@/assets/Icon/IconReport/ProdChartIcon.svg';
import { useProdChartData } from '../../hooks/useProductionDistribution';
import { ProdChartProps, ProdVisualChartProps } from '../../types/production-distribution';

// ----------------------------------------------------------------------
// SUB-COMPONENT: VISUAL CHART
// ----------------------------------------------------------------------

const VisualChart = ({
    data,
    yLabels,
    maxValue,
    height = 220,
    barWidth = 20,
}: ProdVisualChartProps) => {
    const TOP_PADDING = 0;
    const X_AXIS_HEIGHT = 20;
    const COLUMN_WIDTH = barWidth * 1.8; // Width for each group column

    return (
        <View style={styles.chartMainArea}>
            {/* Y Axis Labels - Fixed */}
            <View style={[styles.yAxisContainer, { height: height, marginTop: TOP_PADDING }]}>
                {yLabels.map((label, index) => {
                    const topPos = index * (height / (yLabels.length - 1));
                    return (
                        <View key={index} style={[styles.yLabelWrapper, { top: topPos }]}>
                            <Text style={styles.yAxisLabel}>{label}</Text>
                        </View>
                    );
                })}
            </View>

            {/* Scrollable Area */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View
                    style={[
                        styles.chartContentContainer,
                        {
                            height: height + TOP_PADDING + X_AXIS_HEIGHT,
                            width: data.length * COLUMN_WIDTH,
                        },
                    ]}
                >
                    {/* Grid Lines */}
                    <View style={[styles.gridContainer, { top: TOP_PADDING, height: height }]}>
                        {yLabels.map((_, index) => {
                            const topPos = index * (height / (yLabels.length - 1));
                            return <View key={index} style={[styles.gridLine, { top: topPos }]} />;
                        })}
                    </View>

                    {/* Bars Area */}
                    <View style={[styles.barsArea, { height: height + TOP_PADDING }]}>
                        {data.map((group, groupIndex) => (
                            <View
                                key={groupIndex}
                                style={[styles.barColumn, { width: COLUMN_WIDTH }]}
                            >
                                <View style={styles.barsRow}>
                                    {group.items.map((item, itemIndex) => {
                                        if (!item)
                                            return (
                                                <View key={itemIndex} style={{ width: barWidth }} />
                                            );
                                        const bHeight = (item.value / maxValue) * height;
                                        return (
                                            <View
                                                key={itemIndex}
                                                style={[styles.barWrapper, { width: barWidth }]}
                                            >
                                                <Text style={styles.barValue}>{item.label}</Text>
                                                <View
                                                    style={[
                                                        styles.bar,
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
                        ))}
                    </View>

                    {/* X Axis Labels */}
                    <View style={styles.xAxisRow}>
                        {data.map((group, groupIndex) => (
                            <View
                                key={groupIndex}
                                style={[styles.barColumn, { width: COLUMN_WIDTH }]}
                            >
                                <Text style={styles.xAxisLabel} numberOfLines={1}>
                                    {group.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

export const ProdChart = ({ zoneId, pondId }: ProdChartProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const { isLoading, summary, activeData, yLabels, yMax, chartHeight } = useProdChartData(
        zoneId,
        pondId
    );

    return (
        <View style={chartStyles.container}>
            <BasicDropDownButton
                prefixIcon={<ProdChartIcon width={16} height={16} />}
                label="BIỂU ĐỒ SẢN LƯỢNG"
                isExpanded={isExpanded}
                onPress={() => setIsExpanded(!isExpanded)}
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
                            {/* <View style={styles.tabContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.tab,
                                        activeTab === 'Ngày tuổi' && styles.activeTab,
                                    ]}
                                    onPress={() => setActiveTab('Ngày tuổi')}
                                >
                                    <Text
                                        style={[
                                            styles.tabText,
                                            activeTab === 'Ngày tuổi' && styles.activeTabText,
                                        ]}
                                    >
                                        Ngày tuổi
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.tab,
                                        activeTab === 'Khu vực' && styles.activeTab,
                                    ]}
                                    onPress={() => setActiveTab('Khu vực')}
                                >
                                    <Text
                                        style={[
                                            styles.tabText,
                                            activeTab === 'Khu vực' && styles.activeTabText,
                                        ]}
                                    >
                                        Khu vực
                                    </Text>
                                </TouchableOpacity>
                            </View> */}

                            <View style={styles.summaryContainer}>
                                <PondIndexCard
                                    item={{
                                        id: 'harvested',
                                        name: 'Đã thu',
                                        value: (summary?.totalHarvested || 0).toString(),
                                        color: colors.orange[600],
                                    }}
                                    variant="prodSummary"
                                />
                                <PondIndexCard
                                    item={{
                                        id: 'remaining',
                                        name: 'Còn lại',
                                        value: (summary?.totalRemaining || 0).toString(),
                                        color: colors.green[600],
                                    }}
                                    variant="prodSummary"
                                />
                            </View>

                            <Text style={styles.chartTitle}>Khối lượng (Tấn)</Text>

                            <VisualChart
                                data={activeData}
                                yLabels={yLabels}
                                maxValue={yMax}
                                height={chartHeight}
                                barWidth={32}
                            />
                        </>
                    )}
                </View>
            )}
        </View>
    );
};

// ----------------------------------------------------------------------
// STYLES
// ----------------------------------------------------------------------

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    content: {
        paddingBottom: spacing.lg,
    },
    summaryContainer: {
        marginHorizontal: spacing.md,
        marginTop: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: spacing.lg,
    },
    chartTitle: {
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        color: colors.textSecondary,
        fontFamily: typography.fontFamily.medium,
    },
    chartMainArea: {
        flexDirection: 'row',
        paddingRight: spacing.md,
    },
    yAxisContainer: {
        width: 35,
        position: 'relative',
        marginRight: spacing.xs,
    },
    yLabelWrapper: {
        position: 'absolute',
        right: 0,
        height: 20,
        justifyContent: 'center',
        marginTop: -10, // Half of height to center on the point
    },
    yAxisLabel: {
        fontSize: 10,
        color: colors.gray[500],
        fontFamily: typography.fontFamily.regular,
        textAlign: 'right',
    },
    chartContentContainer: {
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
    barColumn: {
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    barsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    barWrapper: {
        alignItems: 'center',
        marginHorizontal: 1,
    },
    barValue: {
        fontSize: 9,
        color: colors.text,
        marginBottom: 2,
        fontWeight: typography.fontWeight.medium,
        width: 50,
        textAlign: 'center',
        fontFamily: typography.fontFamily.medium,
    },
    bar: {
        width: '100%',
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
    xAxisRow: {
        flexDirection: 'row',
        height: 20,
        alignItems: 'center',
    },
    xAxisLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray[600],
        textAlign: 'center',
        fontFamily: typography.fontFamily.regular,
    },
    loadingContainer: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
