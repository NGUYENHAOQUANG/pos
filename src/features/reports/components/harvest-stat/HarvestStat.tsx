/**
 * @file HarvestStat.tsx
 * @description Harvest statistics with infinite scroll (optimized for nested ScrollView)
 */
import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { BasicDropDownButton } from '../BasicDropDownButton';
import { colors } from '@/styles';
import { Loading } from '@/shared/components/ui/Loading';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { HarvestItemCard } from './HarvestItemCard';
import chartStyles from '@/features/reports/styles/chart.styles';
import HarvestStatIcon from '@/assets/Icon/IconReport/Vector (8).svg';
import { useInfiniteHarvestStatsTable } from '@/features/reports/hooks/useHarvestStatsTable';
import { HarvestStatProps } from '@/features/reports/types/harvest-stats-table';

// Wrap item with React.memo for performance
const MemoizedHarvestItemCard = React.memo(HarvestItemCard);

export const HarvestStat: React.FC<HarvestStatProps> = ({ zoneId, pondId, cycleId }) => {
    const [isSectionOpen, setIsSectionOpen] = React.useState(false);

    const { dataList, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
        useInfiniteHarvestStatsTable({
            ZoneId: zoneId,
            Id: pondId,
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
                    style={[styles.listContainer, isLoading ? styles.loadingContainer : undefined]}
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
                                    <ActivityIndicator color={colors.primary} />
                                </View>
                            )}

                            {hasNextPage && !isFetchingNextPage && (
                                <TouchableOpacity
                                    style={styles.loadMoreButton}
                                    onPress={handleLoadMore}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.loadMoreText}>Tải thêm</Text>
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
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
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
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
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
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadMoreText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
});
