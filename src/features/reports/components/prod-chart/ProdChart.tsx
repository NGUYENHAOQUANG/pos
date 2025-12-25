import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { spacing } from '@/styles/spacing';
import { CollapseHead } from '@/features/farm/components/CollapseHead';
import { prodChartData, prodChartSummary, ProdDataPoint } from './prodData';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

export type ItemData = { value: number; color: string; label: string } | null;
export type GroupData = { label: string; items: ItemData[] };

interface VisualChartProps {
    data: GroupData[];
    yLabels: string[];
    maxValue: number;
    height?: number;
    barWidth?: number;
}

// ----------------------------------------------------------------------
// SUB-COMPONENT: VISUAL CHART
// ----------------------------------------------------------------------

const VisualChart = ({
    data,
    yLabels,
    maxValue,
    height = 220,
    barWidth = 20,
}: VisualChartProps) => {
    const renderBar = (item: ItemData, index: number) => {
        if (!item) {
            return (
                <View key={`spacer-${index}`} style={[styles.barWrapper, { width: barWidth }]} />
            );
        }

        const barHeight = (item.value / maxValue) * height;
        return (
            <View key={index} style={[styles.barWrapper, { width: barWidth }]}>
                <Text style={styles.barValue}>{item.label}</Text>
                <View
                    style={[
                        styles.bar,
                        {
                            height: barHeight,
                            backgroundColor: item.color,
                        },
                    ]}
                />
            </View>
        );
    };

    return (
        <View style={[styles.chartMainArea, { height }]}>
            <View style={styles.yAxisContainer}>
                {yLabels.map((label, index) => (
                    <Text key={index} style={styles.yAxisLabel}>
                        {label}
                    </Text>
                ))}
            </View>

            <View style={styles.chartContentContainer}>
                <View style={styles.gridContainer}>
                    {yLabels.map((_, index) => (
                        <View key={index} style={styles.gridLine} />
                    ))}
                </View>

                <View style={styles.barsArea}>
                    {data.map((group, groupIndex) => (
                        <View key={groupIndex} style={[styles.barGroup, { flex: 1 / data.length }]}>
                            <View style={styles.barsRow}>
                                {group.items.map((item, itemIndex) => renderBar(item, itemIndex))}
                            </View>
                            <Text style={styles.xAxisLabel} numberOfLines={1}>
                                {group.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

// ----------------------------------------------------------------------
// SUB-COMPONENT: LEGEND
// ----------------------------------------------------------------------

const Legend = () => {
    return (
        <View style={[styles.legendContainer, { alignItems: 'flex-start' }]}>
            <View style={styles.legendRow}>
                <Text style={styles.legendTitle}>Còn lại:</Text>
                <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: colors.blue[800] }]} />
                    <Text style={styles.legendText}>{'> 80'}</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: colors.blue[600] }]} />
                    <Text style={styles.legendText}>70 - 80</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: colors.blue[400] }]} />
                    <Text style={styles.legendText}>60 - 70</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: colors.blue[50] }]} />
                    <Text style={styles.legendText}>{'< 40'}</Text>
                </View>
            </View>
            <View style={styles.legendRow}>
                <Text style={styles.legendTitle}>Đã thu:</Text>
                <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: colors.orange[500] }]} />
                    <Text style={styles.legendText}>{'> 80'}</Text>
                </View>
            </View>
        </View>
    );
};

// ----------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------

