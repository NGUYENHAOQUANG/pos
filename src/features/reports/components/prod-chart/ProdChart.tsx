import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { spacing } from '@/styles/spacing';
import { BasicDropDownButton } from '../BasicDropDownButton';
import { PondIndexCard } from '@/features/reports/components/env-chart/PondIndexCard';
import { Loading } from '@/shared/components/ui/Loading';
import chartStyles from '@/features/reports/styles/chart.styles';
import ProdChartIcon from '@/assets/Icon/IconReport/ProdChartIcon.svg';
import { useProductionDistribution } from '../../hooks/useProductionDistribution';
import { ProductionAreaData, ProductionDocData } from '../../types/production-distribution';

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
// HELPERS
// ----------------------------------------------------------------------

const calculateScale = (values: number[]) => {
    const maxVal = values.length > 0 ? Math.max(...values, 1) : 1;
    const step = 1000;

    // yMax: làm tròn lên theo bước 1000
    const yMax = Math.max(step, Math.ceil((maxVal * 1.1) / step) * step);

    const labels: string[] = [];
    for (let v = 0; v <= yMax + 0.1; v += step) {
        labels.push(v.toString());
    }

    const yLabels = [...labels].reverse();

    return { yMax, yLabels };
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

const getAgeGroupColor = () => {
    return colors.orange[900];
};

interface ProdChartProps {
    zoneId: string;
    pondId?: string;
}

export const ProdChart = ({ zoneId, pondId }: ProdChartProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const { data: response, isLoading: apiLoading } = useProductionDistribution({
        ZoneId: zoneId,
        Id: pondId,
    });

    const apiData = response?.data;
    const isLoading = apiLoading;

    const [activeTab] = useState<'Ngày tuổi' | 'Khu vực'>('Khu vực');

    // 1. Group data by age group (docData)
    const ageGroupData = useMemo(() => {
        if (!apiData?.docData) return [];
        return apiData.docData.map((d: ProductionDocData) => {
            const item: GroupData = {
                label: d.label,
                items: [
                    d.totalAmount > 0
                        ? {
                              value: d.totalAmount,
                              color: String(getAgeGroupColor()),
                              label: d.totalAmount.toFixed(2).replace('.', ',') + ' T',
                          }
                        : null,
                ],
            };
            return item;
        });
    }, [apiData]);

    // 2. Data for Pond tab (areaData)
    const pondData = useMemo(() => {
        if (!apiData?.areaData) return [];
        return apiData.areaData.map((d: ProductionAreaData) => {
            return {
                label: d.label,
                items: [
                    d.totalAmount > 0
                        ? {
                              value: d.totalAmount,
                              color: String(getAgeGroupColor()),
                              label: d.totalAmount.toFixed(2).replace('.', ',') + ' T',
                          }
                        : null,
                ],
            } as GroupData;
        });
    }, [apiData]);

    // 3. Select active data
    const activeData = activeTab === 'Khu vực' ? pondData : ageGroupData;

    // 4. Calculate scale based on active data
    const { yMax, yLabels } = useMemo(() => {
        const allValues: number[] = [];
        activeData.forEach((group: GroupData) => {
            if (group && group.items) {
                group.items.forEach((item: ItemData) => {
                    if (item) allValues.push(item.value);
                });
            }
        });
        return calculateScale(allValues);
    }, [activeData]);

    // 5. Dynamic height for visual consistency
    // Chia yMax cho 1000 để giữ mật độ hiển thị tương tự như khi dùng đơn vị Tấn
    const chartHeight = useMemo(() => Math.max(220, (yMax / 1000) * 55), [yMax]);

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
                                        value: (apiData?.summary?.totalHarvested || 0).toString(),
                                        color: colors.orange[600],
                                    }}
                                    variant="prodSummary"
                                />
                                <PondIndexCard
                                    item={{
                                        id: 'remaining',
                                        name: 'Còn lại',
                                        value: (apiData?.summary?.totalRemaining || 0).toString(),
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

                            {/* <Legend /> */}
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
    barGroup: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
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
    loadingContainer: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
