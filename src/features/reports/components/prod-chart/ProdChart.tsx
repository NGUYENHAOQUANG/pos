import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing } from '@/styles/spacing';
import { BasicDropDownButton } from '../BasicDropDownButton';
import { Loading } from '@/shared/components/ui/Loading';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { useChartStyles } from '@/features/reports/styles/chart.styles';
import ProdChartIcon from '@/assets/Icon/IconReport/ProdChartIcon.svg';
import { useProdChartData } from '../../hooks/useProductionDistribution';
import { ProdChartProps, ProdChartViewMode } from '../../types/production-distribution';
import { useAppTheme } from '@/styles/themeContext';
import { HeadingBar, HeadingBarItem } from '@/shared/components/layout/HeadingBar';
import { SummaryCard, VisualChart, DEFAULT_BAR_WIDTH } from './ProdChartSubComponents';

// ----------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------

const VIEW_MODE_TABS: HeadingBarItem[] = [
    { key: 'doc', label: 'Ngày tuổi' },
    { key: 'area', label: 'Khu vực' },
];

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

export const ProdChart = ({ zoneId, pondId }: ProdChartProps) => {
    const chartStyles = useChartStyles();
    const theme = useAppTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const [viewMode, setViewMode] = useState<ProdChartViewMode>('area');

    const { isLoading, activeData, yLabels, yMax, chartHeight, summaryCards } = useProdChartData(
        zoneId,
        pondId,
        isExpanded,
        viewMode
    );

    const handleToggle = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    const handleTabSelect = useCallback((tab: string) => {
        setViewMode(tab as ProdChartViewMode);
    }, []);

    const hasData = activeData.length > 0;

    return (
        <View style={chartStyles.container}>
            <BasicDropDownButton
                prefixIcon={<ProdChartIcon width={20} height={20} />}
                label="Biểu đồ sản lượng"
                isExpanded={isExpanded}
                onPress={handleToggle}
                style={styles.header}
            />

            {isExpanded && (
                <View style={styles.content}>
                    {/* Tab: Ngày tuổi / Khu vực */}
                    <HeadingBar
                        tabs={VIEW_MODE_TABS}
                        selectedTab={viewMode}
                        onTabSelect={handleTabSelect}
                        flexTabs
                        containerStyle={styles.tabContainer}
                    />

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <Loading />
                        </View>
                    ) : !hasData ? (
                        <EmptyStateCard message="Không có dữ liệu sản lượng" />
                    ) : (
                        <>
                            {/* Summary Cards Row */}
                            <View style={styles.summaryContainer}>
                                {summaryCards.map((card, index) => (
                                    <SummaryCard key={index} card={card} />
                                ))}
                            </View>

                            {/* Chart Section */}
                            <View style={styles.chartSection}>
                                <Text style={[styles.chartTitle, { color: theme.textSecondary }]}>
                                    Khối lượng (Tấn)
                                </Text>
                                <VisualChart
                                    key={viewMode}
                                    data={activeData}
                                    yLabels={yLabels}
                                    maxValue={yMax}
                                    height={chartHeight}
                                    barWidth={DEFAULT_BAR_WIDTH}
                                    viewMode={viewMode}
                                />
                            </View>
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
    },
    tabContainer: {
        marginHorizontal: -12,
    },
    content: {
        paddingTop: 12,
        paddingRight: 16,
        paddingBottom: 16,
        paddingLeft: 12,
        gap: 24,
    },
    summaryContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    chartSection: {
        gap: 24,
    },
    chartTitle: {
        marginBottom: spacing.sm,
        fontSize: 12,
        fontWeight: '500',
    },
    loadingContainer: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