const calculateScale = (data: ProdDataPoint[]) => {
    const allValues = data.reduce((acc, d) => {
        acc.push(d.collected);
        acc.push(d.remaining);
        return acc;
    }, [] as number[]);

    const maxVal = Math.max(...allValues, 1);
    const yMax = Math.ceil(maxVal * 1.1 * 2) / 2; // Add 10% headroom

    const labelCount = 9;
    const step = yMax / (labelCount - 1);
    const yLabels = Array.from({ length: labelCount }, (_, i) => {
        const val = yMax - i * step;
        return val % 1 === 0 ? val.toString() : val.toFixed(1).replace('.', ',');
    });

    return { yMax, yLabels };
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

export const ProdChart = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeTab, setActiveTab] = useState<'Ngày tuổi' | 'Khu vực'>('Khu vực');

    const { yMax, yLabels } = useMemo(() => calculateScale(prodChartData), []);

    const chartData = useMemo(
        () =>
            prodChartData.map((d: ProdDataPoint) => ({
                label: d.pondName,
                items: [
                    d.collected > 0
                        ? {
                              value: d.collected,
                              color: d.colorCollected || colors.orange[500],
                              label: d.collected + ' T',
                          }
                        : null,
                    d.remaining > 0
                        ? {
                              value: d.remaining,
                              color: d.colorRemaining || colors.blue[600],
                              label: d.remaining + ' T',
                          }
                        : null,
                ],
            })) as GroupData[],
        []
    );

    return (
        <View style={styles.container}>
            <CollapseHead
                title="BIỂU ĐỒ SẢN LƯỢNG"
                isExpanded={isExpanded}
                onToggle={() => setIsExpanded(!isExpanded)}
                style={styles.header}
                titleStyle={styles.headerTitle}
            />

            {isExpanded && (
                <View style={styles.content}>
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'Ngày tuổi' && styles.activeTab]}
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
                            style={[styles.tab, activeTab === 'Khu vực' && styles.activeTab]}
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
                    </View>

                    {activeTab === 'Khu vực' ? (
                        <>
                            <View style={styles.summaryContainer}>
                                {prodChartSummary.map((item, index) => (
                                    <View key={index} style={styles.summaryItem}>
                                        <Text style={styles.summaryLabel}>{item.label}</Text>
                                        <Text style={styles.summaryValue}>{item.value}</Text>
                                    </View>
                                ))}
                            </View>

                            <VisualChart
                                data={chartData}
                                yLabels={yLabels}
                                maxValue={yMax}
                                barWidth={20}
                            />

                            <Legend />
                        </>
                    ) : (
                        <View style={{ height: 200 }} />
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
    container: {
        backgroundColor: colors.white,
        marginTop: spacing.md,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.gray[100],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.white,
    },
    headerTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        textTransform: 'uppercase',
        fontFamily: typography.fontFamily.bold,
    },
    content: {
        paddingBottom: spacing.lg,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
        marginBottom: spacing.lg,
    },
    tab: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xl,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        marginBottom: -1,
    },
    activeTab: {
        borderBottomColor: colors.blue[600],
    },
    tabText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.regular,
        fontFamily: typography.fontFamily.regular,
    },
    activeTabText: {
        color: colors.blue[600],
        fontWeight: typography.fontWeight.bold,
        fontFamily: typography.fontFamily.bold,
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.xl,
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        fontFamily: typography.fontFamily.regular,
    },
    summaryValue: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
    },
    chartMainArea: {
        flexDirection: 'row',
        paddingRight: spacing.md,
    },
    yAxisContainer: {
        justifyContent: 'space-between',
        paddingRight: spacing.sm,
        alignItems: 'flex-end',
        width: 40,
    },
    yAxisLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        fontFamily: typography.fontFamily.regular,
    },
    chartContentContainer: {
        flex: 1,
        position: 'relative',
    },
    gridContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
    },
    gridLine: {
        height: 1,
        backgroundColor: colors.gray[100],
        width: '100%',
    },
    barsArea: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        marginBottom: -spacing.xs,
    },
    barGroup: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
    },
    barsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        width: '100%',
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
    xAxisLabel: {
        marginTop: spacing.sm,
        fontSize: typography.fontSize.xs,
        color: colors.gray[600],
        textAlign: 'center',
        width: '100%',
        fontFamily: typography.fontFamily.regular,
    },
    legendContainer: {
        marginTop: spacing.xl,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    legendTitle: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        marginRight: spacing.sm,
        width: 50,
        fontFamily: typography.fontFamily.regular,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    legendBox: {
        width: 12,
        height: 12,
        borderRadius: 2,
        marginRight: spacing.xs,
    },
    legendText: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        fontFamily: typography.fontFamily.regular,
    },
});
