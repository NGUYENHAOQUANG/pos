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
    const TOP_PADDING = 25; // Space for values on top of bars
    const X_AXIS_HEIGHT = 20; // Space for pond names below bars

    return (
        <View style={styles.chartMainArea}>
            {/* Y Axis Labels */}
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

            {/* Chart Area */}
            <View
                style={[
                    styles.chartContentContainer,
                    { height: height + TOP_PADDING + X_AXIS_HEIGHT },
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
                        <View key={groupIndex} style={{ flex: 1, alignItems: 'center' }}>
                            <View style={styles.barsRow}>
                                {group.items.map((item, itemIndex) => {
                                    if (!item)
                                        return <View key={itemIndex} style={{ width: barWidth }} />;
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
                        <View key={groupIndex} style={{ flex: 1, alignItems: 'center' }}>
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

const calculateScale = (values: number[]) => {
    const maxVal = values.length > 0 ? Math.max(...values, 1) : 1;

    // Choose suitable step: 0.5 for small range, 1 or 2 for large
    let step = 0.5;
    if (maxVal > 8) step = 2;
    else if (maxVal > 4) step = 1;

    // yMax with headroom, rounded up to next step
    const yMax = Math.ceil((maxVal * 1.15) / step) * step;

    // Labels from bottom (0) to top (yMax)
    const labels: string[] = [];
    for (let v = 0; v <= yMax + 0.001; v += step) {
        labels.push(v % 1 === 0 ? v.toFixed(0) : v.toFixed(1).replace('.', ','));
    }

    // yLabels for top-to-bottom rendering
    const yLabels = [...labels].reverse();

    return { yMax, yLabels };
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

const getAgeGroupColor = (ageGroup: string, type: 'remaining' | 'collected') => {
    if (type === 'collected') return colors.orange[500];

    switch (ageGroup) {
        case '>80':
            return colors.blue[800];
        case '70-80':
            return colors.blue[600];
        case '60-70':
            return colors.blue[400];
        case '<40':
            return colors.blue[50];
        default:
            return colors.blue[200];
    }
};

export const ProdChart = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeTab, setActiveTab] = useState<'Ngày tuổi' | 'Khu vực'>('Khu vực');

    // 1. Group data by age group
    const ageGroupData = useMemo(() => {
        const groups: Record<string, { collected: number; remaining: number }> = {};
        prodChartData.forEach(d => {
            if (!groups[d.ageGroup]) {
                groups[d.ageGroup] = { collected: 0, remaining: 0 };
            }
            groups[d.ageGroup].collected += d.collected;
            groups[d.ageGroup].remaining += d.remaining;
        });

        const order = ['<40', '60-70', '70-80', '>80'];
        return order
            .map(age => {
                const group = groups[age];
                if (!group || (group.collected === 0 && group.remaining === 0)) return null;

                const item: GroupData = {
                    label: age,
                    items: [
                        group.collected > 0
                            ? {
                                  value: group.collected,
                                  color: String(getAgeGroupColor(age, 'collected')),
                                  label: group.collected.toFixed(2).replace('.', ',') + ' T',
                              }
                            : null,
                        group.remaining > 0
                            ? {
                                  value: group.remaining,
                                  color: String(getAgeGroupColor(age, 'remaining')),
                                  label: group.remaining.toFixed(2).replace('.', ',') + ' T',
                              }
                            : null,
                    ],
                };
                return item;
            })
            .filter((item): item is GroupData => item !== null);
    }, []);

    // 2. Data for Pond tab
    const pondData = useMemo(
        () =>
            prodChartData.map((d: ProdDataPoint) => ({
                label: d.pondName,
                items: [
                    d.collected > 0
                        ? {
                              value: d.collected,
                              color: d.colorCollected || getAgeGroupColor(d.ageGroup, 'collected'),
                              label: d.collected.toFixed(2).replace('.', ',') + ' T',
                          }
                        : null,
                    d.remaining > 0
                        ? {
                              value: d.remaining,
                              color: d.colorRemaining || getAgeGroupColor(d.ageGroup, 'remaining'),
                              label: d.remaining.toFixed(2).replace('.', ',') + ' T',
                          }
                        : null,
                ],
            })) as GroupData[],
        []
    );

    // 3. Select active data
    const activeData = activeTab === 'Khu vực' ? pondData : ageGroupData;

    // 4. Calculate scale based on active data
    const { yMax, yLabels } = useMemo(() => {
        const allValues: number[] = [];
        activeData.forEach(group => {
            if (group && group.items) {
                group.items.forEach(item => {
                    if (item) allValues.push(item.value);
                });
            }
        });
        return calculateScale(allValues);
    }, [activeData]);

    // 5. Dynamic height for visual consistency
    const chartHeight = useMemo(() => Math.max(200, yMax * 55), [yMax]);

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

                    <View style={styles.summaryContainer}>
                        {prodChartSummary.map((item, index) => (
                            <View key={index} style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>{item.label}</Text>
                                <Text style={styles.summaryValue}>{item.value}</Text>
                            </View>
                        ))}
                    </View>

                    <VisualChart
                        data={activeData}
                        yLabels={yLabels}
                        maxValue={yMax}
                        height={chartHeight}
                        barWidth={activeTab === 'Khu vực' ? 20 : 30}
                    />

                    <Legend />
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
    xAxisRow: {
        flexDirection: 'row',
        height: 20,
        alignItems: 'center',
    },
    xAxisLabel: {
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
