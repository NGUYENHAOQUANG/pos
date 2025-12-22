import React, { useState, useMemo } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useFarm } from '@/features/farm/context/FarmContext';
import { parseDate, compareTime } from '@/features/farm/utils/dateUtils';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';

// Components Tracking
import { TrackingGroup, TimelineActivity } from '@/features/farm/components/TrackingList';
import { ActivityData } from '@/features/farm/components/ActivityCard';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'HandleProblemLog'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const HandleProblemLogScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { pond, jobType = 'CLEAN_POND' } = route.params || {};
  const { getPondJobItemsGroupedByDate } = useFarm();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const currentJobType: 'CLEAN_POND' | 'SUN_DRY_POND' = jobType as 'CLEAN_POND' | 'SUN_DRY_POND';
  const screenTitle = 'Nhật ký xử lý sự cố';
  const emptyMessage = 'Chưa có dữ liệu xử lý sự cố';
  const buttonTitle = 'Bắt đầu ghi lại sự cố';

  const handleCreateNew = () => {
    if (pond) navigation.navigate('HandleProblem', { pond, jobType: currentJobType });
  };

  // Logic Grouping Data
  const groupedData: TrackingGroup[] = useMemo(() => {
    if (!pond?.id) return [];

    const itemsByDate = getPondJobItemsGroupedByDate(pond.id, currentJobType, startDate, endDate);

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
                jobType: currentJobType,
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
  }, [pond, navigation, getPondJobItemsGroupedByDate, startDate, endDate, currentJobType]);

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
    />
  );
};
