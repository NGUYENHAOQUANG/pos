import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { colors, spacing } from '@/styles';
import { DateRangeFilter } from '@/shared/components/forms/DateRangeFilter';
import { EmptyStateCard } from '@/features/farm/components/EmptyStateCard';
import { Filter } from '@/features/farm/components/worklog/Filter';
import { PondData } from '@/features/farm/types/farm.types';
import { JobType, JOB_CONFIG } from '@/features/farm/components/pondwork/JobItem';
import { TrackingDayCard, TrackingGroup } from '@/features/farm/components/TrackingList';
import { usePondRecordGroups } from '@/features/farm/hooks/usePondRecords';
import { JobExecution } from '@/features/farm/types/farm.types';
import type { IPondRecordItem } from '@/features/farm/types/pondRecord.types';

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
    // State for DateRangeFilter
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1);
    });
    const [endDate, setEndDate] = useState(new Date());

    // State for Filter modal
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    // Fetch records from API
    const adjustedEndDate = useMemo(() => {
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        return d;
    }, [endDate]);

    const { groups, isLoading } = usePondRecordGroups(pond?.id || '', {
        startDate,
        endDate: adjustedEndDate,
        operationNameFilter: selectedFilters.length > 0 ? selectedFilters : undefined,
    });

    // Convert API groups to TrackingGroup[] with onEdit handlers
    const groupedLogs: TrackingGroup[] = useMemo(() => {
        return groups.map(group => ({
            id: group.id,
            date: group.date,
            activities: group.activities.map(activity => {
                // Get the hidden record item and jobType
                const recordItem = (activity as unknown as Record<string, unknown>)._recordItem as
                    | IPondRecordItem
                    | undefined;
                const jobType = (activity as unknown as Record<string, unknown>)._jobType as
                    | JobType
                    | undefined;

                return {
                    ...activity,
                    onEdit:
                        onEditJobItem && jobType && jobType !== 'TRANSFER_POND' && recordItem
                            ? () => {
                                  // Convert record to JobExecution for edit handler
                                  const createdDate = recordItem.createdAt
                                      ? new Date(recordItem.createdAt)
                                      : new Date();
                                  const timeStr = createdDate.toLocaleTimeString('en-GB', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                  });

                                  const refData: any = recordItem.referenceData || {};

                                  // Transform meta to match what Edit Screens expect (Work Tab compatibility)
                                  const mappedMeta = { ...refData };

                                  // Mapping for Measure Size
                                  if (refData.shrimpSizePcsPerKg)
                                      mappedMeta.shrimpSize = refData.shrimpSizePcsPerKg;
                                  if (refData.estimatedRemainingStockKg)
                                      mappedMeta.remainingWeight =
                                          refData.estimatedRemainingStockKg;

                                  // Mapping for Harvest
                                  if (refData.totalWeightKg)
                                      mappedMeta.yieldAmount = refData.totalWeightKg;
                                  // Harvest also uses shrimpSize, mapped above if key matches, or:
                                  if (refData.shrimpSizePcsPerKg)
                                      mappedMeta.shrimpSize = refData.shrimpSizePcsPerKg;

                                  // Mapping for Shrimp Inspection (images alias)
                                  if (refData.documents)
                                      mappedMeta.images = refData.documents
                                          .map((d: any) => d.publicUrl)
                                          .filter(Boolean);

                                  const jobExecution: JobExecution = {
                                      id: recordItem.id,
                                      label: activity.title,
                                      time: timeStr,
                                      date: group.date,
                                      pondId: pond?.id || '',

                                      // Map fields to match "Work Tab" structure (syncing Log -> Work)
                                      note: (refData.notes as string) ?? refData.note ?? undefined,
                                      materials: refData.materials, // Pass raw materials array
                                      documentIds: refData.documentIds,
                                      images: refData.images || refData.documentIds, // Fallback/Alias

                                      meta: mappedMeta, // Use transformed meta
                                      createdAt: recordItem.createdAt,
                                  };
                                  onEditJobItem(jobType, jobExecution);
                              }
                            : undefined,
                };
            }),
        }));
    }, [groups, onEditJobItem, pond?.id]);

    // Calculate available job types based on passed props (from Work tab)
    const availableFilterOptions = useMemo(() => {
        return availableJobTypes.map(type => ({
            label: JOB_CONFIG[type].defaultTitle,
            value: type,
        }));
    }, [availableJobTypes]);

    // Handle Filter Apply
    const handleApplyFilter = (selectedTypes: string[]) => {
        setSelectedFilters(selectedTypes);
    };

    const hasData = groupedLogs.length > 0;

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
                {/* <TouchableOpacity onPress={() => setIsFilterVisible(true)} activeOpacity={0.7}>
                    {selectedFilters.length > 0 ? (
                        <IconFilterActive width={40} height={40} />
                    ) : (
                        <IconFilter width={40} height={40} />
                    )}
                </TouchableOpacity> */}
            </View>

            {/* Content Section */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : hasData ? (
                    <View style={styles.listContainer}>
                        {groupedLogs.map((group, index) => (
                            <TrackingDayCard
                                key={group.id}
                                group={group}
                                isFirst={index === 0}
                                style={styles.dayCard}
                            />
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyStateContainer}>
                        <EmptyStateCard message="Chưa có dữ liệu" />
                    </View>
                )}
            </ScrollView>

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
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        gap: spacing.sm,
    },
    dateRangeContainer: {
        flex: 1,
    },
    dateRange: {
        height: 40,
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
});
