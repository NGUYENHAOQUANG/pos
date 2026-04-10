import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing, typography } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Loading } from '@/shared/components/ui/Loading';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { BasicDropDownButton } from '@/features/reports/components/BasicDropDownButton';
import { PondIndexCard } from '@/features/reports/components/env-chart/PondIndexCard';
import { Chart } from './Chart';
import { HarvestChartData } from '@/features/reports/types/harvest-stats';
import { useHarvestStats } from '@/features/reports/hooks/useHarvestStats';
import { useChartStyles } from '@/features/reports/styles/chart.styles';
import HarvestChartIcon from '@/assets/Icon/IconReport/HarvestChartIcon.svg';

const CHART_CONTENT_HEIGHT = 350; // Set to fit with padding

import { HarvestChartProps } from '@/features/reports/types/harvest-stats';

export const HarvestChart: React.FC<HarvestChartProps> = ({ zoneId, pondId, seasonId }) => {
    const chartStyles = useChartStyles();
    const [isCollapsed, setIsCollapsed] = useState(true);
    const theme = useAppTheme();

    const { data: response, isLoading: queryLoading } = useHarvestStats({
        ZoneId: zoneId,
        PondIds: pondId ? [pondId] : undefined,
        SeasonId: seasonId,
    });
    const isLoading = !isCollapsed && queryLoading;

    const statsData = response?.data;

    const byPondData = useMemo(() => {
        return statsData?.byPond ?? [];
    }, [statsData?.byPond]);

    // Convert kg → tấn (1 tấn = 1000 kg)
    const KG_TO_TAN = 1000;

    const totalYield = useMemo(() => {
        if (pondId) {
            return byPondData.reduce((sum, p) => sum + p.totalHarvested, 0) / KG_TO_TAN;
        }
        return (statsData?.kpis?.totalHarvested ?? 0) / KG_TO_TAN;
    }, [byPondData, pondId, statsData?.kpis?.totalHarvested]);

    const chartData: HarvestChartData[] = useMemo(() => {
        return byPondData.map(pondStat => ({
            pond: pondStat.pondName,
            yield: pondStat.totalHarvested / KG_TO_TAN,
        }));
    }, [byPondData]);

    // Get screen layout dimensions dynamically
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth;

    return (
        <View style={chartStyles.container}>
            {/* Header-Section */}
            <BasicDropDownButton
                prefixIcon={<HarvestChartIcon width={20} height={20} />}
                label="Biểu đồ thu hoạch"
                onPress={() => setIsCollapsed(!isCollapsed)}
                style={styles.sectionHeader}
                isExpanded={!isCollapsed}
            />

            {!isCollapsed && (
                <View
                    style={[
                        styles.body,
                        { backgroundColor: theme.background },
                        isLoading ? styles.loadingContainer : undefined,
                    ]}
                >
                    {isLoading ? (
                        <Loading />
                    ) : chartData.length === 0 ? (
                        <EmptyStateCard message="Không có dữ liệu thu hoạch" />
                    ) : (
                        <>
                            <View style={styles.summaryContainer}>
                                <PondIndexCard
                                    item={{
                                        id: 'harvest-yield',
                                        name: 'Sản lượng đã thu hoạch',
                                        value: `${totalYield.toFixed(3).replace('.', ',')} tấn`,
                                        color: '',
                                    }}
                                    variant="prodSummary"
                                />
                            </View>

                            <Text style={[styles.chartTitle, { color: theme.textSecondary }]}>
                                Khối lượng (Tấn)
                            </Text>

                            <Chart
                                data={chartData}
                                chartWidth={chartWidth}
                                chartHeight={CHART_CONTENT_HEIGHT}
                            />
                        </>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    sectionHeader: {
        paddingHorizontal: 16,
    },
    body: {
        paddingVertical: 24,
    },
    summaryContainer: {
        paddingBottom: spacing.md,
        width: '100%',
        paddingHorizontal: 16,
    },
    loadingContainer: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartTitle: {
        marginVertical: 12,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,

        paddingHorizontal: 16,
    },
});
