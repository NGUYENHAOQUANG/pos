import React, { useState, useMemo } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useFarm } from '@/features/farm/store/farmStore';
import { parseDate, compareTime } from '@/features/farm/utils/dateUtils';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';

// Components Tracking
import { TrackingGroup, TimelineActivity } from '@/features/farm/components/TrackingList';
import { ActivityData } from '@/features/farm/components/ActivityCard';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'SunDryPondLog'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const SunDryPondLogScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond } = route.params || {};
    const { getPondJobItemsGroupedByDate } = useFarm();

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const handleCreateNew = () => {
        if (pond) navigation.navigate('HandleProblem', { pond, jobType: 'SUN_DRY_POND' });
    };

    // Logic Grouping Data
    const groupedData: TrackingGroup[] = useMemo(() => {
        if (!pond?.id) return [];

        const itemsByDate = getPondJobItemsGroupedByDate(
            pond.id,
            'SUN_DRY_POND',
            startDate,
            endDate
        );

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
                                jobType: 'SUN_DRY_POND',
                            });
                        }
                    },
                };
            });

            groups.push({
                id: dateKey,
                date: dateKey,
                activities: activities.sort((a, b) => compareTime(b.time, a.time)),
            });
        });

        // Sort groups by date (oldest first)
        return groups.sort((a, b) => {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateA.getTime() - dateB.getTime();
        });
    }, [pond, navigation, getPondJobItemsGroupedByDate, startDate, endDate]);

    return (
        <BaseLogScreen
            title="Nhật ký phơi ao"
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            groupedData={groupedData}
            emptyMessage="Chưa có dữ liệu phơi ao"
            emptyButtonTitle="Bắt đầu phơi ao"
            onEmptyButtonPress={handleCreateNew}
            useFlatCardStyle={true}
        />
    );
};
