import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, typography } from '@/styles';
import { Loading } from '@/shared/components/ui/Loading';
import { BasicDropDownButton } from '@/features/reports/components/BasicDropDownButton';
import { PondIndexCard } from '@/features/reports/components/env-chart/PondIndexCard';
import { Chart, HarvestChartData } from './Chart';
import { useHarvestStats } from '@/features/reports/hooks/useHarvestStats';
import chartStyles from '@/features/reports/styles/chart.styles';
import HarvestChartIcon from '@/assets/Icon/IconReport/HarvestChartIcon.svg';

const CHART_CONTENT_HEIGHT = 350; // Set to fit with padding

interface Props {
    zoneId: string;
    pondId?: string;
}

export const HarvestChart: React.FC<Props> = ({ zoneId, pondId }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const { data: response, isLoading: queryLoading } = useHarvestStats({
        ZoneId: zoneId,
        Id: pondId,
    });
    const isLoading = !isCollapsed && queryLoading;

    const statsData = response?.data;

    // Lọc theo pondId nếu có
    const filteredByPond = useMemo(() => {
        if (!statsData?.byPond) return [];
        if (pondId) {
            return statsData.byPond.filter(p => p.pondId === pondId);
        }
        return statsData.byPond;
    }, [statsData?.byPond, pondId]);

    const totalYield = useMemo(() => {
        if (pondId) {
            return filteredByPond.reduce((sum, p) => sum + p.totalHarvested, 0);
        }
        return statsData?.kpis?.totalHarvested ?? 0;
    }, [filteredByPond, pondId, statsData?.kpis?.totalHarvested]);

    const chartData: HarvestChartData[] = useMemo(() => {
        return filteredByPond.map(pondStat => ({
            pond: pondStat.pondName,
            yield: pondStat.totalHarvested,
        }));
    }, [filteredByPond]);

    // Get screen layout dimensions dynamically
    const screenWidth = Dimensions.get('window').width;
    // Assuming 16 horizontal padding on both sides in the container and parent views
    const chartWidth = screenWidth - 32;

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
                                <PondIndexCard
                                    item={{
                                        id: 'harvest-yield',
                                        name: 'Sản lượng đã thu hoạch',
                                        value: `${totalYield.toFixed(2)} tấn`,
                                        color: colors.orange[600],
                                    }}
                                    variant="prodSummary"
                                />
                            </View>

                            <Text style={styles.chartTitle}>Khối lượng (Tấn)</Text>

                            {chartData.length > 0 ? (
                                <Chart
                                    data={chartData}
                                    chartWidth={chartWidth}
                                    chartHeight={CHART_CONTENT_HEIGHT}
                                />
                            ) : null}
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
        paddingBottom: spacing.md,
        width: '100%',
    },
    loadingContainer: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartTitle: {
        marginBottom: spacing.sm,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        color: colors.textSecondary,
        fontFamily: typography.fontFamily.medium,
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
