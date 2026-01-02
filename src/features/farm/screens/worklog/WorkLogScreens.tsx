import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '@/styles';
import { DateRangeFilter } from '@/shared/components/forms/DateRangeFilter';
import { IconFilter, IconFilterActive } from '@/assets/icons';
import { EmptyStateCard } from '@/features/farm/components/EmptyStateCard';
import { Filter } from '@/features/farm/components/worklog/Filter';
import { PondData, JobExecution } from '@/features/farm/types/farm.types';
import { useFarm } from '@/features/farm/context/FarmContext';
import { JobType, JOB_CONFIG } from '@/features/farm/components/pondwork/JobItem';
import {
    TrackingDayCard,
    TrackingGroup,
    TimelineActivity,
} from '@/features/farm/components/TrackingList';
import { parseDate, formatDate, compareTime } from '@/features/farm/utils/dateUtils';
import { TouchableOpacity } from 'react-native';
import {
    convertEnvironmentMetaToActivityData,
    convertShrimpInspectionMetaToActivityData,
    convertSiphonMetaToActivityData,
    convertTransferMetaToActivityData,
    convertHarvestMetaToActivityData,
    convertFeedJobToActivityData,
    convertWaterSupplyMetaToActivityData,
    convertWaterTreatmentJobToActivityData,
    convertMeasureSizeMetaToActivityData,
} from '@/features/farm/utils/metaConverters';

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
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    // State for Filter modal
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    const { getPondJobItems } = useFarm();

    // Helper to get data for a specific job
    const getJobData = (type: JobType, item: JobExecution) => {
        switch (type) {
            case 'FEED':
                return convertFeedJobToActivityData(item);
            case 'SHRIMP_INSPECTION':
                return convertShrimpInspectionMetaToActivityData((item.meta as any) || {});
            case 'MEASURE_SIZE':
                return convertMeasureSizeMetaToActivityData(item, (item.meta as any) || {});
            case 'ENVIRONMENT':
                return convertEnvironmentMetaToActivityData((item.meta as any) || {});
            case 'WATER_TREATMENT':
                return convertWaterTreatmentJobToActivityData(item);
            case 'WATER_CHANGE':
                return convertWaterSupplyMetaToActivityData(item, (item.meta as any) || {});
            case 'SIPHON':
                return convertSiphonMetaToActivityData(item, (item.meta as any) || {});
            case 'TRANSFER_POND':
                return convertTransferMetaToActivityData((item.meta as any) || {});
            case 'HARVEST':
                return convertHarvestMetaToActivityData(item, (item.meta as any) || {});
            case 'CLEAN_POND':
            case 'SUN_DRY_POND':
                // These might not have specific meta converters or use generic ones
                return item.note ? [{ label: 'Ghi chú', value: item.note }] : [];
            default:
                return [];
        }
    };

    // Calculate available job types based on passed props (from Work tab)
    const availableFilterOptions = useMemo(() => {
        return availableJobTypes.map(type => ({
            label: JOB_CONFIG[type].defaultTitle,
            value: type,
        }));
    }, [availableJobTypes]);

    // Calculate grouped logs
    const groupedLogs: TrackingGroup[] = useMemo(() => {
        if (!pond?.id) return [];

        let allJobs: { type: JobType; item: JobExecution }[] = [];

        // 1. Collect jobs for available types
        availableJobTypes.forEach(type => {
            const items = getPondJobItems(pond.id, type);
            items.forEach(item => {
                allJobs.push({ type, item });
            });
        });

        // 2. Filter by date
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        allJobs = allJobs.filter(({ item }) => {
            const date = item.date ? parseDate(item.date) : new Date();
            return date >= start && date <= end;
        });

        // 3. Filter by type (if filters selected)
        if (selectedFilters.length > 0) {
            allJobs = allJobs.filter(({ type }) => selectedFilters.includes(type));
        }

        // 4. Sort by date desc, then time desc
        allJobs.sort((a, b) => {
            const dateA = a.item.date ? parseDate(a.item.date) : new Date(0);
            const dateB = b.item.date ? parseDate(b.item.date) : new Date(0);
            if (dateA.getTime() !== dateB.getTime()) {
                return dateB.getTime() - dateA.getTime();
            }
            // Compare time HH:mm (descending)
            return compareTime(b.item.time || '00:00', a.item.time || '00:00');
        });

        // 5. Group by date
        const groups: Record<string, TimelineActivity[]> = {};
        const groupOrder: string[] = [];

        allJobs.forEach(({ type, item }) => {
            const dateStr = item.date || formatDate(new Date());
            if (!groups[dateStr]) {
                groups[dateStr] = [];
                groupOrder.push(dateStr);
            }

            groups[dateStr].push({
                id: item.id,
                time: item.time,
                title: JOB_CONFIG[type]?.defaultTitle || item.label,
                data: getJobData(type, item),
                note: item.note,
                onEdit: () => onEditJobItem?.(type, item),
            });
        });

        // Sort activities within each group by time descending
        Object.keys(groups).forEach(dateKey => {
            groups[dateKey].sort((a, b) => compareTime(b.time || '00:00', a.time || '00:00'));
        });

        // Sort groups by date descending
        groupOrder.sort((a, b) => {
            const dateA = parseDate(a);
            const dateB = parseDate(b);
            return dateB.getTime() - dateA.getTime();
        });

        return groupOrder.map(date => ({
            id: date,
            date: date,
            activities: groups[date],
        }));
    }, [
        pond?.id,
        getPondJobItems,
        startDate,
        endDate,
        selectedFilters,
        onEditJobItem,
        availableJobTypes,
    ]);

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
                <TouchableOpacity onPress={() => setIsFilterVisible(true)} activeOpacity={0.7}>
                    {selectedFilters.length > 0 ? (
                        <IconFilterActive width={40} height={40} />
                    ) : (
                        <IconFilter width={40} height={40} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Content Section */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {hasData ? (
                    <View style={styles.listContainer}>
                        {groupedLogs.map(group => (
                            <TrackingDayCard key={group.id} group={group} style={styles.dayCard} />
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
        // Remove default margin or padding if necessary to fit design
    },
    scrollContent: {
        flexGrow: 1,
        paddingVertical: spacing.sm,
    },
    listContainer: {
        gap: spacing.sm,
    },
    dayCard: {
        // Optional styling for the card container if needed
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'flex-start',
    },
});
