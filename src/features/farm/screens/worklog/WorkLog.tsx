import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { colors, spacing } from '@/styles';
import { DateRangeFilter } from '@/shared/components/forms/DateRangeFilter';
import { IconFilter, IconFilter2, IconDot } from '@/assets/icons';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { Filter } from '@/features/farm/components/worklog/Filter';
import { TrackingDayCard, TrackingGroup } from '@/features/farm/components/TrackingList';

export interface WorkLogProps {
    startDate: Date;
    endDate: Date;
    setStartDate: (date: Date) => void;
    setEndDate: (date: Date) => void;
    isFilterVisible: boolean;
    setIsFilterVisible: (visible: boolean) => void;
    selectedFilters: string[];
    isLoading: boolean;
    groupedLogs: TrackingGroup[];
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    onLoadMore?: () => void;
    availableFilterOptions: { label: string; value: string }[];
    handleApplyFilter: (selectedTypes: string[]) => void;
}

export const WorkLog: React.FC<WorkLogProps> = ({
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    isFilterVisible,
    setIsFilterVisible,
    selectedFilters,
    isLoading,
    groupedLogs,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
    availableFilterOptions,
    handleApplyFilter,
}) => {
    const hasData = groupedLogs.length > 0;
    const [showFooterSpinner, setShowFooterSpinner] = useState(false);

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage && onLoadMore) {
            onLoadMore();
        }
    }, [hasNextPage, isFetchingNextPage, onLoadMore]);

    // Giữ spinner footer tối thiểu một khoảng thời gian để tránh nháy giật
    useEffect(() => {
        if (isFetchingNextPage) {
            setShowFooterSpinner(true);
            return;
        }

        if (showFooterSpinner) {
            const timeout = setTimeout(() => {
                setShowFooterSpinner(false);
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [isFetchingNextPage, showFooterSpinner]);

    return (
        <View style={styles.container}>
            {/* Filter Section */}
            <View style={styles.filterSection}>
                <View style={styles.dateRangeContainer}>
                    <DateRangeFilter
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                        style={styles.dateRange}
                    />
                </View>
                <View style={{ position: 'relative' }}>
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setIsFilterVisible(true)}
                        activeOpacity={0.7}
                    >
                        {selectedFilters.length > 0 ? (
                            <IconFilter2 width={20} height={20} />
                        ) : (
                            <IconFilter width={20} height={20} />
                        )}
                    </TouchableOpacity>
                    {selectedFilters.length > 0 && (
                        <IconDot
                            width={12}
                            height={12}
                            style={{
                                position: 'absolute',
                                top: -2,
                                right: -2,
                            }}
                        />
                    )}
                </View>
            </View>

            {/* Content Section */}
            {isLoading && !hasData ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : hasData ? (
                <FlatList
                    data={groupedLogs}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.scrollContent}
                    renderItem={({ item, index }) => (
                        <TrackingDayCard
                            group={item}
                            isFirst={index === 0}
                            style={styles.dayCard}
                        />
                    )}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.4}
                    ListFooterComponent={
                        showFooterSpinner ? (
                            <View style={styles.footerLoader}>
                                <ActivityIndicator size="small" color={colors.primary} />
                            </View>
                        ) : null
                    }
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyStateContainer}>
                    <EmptyStateCard message="Chưa có dữ liệu" />
                </View>
            )}

            {/* Filter Modal */}
            <Filter
                visible={isFilterVisible}
                onClose={() => setIsFilterVisible(false)}
                onApply={handleApplyFilter}
                initialSelectedTypes={selectedFilters}
                availableOptions={availableFilterOptions}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    filterSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.backgroundPrimary,
        gap: spacing.sm,
    },
    dateRangeContainer: {
        flex: 1,
    },
    dateRange: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderRadius: 12,
        borderColor: colors.border,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
    },
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        paddingVertical: spacing.sm,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    listContainer: {
        gap: spacing.sm,
    },
    dayCard: {
        // Optional styling for the card container
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: spacing.md,
    },
    footerLoader: {
        paddingVertical: spacing.md,
    },
});
