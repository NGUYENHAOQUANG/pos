import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, typography } from '@/styles';
import { Loading } from '@/shared/components/ui/Loading';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
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
    pondCode?: string;
}

export const HarvestChart: React.FC<Props> = ({ zoneId, pondCode }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const { data: response, isLoading: queryLoading } = useHarvestStats({
        ZoneId: zoneId,
    });
    const isLoading = !isCollapsed && queryLoading;

    const statsData = response?.data;

    // TODO: API /report/harvest-stats không hỗ trợ filter theo pondId, luôn trả tất cả ao.
    // Đang filter client-side bằng pondCode. Khi BE cập nhật thì sửa lại dùng pondId.
    const byPondData = useMemo(() => {
        const allPonds = statsData?.byPond ?? [];
        if (pondCode) {
            return allPonds.filter(p => p.pondCode === pondCode);
        }
        return allPonds;
    }, [statsData?.byPond, pondCode]);

    // Convert kg → tấn (1 tấn = 1000 kg)
    const KG_TO_TAN = 1000;

    const totalYield = useMemo(() => {
        if (pondCode) {
            return byPondData.reduce((sum, p) => sum + p.totalHarvested, 0) / KG_TO_TAN;
        }
        return (statsData?.kpis?.totalHarvested ?? 0) / KG_TO_TAN;
    }, [byPondData, pondCode, statsData?.kpis?.totalHarvested]);

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
                <View style={[styles.body, isLoading ? styles.loadingContainer : undefined]}>
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
                                        value: `${totalYield.toFixed(3)} tấn`,
                                        color: '',
                                    }}
                                    variant="prodSummary"
                                />
                            </View>

                            <Text style={styles.chartTitle}>Khối lượng (Tấn)</Text>

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
        color: colors.textSecondary,
        paddingHorizontal: 16,
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
