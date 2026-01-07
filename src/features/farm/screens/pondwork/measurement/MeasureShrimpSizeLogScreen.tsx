import React, { useMemo, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useFarm } from '@/features/farm/context/FarmContext';
import { TrackingGroup } from '@/features/farm/components/TrackingList';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';
import { MeasureSizeMeta, JobExecution } from '@/features/farm/types/farm.types';
import { convertMeasureSizeMetaToActivityData } from '@/features/farm/utils/metaConverters';
import { compareTime, parseDate } from '@/features/farm/utils/dateUtils';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'MeasureShrimpSizeLogScreen'>;

export const MeasureShrimpSizeLogScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { params } = useRoute<ScreenRouteProp>();
    const { pond } = params || {};
    const { getPondJobItemsGroupedByDate } = useFarm();

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const itemsByDate = useMemo(() => {
        if (!pond?.id) return new Map<string, JobExecution[]>();
        return getPondJobItemsGroupedByDate(pond.id, 'MEASURE_SIZE', startDate, endDate);
    }, [getPondJobItemsGroupedByDate, pond?.id, startDate, endDate]);

    const trackingGroups: TrackingGroup[] = useMemo(() => {
        const groups = Array.from(itemsByDate.entries());

        const mappedGroups = groups.map(([dateKey, dateItems]) => {
            // Sort activities within the group by time (descending)
            dateItems.sort((a: JobExecution, b: JobExecution) => compareTime(b.time, a.time));

            const activities = dateItems.map((item: JobExecution) => {
                const meta = (item.meta as MeasureSizeMeta) || ({} as MeasureSizeMeta);
                const activityData = convertMeasureSizeMetaToActivityData(item, meta);

                return {
                    id: item.id,
                    time: item.time,
                    title: item.label,
                    data: activityData,
                    note: meta?.notes || item.note,
                    onEdit: () => {
                        if (pond) {
                            navigation.navigate('MeasureShrimpSizeScreen', {
                                pond,
                                itemToEdit: item,
                            });
                        }
                    },
                };
            });

            return {
                id: dateKey,
                date: dateKey,
                activities: activities,
            };
        });

        // Sort the groups by date, descending (newest first)
        return mappedGroups.sort((a, b) => {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateB.getTime() - dateA.getTime();
        });
    }, [itemsByDate, pond, navigation]);

    const handleNavigateToCreate = () => {
        if (pond) {
            navigation.navigate('MeasureShrimpSizeScreen', { pond });
        }
    };

    return (
        <BaseLogScreen
            title="Nhật ký đo kích thước tôm"
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            groupedData={trackingGroups}
            emptyMessage="Chưa có dữ liệu đo kích thước tôm"
            emptyButtonTitle="Bắt đầu đo kích thước tôm"
            onEmptyButtonPress={handleNavigateToCreate}
        />
    );
};
