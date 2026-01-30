import React, { useState, useMemo } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useIncidentsAsJobs } from '@/features/farm/hooks/useIncidentData';
import { parseDate, compareTime, formatDate } from '@/features/farm/utils/dateUtils';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';

// Components Tracking
import { TrackingGroup, TimelineActivity } from '@/features/farm/components/TrackingList';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { JobExecution } from '@/features/farm/types/farm.types';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'HandleProblemLog'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const HandleProblemLogScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond, jobType = 'CLEAN_POND' } = route.params || {};
    const getPondJobItemsGroupedByDate = useFarmStore(state => state.getPondJobItemsGroupedByDate);

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const currentJobType: JobType = jobType as JobType;

    // GET incident với khoảng ngày (CreateAtFrom/CreateAtTo) khi màn Nhật ký Xử lý sự cố
    const incidentListParams = useMemo(() => {
        if (currentJobType !== 'TROUBLESHOOTING' || !pond?.id) return undefined;
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return {
            CreateAtFrom: start.toISOString(),
            CreateAtTo: end.toISOString(),
            Page: 1,
            PageSize: 100,
        };
    }, [currentJobType, pond?.id, startDate, endDate]);

    const {
        jobs: apiIncidentJobs,
        isLoading: isIncidentLoading,
        refetch: refetchIncidents,
        isRefetching: isIncidentRefetching,
    } = useIncidentsAsJobs(pond?.id || '', incidentListParams);

    const getTitle = () => {
        switch (currentJobType) {
            case 'CLEAN_POND':
                return 'Nhật ký Rửa ao';
            case 'SUN_DRY_POND':
                return 'Nhật ký Phơi ao';
            case 'TROUBLESHOOTING':
                return 'Nhật ký Xử lý sự cố';
            default:
                return 'Nhật ký Xử lý sự cố';
        }
    };

    const screenTitle = getTitle();
    const emptyMessage = 'Chưa có dữ liệu xử lý sự cố';
    const buttonTitle = 'Bắt đầu ghi lại sự cố';

    const handleCreateNew = () => {
        if (pond) navigation.navigate('HandleProblem', { pond, jobType: currentJobType as any });
    };

    // Logic Grouping Data – use API data for TROUBLESHOOTING, store for CLEAN_POND / SUN_DRY_POND
    const groupedData: TrackingGroup[] = useMemo(() => {
        if (!pond?.id) return [];

        let itemsByDate: Map<string, JobExecution[]>;

        if (currentJobType === 'TROUBLESHOOTING') {
            // API đã filter theo CreateAtFrom/CreateAtTo, chỉ cần group theo ngày
            itemsByDate = new Map<string, JobExecution[]>();
            apiIncidentJobs.forEach(item => {
                const dateKey = item.date || formatDate(new Date());
                if (!itemsByDate.has(dateKey)) itemsByDate.set(dateKey, []);
                itemsByDate.get(dateKey)!.push(item);
            });
            itemsByDate.forEach(items =>
                items.sort((a, b) => {
                    const ta = a.createdAt ? new Date(a.createdAt).getTime() : NaN;
                    const tb = b.createdAt ? new Date(b.createdAt).getTime() : NaN;
                    if (!Number.isNaN(ta) && !Number.isNaN(tb)) return tb - ta;
                    return compareTime(b.time ?? '00:00', a.time ?? '00:00');
                })
            );
        } else {
            itemsByDate = getPondJobItemsGroupedByDate(pond.id, currentJobType, startDate, endDate);
        }

        if (itemsByDate.size === 0) return [];

        const groups: TrackingGroup[] = [];

        itemsByDate.forEach((dateItems, dateKey) => {
            const activities: TimelineActivity[] = dateItems.map(job => {
                const displayData: ActivityData[] = [];

                if (job.materials && job.materials.length > 0) {
                    job.materials.forEach(m => {
                        displayData.push({
                            label: m.material.name,
                            value: m.quantity.toString(),
                            unit: m.unit,
                        });
                    });
                }

                return {
                    id: job.id,
                    time: job.time,
                    title: job.label,
                    data: displayData,
                    note: job.note,
                    onEdit: () => {
                        if (pond) {
                            navigation.navigate('HandleProblem', {
                                pond,
                                item: job,
                                jobType: currentJobType as any,
                            });
                        }
                    },
                };
            });

            groups.push({
                id: dateKey,
                date: dateKey,
                activities: activities.sort((a, b) => {
                    const jobA = dateItems.find(j => j.id === a.id);
                    const jobB = dateItems.find(j => j.id === b.id);
                    const ta = jobA?.createdAt ? new Date(jobA.createdAt).getTime() : NaN;
                    const tb = jobB?.createdAt ? new Date(jobB.createdAt).getTime() : NaN;
                    if (!Number.isNaN(ta) && !Number.isNaN(tb)) return tb - ta;
                    return compareTime(b.time, a.time);
                }),
            });
        });

        // Sort groups by date (oldest first)
        return groups.sort((a, b) => {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateA.getTime() - dateB.getTime();
        });
    }, [
        pond,
        navigation,
        getPondJobItemsGroupedByDate,
        startDate,
        endDate,
        currentJobType,
        apiIncidentJobs,
    ]);

    const isLoading = currentJobType === 'TROUBLESHOOTING' ? isIncidentLoading : false;
    const onRefresh = currentJobType === 'TROUBLESHOOTING' ? refetchIncidents : undefined;
    const isRefreshing = currentJobType === 'TROUBLESHOOTING' ? isIncidentRefetching : false;

    return (
        <BaseLogScreen
            title={screenTitle}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            groupedData={groupedData}
            emptyMessage={emptyMessage}
            emptyButtonTitle={buttonTitle}
            onEmptyButtonPress={handleCreateNew}
            useFlatCardStyle={true}
            isLoading={isLoading}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
        />
    );
};
