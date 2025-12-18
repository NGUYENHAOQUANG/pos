import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { EmptyStateCard } from '@/features/farm/components/EmptyStateCard';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { DateRangeFilter } from '@/shared/components/forms/DateRangeFilter';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useFarm } from '@/features/farm/context/FarmContext';
import {
  TrackingGroup,
  TrackingDayCard,
  TimelineActivity,
} from '@/features/farm/components/TrackingList';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'WaterTreatmentLog'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const WaterTreatmentLogScreens = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { pondId, pond } = route.params || {};
  const targetPondId = pondId || pond?.id;

  const { getPondJobItems } = useFarm();

  // Mock date state for display (Filter)
  const [startDate, _setStartDate] = useState(
    new Date().toLocaleDateString('en-GB').replace(/\//g, '-')
  );
  const [endDate, _setEndDate] = useState(
    new Date().toLocaleDateString('en-GB').replace(/\//g, '-')
  );

  const handleStartActivity = () => {
    if (pond) {
      navigation.navigate('AddWaterTreatmentScreen', { pond });
    } else if (targetPondId) {
    }
  };

  // Group data by date
  const groupedData: TrackingGroup[] = React.useMemo(() => {
    const jobs = targetPondId ? getPondJobItems(targetPondId, 'WATER_TREATMENT') : [];

    if (!jobs.length) return [];

    const groups: Record<string, TimelineActivity[]> = {};

    jobs.forEach(job => {
      const dateKey = job.date || new Date().toLocaleDateString('en-GB');

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      const dataRows = [];

      // Add Activity Type row
      if (job.waterTreatmentType) {
        dataRows.push({
          label: 'Loại hoạt động',
          value: job.waterTreatmentType,
        });
      }

      // Add Materials
      if (job.materials && job.materials.length > 0) {
        job.materials.forEach(m => {
          dataRows.push({
            label: m.material.name,
            value: `${m.quantity} ${m.unit}`,
          });
        });
      }

      const activity: TimelineActivity = {
        id: job.id,
        time: job.time,
        title: job.label,
        data: dataRows,
        note: job.note,
        onEdit: () => {
          navigation.navigate('EditWaterTreatmentScreens', {
            pondId: targetPondId!,
            jobId: job.id,
          });
        },
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
  }, [targetPondId, getPondJobItems, navigation]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <HeaderFarm type="simple" title="Nhật ký xử lý nước" onBack={() => navigation.goBack()} />

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
                message="Chưa có dữ liệu xử lý nước"
                buttonTitle="Thêm hoạt động"
                onPress={handleStartActivity}
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
