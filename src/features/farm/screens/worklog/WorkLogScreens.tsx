import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { colors, spacing } from '@/styles';
import { DateRangeFilter } from '@/shared/components/forms/DateRangeFilter';
import { IconFilter, IconFilter2, IconDot } from '@/assets/icons';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { Filter } from '@/features/farm/components/worklog/Filter';
import { PondData } from '@/features/farm/types/farm.types';
import { JobType, JOB_CONFIG } from '@/features/farm/components/pondwork/JobItem';
import { TrackingDayCard, TrackingGroup } from '@/features/farm/components/TrackingList';
import { JobExecution } from '@/features/farm/types/farm.types';
import { usePondRecordGroups } from '@/features/farm/hooks/usePondRecords';
import { buildPondRecordGroups } from '@/features/farm/services/worklog.service';
import { useFarmMaterials } from '@/features/farm/hooks/useFarmMaterials';
import { useEnvironmentInit } from '@/features/farm/hooks/pondwork/envhooks/useEnvironmentLogic';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { mapRecordItemToJobExecution } from '@/features/farm/services/worklog.service';
import type { IPondRecordItem } from '@/features/farm/types/pondRecord.types';
import { useDateRangeFilter } from '@/shared/hooks/useDateRangeFilter';

interface WorkLogScreensProps {
    pond?: PondData;
    onEditJobItem?: (type: JobType, item: JobExecution) => void;
    availableJobTypes?: JobType[];
}

export const WorkLogScreens: React.FC<WorkLogScreensProps> = ({
    pond,
    onEditJobItem,
    availableJobTypes = [],
}) => {
    const { startDate, endDate, setStartDate, setEndDate } = useDateRangeFilter();

    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    const { rawItems, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        usePondRecordGroups(pond?.id || '', {
            startDate,
            endDate,
            operationNameFilter: selectedFilters.length > 0 ? selectedFilters : undefined,
        });

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const { materialMap } = useFarmMaterials();
    const { metricTypes } = useEnvironmentInit();
    const ponds = useFarmStore(s => s.ponds);
    const pondNameMap = useMemo(() => {
        const map: Record<string, string> = {};
        ponds.forEach(p => {
            if (p.id && p.name) map[p.id] = p.name;
        });
        return map;
    }, [ponds]);

    const groups = useMemo(
        () =>
            buildPondRecordGroups(rawItems, {
                materialMap,
                metricTypes,
                pondNameMap,
            }),
        [rawItems, materialMap, metricTypes, pondNameMap]
    );

    const groupedLogs: TrackingGroup[] = useMemo(() => {
        return groups.map(group => ({
            id: group.id,
            date: group.date,
            activities: group.activities.map(activity => {
                const recordItem = (activity as unknown as { _recordItem?: IPondRecordItem })
                    ._recordItem;
                const jobType = (activity as unknown as { _jobType?: JobType })._jobType;
                const canEdit =
                    onEditJobItem && jobType && jobType !== 'TRANSFER_POND' && recordItem;

                return {
                    ...activity,
                    onEdit: canEdit
                        ? () => {
                              const jobExecution = mapRecordItemToJobExecution(
                                  recordItem,
                                  activity.title,
                                  group.date,
                                  pond?.id || ''
                              );
                              onEditJobItem(jobType, jobExecution);
                          }
                        : undefined,
                };
            }),
        }));
    }, [groups, onEditJobItem, pond?.id]);

    const availableFilterOptions = useMemo(() => {
        return availableJobTypes.map(type => ({
            label: JOB_CONFIG[type].defaultTitle,
            value: type,
        }));
    }, [availableJobTypes]);

    const handleApplyFilter = (selectedTypes: string[]) => {
        setSelectedFilters(selectedTypes);
    };

    const hasData = groupedLogs.length > 0;
    const [showFooterSpinner, setShowFooterSpinner] = useState(false);
    useEffect(() => {
        if (isFetchingNextPage) {
            setShowFooterSpinner(true);
            return;
        }
        if (showFooterSpinner) {
            const t = setTimeout(() => setShowFooterSpinner(false), 300);
            return () => clearTimeout(t);
        }
    }, [isFetchingNextPage, showFooterSpinner]);

    return (
        <View style={styles.container}>
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
                    // Performance optimizations
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews
                />
            ) : (
                <View style={styles.emptyStateContainer}>
                    <EmptyStateCard message="Chưa có dữ liệu" />
                </View>
            )}

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
        paddingBottom: spacing.sm,
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
    dayCard: {},
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: spacing.md,
    },
    footerLoader: {
        paddingVertical: spacing.md,
    },
});
