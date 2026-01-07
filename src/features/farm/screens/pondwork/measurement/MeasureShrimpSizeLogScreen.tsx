import React, { useMemo, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useFarm } from '@/features/farm/context/FarmContext';
import { TrackingGroup } from '@/features/farm/components/TrackingList';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';
import { MeasureSizeMeta, JobExecution } from '@/features/farm/types/farm.types';
import { convertMeasureSizeMetaToActivityData } from '@/features/farm/utils/metaConverters';

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
        if (!pond?.id) return new Map();
        return getPondJobItemsGroupedByDate(pond.id, 'MEASURE_SIZE', startDate, endDate);
    }, [getPondJobItemsGroupedByDate, pond?.id, startDate, endDate]);

    const trackingGroups: TrackingGroup[] = useMemo(() => {
        const groups = Array.from(itemsByDate.entries());

        const mappedGroups = groups.map(([dateKey, dateItems]) => {
            // Sort activities within the group by "Lần" number (ascending)
            dateItems.sort((a: JobExecution, b: JobExecution) => {
                const aNum = parseInt(a.label.replace('Lần ', ''), 10) || 0;
                const bNum = parseInt(b.label.replace('Lần ', ''), 10) || 0;
                return aNum + bNum;
            });

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

            // Format the date title for the group header
            const dateStr = dateKey.replace('Hôm nay, ', '');
            const isToday = dateKey === new Date().toLocaleDateString('en-GB');
            const displayDate = isToday ? `Hôm nay, ${dateStr}` : dateStr;

            return {
                id: dateKey,
                date: displayDate,
                activities: activities,
            };
        });

        // Sort the groups by date, descending (newest first)
        return mappedGroups.sort((a, b) => {
            const parseDate = (dStr: string) => {
                const clean = dStr.replace('Hôm nay, ', '');
                const [day, month, year] = clean.split('/').map(Number);
                return new Date(year, month - 1, day).getTime();
            };
            return parseDate(b.date) - parseDate(a.date);
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
