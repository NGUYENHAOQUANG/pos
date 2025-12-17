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
import {
  TrackingGroup,
  TrackingDayCard,
  TimelineActivity,
} from '@/features/farm/components/TrackingList';
import { ActivityData } from '@/features/farm/components/ActivityCard';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'WaterSupplyLog'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

interface WaterSupplyJob extends JobExecution {
  targetLevel?: string | number;
  supplyLevel?: string | number;
  drainLevel?: string | number;
  volumeAfterDrain?: string | number;
  volumeSupply?: string | number;
  volumeAfterSupply?: string | number;
}

export const WaterSupplyLogScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { pond } = route.params || {};
  const { getPondJobItems } = useFarm();

  // Mock date state for display (Filter)
  const [startDate, _setStartDate] = useState(
    new Date().toLocaleDateString('en-GB').replace(/\//g, '/')
  );
  const [endDate, _setEndDate] = useState(
    new Date().toLocaleDateString('en-GB').replace(/\//g, '/')
  );

  const handleCreateNew = () => {
    if (pond) {
      navigation.navigate('WaterSupply', { pond });
    }
  };

  // --- Logic Grouping & Transformation Data ---
  const groupedData: TrackingGroup[] = useMemo(() => {
    if (!pond?.id) return [];

    // Lấy dữ liệu loại WATER_CHANGE từ Context
    const jobs = getPondJobItems(pond.id, 'WATER_CHANGE');
    if (!jobs || jobs.length === 0) return [];

    const groups: Record<string, TimelineActivity[]> = {};

    jobs.forEach(_job => {
      const job = _job as WaterSupplyJob;

      // Dùng ngày lưu trong job hoặc mặc định hôm nay
      const dateKey = job.date || new Date().toLocaleDateString('en-GB');

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      // Chuyển đổi (Map) các trường dữ liệu Nước sang ActivityData[] chuẩn
      const displayData: ActivityData[] = [
        { label: 'Mực nước mục tiêu', value: job.targetLevel || '-', unit: 'cm' },
        { label: 'Số cm cấp', value: job.supplyLevel || '-', unit: 'cm' },
        // Các trường phụ sẽ tự động ẩn vào "Xem thêm" nếu danh sách dài
        { label: 'Mực nước xả xuống', value: job.drainLevel || '-', unit: 'cm' },
        { label: 'Thể tích sau xả', value: job.volumeAfterDrain || '-', unit: 'm³' },
        { label: 'Thể tích nước cấp vào', value: job.volumeSupply || '-', unit: 'm³' },
        { label: 'Thể tích nước sau cấp', value: job.volumeAfterSupply || '-', unit: 'm³' },
      ];
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
        // Sắp xếp activity theo giờ giảm dần
        const sortedActivities = groups[date].sort((a, b) => b.time.localeCompare(a.time));

        return {
          id: date,
          date: date === new Date().toLocaleDateString('en-GB') ? `Hôm nay, ${date}` : date,
          activities: sortedActivities,
        };
      })
      .sort((a, b) => {
        // Sắp xếp nhóm ngày giảm dần
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
      {/* Header */}
      <HeaderFarm type="simple" title="Nhật ký thay/cấp nước" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        {/* Date Range Picker Filter */}
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
                message="Chưa có dữ liệu thay/cấp nước"
                buttonTitle="Bắt đầu thay/cấp nước"
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
