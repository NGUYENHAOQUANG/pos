import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
// Removed unused Ionicons import
import { colors, spacing } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { EmptyStateCard } from '@/features/farm/components/EmptyStateCard';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { DateRangeFilter } from '@/shared/components/forms/DateRangeFilter';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'FeedingLog'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

import { useFarm } from '@/features/farm/context/FarmContext';
import {
  TrackingGroup,
  TrackingDayCard,
  TimelineActivity,
} from '@/features/farm/components/TrackingList';

export const FeedingLogScreens = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { pondId } = route.params || {};
  const { getPondJobItems } = useFarm();

  // Mock date state for display (Filter)
  const [startDate, _setStartDate] = useState(
    new Date().toLocaleDateString('en-GB').replace(/\//g, '-')
  );
  const [endDate, _setEndDate] = useState(
    new Date().toLocaleDateString('en-GB').replace(/\//g, '-')
  );

  const handleStartFeeding = () => {
    // Navigate to AddFeeder with pondId
    if (pondId) {
      navigation.navigate('FeedTheShrimp', { pondId });
    }
  };

  // Group data by date
  const groupedData: TrackingGroup[] = React.useMemo(() => {
    // Get real data inside useMemo to ensure hook rules are followed
    const feedJobs = pondId ? getPondJobItems(pondId, 'FEED') : [];

    if (!feedJobs.length) return [];

    const groups: Record<string, TimelineActivity[]> = {};

    feedJobs.forEach(job => {
      // Use stored date or default to today if missing (legacy)
      const dateKey = job.date || new Date().toLocaleDateString('en-GB');

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      const activity: TimelineActivity = {
        id: job.id,
        time: job.time,
        title: job.label,
        data:
          job.materials?.map(m => ({
            label: m.material.name,
            value: `${m.quantity} ${m.unit}`,
          })) || [],
        note: job.note,
      };
      groups[dateKey].push(activity);
    });

    // Transform to array and sort
    return Object.keys(groups)
      .map(date => {
        // Sort activities by time desc (simple string compare works for HH:mm if consistent, else parse)
        const sortedActivities = groups[date].sort((a, b) => b.time.localeCompare(a.time));

        return {
          id: date,
          date: date === new Date().toLocaleDateString('en-GB') ? `Hôm nay, ${date}` : date,
          activities: sortedActivities,
        };
      })
      .sort((a, b) => {
        // Sort groups by date desc (dd/mm/yyyy)
        const parseDate = (dStr: string) => {
          const clean = dStr.replace('Hôm nay, ', '');
          const [day, month, year] = clean.split('/').map(Number);
          return new Date(year, month - 1, day).getTime();
        };
        return parseDate(b.date) - parseDate(a.date);
      });
  }, [pondId, getPondJobItems]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <HeaderFarm type="simple" title="Nhật ký cho ăn" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        {/* Date Range Picker Mockup */}
        <View style={styles.filterContainer}>
          <DateRangeFilter
            startLabel={startDate}
            endLabel={endDate}
            onPressStart={() => console.log('Start Date pressed')}
            onPressEnd={() => console.log('End Date pressed')}
            onPressCalendar={() => console.log('Calendar pressed')}
          />
        </View>

        {/* Content List */}
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
                message="Chưa có dữ liệu cho ăn"
                buttonTitle="Bắt đầu cho ăn"
                onPress={handleStartFeeding}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  content: {
    flex: 1,
  },
  filterContainer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: spacing.md,
    flexGrow: 1,
  },
  cardContainer: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
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
