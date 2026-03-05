import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/styles';
import { Loading } from '@/shared/components/ui/Loading';
import { BasicDropDownButton } from '@/features/reports/components/BasicDropDownButton';
import { mockHarvestChartData } from './harvestData';
import chartStyles from '@/features/reports/styles/chart.styles';
import HarvestChartIcon from '@/assets/Icon/IconReport/HarvestChartIcon.svg';

const CHART_CONTENT_HEIGHT = 394;
const BAR_MAX_HEIGHT = 340.61;

export const HarvestChart: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        if (!isCollapsed) {
            setIsLoading(true);
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isCollapsed]);

    const totalYield = useMemo(() => {
        return mockHarvestChartData.reduce((acc, curr) => acc + curr.yield, 0).toFixed(2);
    }, []);

    const yAxisConfig = useMemo(() => {
        const maxValue = Math.max(...mockHarvestChartData.map(d => d.yield));
        const roundMax = Math.ceil(maxValue / 10) * 10 || 10;

        // Create 4 steps
        const step = roundMax / 4;
        const labels = [roundMax, roundMax - step, roundMax - step * 2, roundMax - step * 3, 0];

        return { max: roundMax, labels };
    }, []);

    const getBarHeight = (value: number) => {
        return (value / yAxisConfig.max) * BAR_MAX_HEIGHT;
    };

    return (
        <View style={chartStyles.container}>
            {/* Header-Section */}
            <BasicDropDownButton
                prefixIcon={<HarvestChartIcon width={16} height={16} />}
                label="BIỂU ĐỒ THU HOẠCH"
                onPress={() => setIsCollapsed(!isCollapsed)}
                style={styles.sectionHeader}
                isExpanded={!isCollapsed}
            />

            {!isCollapsed && (
                <View style={[styles.body, isLoading ? styles.loadingContainer : undefined]}>
                    {isLoading ? (
                        <Loading />
                    ) : (
                        <>
                            <View style={styles.summaryContainer}>
                                <Text style={styles.summaryLabel}>Sản lượng đã thu hoạch</Text>
                                <Text style={styles.summaryValue}>{totalYield} tấn</Text>
                            </View>

                            <View style={styles.chartAreaWrapper}>
                                <View style={styles.yAxisLabels}>
                                    {yAxisConfig.labels.map(val => (
                                        <View key={val} style={styles.yLabelWrapper}>
                                            <Text style={styles.yLabelText}>
                                                {val.toLocaleString()}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Chart-Section */}
                                <View style={styles.chartContent}>
                                    <View style={styles.gridContainer} pointerEvents="none">
                                        {[0, 1, 2, 3, 4].map(i => (
                                            <View
                                                key={i}
                                                style={[
                                                    styles.gridLine,
                                                    { top: i * (BAR_MAX_HEIGHT / 4) },
                                                ]}
                                            />
                                        ))}
                                    </View>
                                    <View style={styles.barsWrapper}>
                                        {mockHarvestChartData.map(item => (
                                            <View key={item.pond} style={styles.barColumn}>
                                                <Text style={styles.topValueText}>
                                                    {item.yield.toFixed(2)}
                                                </Text>
                                                <View
                                                    style={[
                                                        styles.bar,
                                                        { height: getBarHeight(item.yield) },
                                                    ]}
                                                />
                                                <Text style={styles.bottomLabelText}>
                                                    {item.pond}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    sectionHeader: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    headerTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
    },
    body: {
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    summaryContainer: {
        alignItems: 'center',
        minHeight: 70,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        width: '100%',
    },
    loadingContainer: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 10,
        color: colors.text,
        fontWeight: typography.fontWeight.regular,
    },
    summaryValue: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
    },
    chartAreaWrapper: {
        flexDirection: 'row',
        height: CHART_CONTENT_HEIGHT,
    },
    yAxisLabels: {
        justifyContent: 'space-between',
        paddingHorizontal: spacing.sm,
        height: BAR_MAX_HEIGHT + 14,
        marginTop: 13,
        paddingBottom: 3,
    },
    yLabelText: {
        fontSize: typography.fontSize.xs,
        color: colors.text,
        textAlign: 'right',
        width: 35,
    },
    yLabelWrapper: {
        height: 14,
        justifyContent: 'center',
    },
    chartContent: {
        flex: 1,
        height: CHART_CONTENT_HEIGHT,
    },
    gridContainer: {
        ...StyleSheet.absoluteFillObject,
        marginTop: 20,
        height: BAR_MAX_HEIGHT,
        justifyContent: 'space-between',
    },
    gridLine: {
        height: 0.75,
        backgroundColor: colors.defaultBorder,
    },
    barsWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: BAR_MAX_HEIGHT,
        marginTop: 20,
    },
    barColumn: {
        alignItems: 'center',
    },
    bar: {
        width: 20.48,
        backgroundColor: colors.orange[700],
    },
    topValueText: {
        fontSize: typography.fontSize.xs,
        marginBottom: spacing.xs,
        fontWeight: typography.fontWeight.regular,
    },
    bottomLabelText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.regular,
        marginTop: spacing.sm,
        position: 'absolute',
        bottom: -25,
    },
    headerButton: {
        // Ghi đè style của BasicDropDownButton
        height: 54,
        borderWidth: 0,
        backgroundColor: 'transparent',
        paddingHorizontal: spacing.md,
        borderRadius: 0,
    },
});
