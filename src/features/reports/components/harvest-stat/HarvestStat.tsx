/**
 * @file HarvestStat.tsx
 * @description Harvest statistics with infinite scroll (optimized for nested ScrollView)
 */
import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { BasicDropDownButton } from '../BasicDropDownButton';
import { colors } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Loading } from '@/shared/components/ui/Loading';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { HarvestItemCard } from './HarvestItemCard';
import { useChartStyles } from '@/features/reports/styles/chart.styles';
import HarvestStatIcon from '@/assets/Icon/IconReport/HarvestStatistics.svg';
import { useInfiniteHarvestStatsTable } from '@/features/reports/hooks/useHarvestStatsTable';
import { HarvestStatProps } from '@/features/reports/types/harvest-stats-table';

// Wrap item with React.memo for performance
const MemoizedHarvestItemCard = React.memo(HarvestItemCard);

export const HarvestStat: React.FC<HarvestStatProps> = ({ zoneId, pondId, seasonId, cycleId }) => {
    const chartStyles = useChartStyles();
    const theme = useAppTheme();
    const [isSectionOpen, setIsSectionOpen] = React.useState(false);

    const { dataList, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
        useInfiniteHarvestStatsTable({
            ZoneId: zoneId,
            PondIds: pondId ? [pondId] : undefined,
            SeasonId: seasonId,
            CycleId: cycleId,
            enabled: isSectionOpen,
        });

    const toggleSection = () => {
        setIsSectionOpen(!isSectionOpen);
    };

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <View style={chartStyles.container}>
            <BasicDropDownButton
                prefixIcon={<HarvestStatIcon width={20} height={20} />}
                label="Thống kê thu hoạch"
                style={styles.sectionHeader}
                onPress={toggleSection}
                isExpanded={isSectionOpen}
            />

            {isSectionOpen && (
                <View
                    style={[
                        styles.listContainer,
                        { backgroundColor: theme.background },
                        isLoading ? styles.loadingContainer : undefined,
                    ]}
                >
                    {isLoading ? (
                        <Loading />
                    ) : dataList.length === 0 ? (
                        <EmptyStateCard message="Không có dữ liệu thu hoạch" />
                    ) : (
                        <>
                            {dataList.map((item, index) => (
                                <MemoizedHarvestItemCard
                                    key={item.recordId}
                                    item={item}
                                    index={index}
                                />
                            ))}

                            {/* Load more button */}
                            {isFetchingNextPage && (
                                <View style={styles.footerLoader}>
                                    <ActivityIndicator
                                        color={theme.isDark ? '#fb923c' : colors.primary}
                                    />
                                </View>
                            )}

                            {hasNextPage && !isFetchingNextPage && (
                                <TouchableOpacity
                                    style={styles.loadMoreButton}
                                    onPress={handleLoadMore}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.loadMoreText,
                                            { color: theme.isDark ? '#fb923c' : colors.primary },
                                        ]}
                                    >
                                        Tải thêm
                                    </Text>
                                </TouchableOpacity>
                            )}
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
    listContainer: {
        paddingTop: 8,
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    loadingContainer: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerLoader: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    loadMoreButton: {
        alignSelf: 'stretch',
        height: 40,
        borderWidth: 1,
        borderColor: colors.gray[200],
        borderRadius: 10,

        alignItems: 'center',
        justifyContent: 'center',
    },
    loadMoreText: {
        fontSize: 14,

        fontWeight: '500',
    },
});
