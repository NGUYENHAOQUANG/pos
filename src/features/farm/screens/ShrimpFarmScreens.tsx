import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { colors, spacing } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeadingFarm } from '../components/HeadingFarm';
import { PondCycleEmptyState } from '../components/EmptyStateCard';
import { JobType, JobExecution } from '../components/pondwork/JobItem';
import { JobListCard } from '../components/pondwork/JobListCard';
import { Button } from '@/shared/components/buttons/Button';
import { useFarm } from '../context/FarmContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FarmStackParamList } from '../navigation/FarmNavigator';

// Initial Jobs Configuration (Template)
const JOB_TEMPLATE: { type: JobType; items: never[] }[] = [
  { type: 'FEED', items: [] },
  { type: 'ENVIRONMENT', items: [] },
  { type: 'WATER_TREATMENT', items: [] },
  { type: 'WATER_CHANGE', items: [] },
  { type: 'CLEAN_POND', items: [] },
  { type: 'SUN_DRY_POND', items: [] },
];

interface ShrimpFarmScreensProps {}

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'PondDetail'>;

export const ShrimpFarmScreens: React.FC<ShrimpFarmScreensProps> = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { pond } = route.params || {};

  const [selectedTab, setSelectedTab] = useState<string>('work');
  const { setTabBarVisible } = useTabBarVisibility();
  const { getPondJobItems, updatePondJob } = useFarm();

  // Construct jobs list from context
  const jobs = JOB_TEMPLATE.map(template => ({
    ...template,
    items: pond?.id ? getPondJobItems(pond.id, template.type) : [],
  }));

  // Hide tab bar when this screen is mounted
  useEffect(() => {
    setTabBarVisible(false);
    return () => {
      setTabBarVisible(true);
    };
  }, [setTabBarVisible]);

  const handleMenuPress = () => {
    navigation.goBack();
  };

  const handleStartCycle = () => {
    console.log('Start Cycle pressed');
  };

  const handleAddJobItem = (type: JobType) => {
    if (!pond?.id) return;

    const currentItems = getPondJobItems(pond.id, type);
    const nextIndex = currentItems.length + 1;
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const newItem: JobExecution = {
      id: Date.now().toString(),
      label: `Lần ${nextIndex}`,
      time: timeString,
    };

    updatePondJob(pond.id, type, [...currentItems, newItem]);
  };

  const handleEditJobItem = (type: JobType, itemToDelete: JobExecution) => {
    if (!pond?.id) return;

    const currentItems = getPondJobItems(pond.id, type);
    const newItems = currentItems.filter(i => i.id !== itemToDelete.id);

    updatePondJob(pond.id, type, newItems);
  };

  return (
    <View style={styles.container}>
      {/* Header & Tabs */}
      <HeadingFarm
        selectedTab={selectedTab}
        onTabSelect={setSelectedTab}
        tabType="pond-detail"
        fullWidth
        pond={pond}
        onBack={() => navigation.goBack()}
        onMenuPress={handleMenuPress}
      />

      {/* Content */}
      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {selectedTab === 'work' ? (
            <>
              {/* Empty State / Status */}
              <PondCycleEmptyState />

              {/* Job List Card Container */}
              <JobListCard
                jobs={jobs}
                onPressJob={type => console.log(`Pressed ${type}`)}
                onPressAddJob={handleAddJobItem}
                onEditJobItem={handleEditJobItem}
              />
            </>
          ) : (
            // Placeholder for Log tab
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Nhật ký công việc chưa có dữ liệu</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Bottom Button */}
      {selectedTab === 'work' && (
        <View style={styles.footer}>
          <Button
            title="Bắt đầu chu kỳ nuôi"
            onPress={handleStartCycle}
            variant="primary"
            iconLeft="add"
            style={styles.startButton}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary || '#F4F6F8',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for footer
    flexGrow: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  startButton: {
    width: '100%',
  },
  placeholderContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.text,
  },
});
