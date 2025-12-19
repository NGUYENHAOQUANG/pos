import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { EmptyStateCard } from '@/features/farm/components/EmptyStateCard';
import { DateRangeFilter } from '@/shared/components/forms/DateRangeFilter';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useFarm, JobExecution } from '@/features/farm/context/FarmContext';

// Components Tracking
import {
  TrackingGroup,
  TrackingDayCard,
  TimelineActivity,
} from '@/features/farm/components/TrackingList';
import { ActivityData } from '@/features/farm/components/ActivityCard';

// Interface mở rộng
interface CLEAN_PONDJob extends JobExecution {
  materials?: {
    material: { name: string };
    quantity: string | number;
    unit: string;
  }[];
}

type ScreenRouteProp = RouteProp<FarmStackParamList, 'HandleProblemLog'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const HandleProblemLogScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { pond } = route.params || {};
  const { getPondJobItems } = useFarm();

  const [startDate] = useState(new Date().toLocaleDateString('en-GB').replace(/\//g, '/'));
  const [endDate] = useState(new Date().toLocaleDateString('en-GB').replace(/\//g, '/'));

  const handleCreateNew = () => {
    if (pond) navigation.navigate('HandleProblem', { pond });
  };

  // Logic Grouping Data
  const groupedData: TrackingGroup[] = useMemo(() => {
    if (!pond?.id) return [];

    const jobs = getPondJobItems(pond.id, 'CLEAN_POND');
    if (!jobs || jobs.length === 0) return [];

    const groups: Record<string, TimelineActivity[]> = {};

    jobs.forEach(_job => {
      const job = _job as CLEAN_PONDJob;
      const dateKey = job.date || new Date().toLocaleDateString('en-GB');

      if (!groups[dateKey]) groups[dateKey] = [];

      const displayData: ActivityData[] = [];

      if (job.materials && job.materials.length > 0) {
        job.materials.forEach(m => {
          displayData.push({
            label: m.material.name,
            value: m.quantity,
            unit: m.unit,
          });
        });
      }

      const activity: TimelineActivity = {
        id: job.id,
        time: job.time,
        title: job.label,
        data: displayData,
        note: job.note,
      };

      groups[dateKey].push(activity);
    });

    return Object.keys(groups)
      .map(date => {
        const sortedActivities = groups[date].sort((a, b) => b.time.localeCompare(a.time));
        return {
          id: date,
          date: date === new Date().toLocaleDateString('en-GB') ? `Hôm nay, ${date}` : date,
          activities: sortedActivities,
        };
      })
      .sort((a, b) => {
        const parseDate = (dStr: string) => {
          const clean = dStr.replace('Hôm nay, ', '');
          const [day, month, year] = clean.split('/').map(Number);
          return new Date(year, month - 1, day).getTime();
        };
        return parseDate(b.date) - parseDate(a.date);
      });
  }, [pond?.id, getPondJobItems]);

  return (
    <View style={styles.container}>
      <HeaderFarm type="simple" title="Nhật ký xử lý sự cố" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <View style={styles.filterContainer}>
          <DateRangeFilter
            startLabel={startDate}
            endLabel={endDate}
            onPressStart={() => {}}
            onPressEnd={() => {}}
            onPressCalendar={() => {}}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {groupedData.length > 0 ? (
            groupedData.map(group => (
              <TrackingDayCard key={group.id} group={group} style={styles.flatCard} />
            ))
          ) : (
            <View style={styles.cardContainer}>
              <EmptyStateCard
                message="Chưa có dữ liệu xử lý sự cố"
                buttonTitle="Bắt đầu ghi lại sự cố"
                onPress={handleCreateNew}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundPrimary },
  content: { flex: 1 },
  filterContainer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  scrollContent: { paddingTop: 16, paddingBottom: spacing.md, flexGrow: 1 },
  cardContainer: { marginTop: spacing.md, paddingHorizontal: spacing.md },
  flatCard: {
    borderRadius: 0,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 12,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
});
