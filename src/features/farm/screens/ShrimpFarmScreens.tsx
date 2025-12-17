import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { colors, spacing } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeadingFarm } from '@/features/farm/components/HeadingFarm';
import { PondCycleEmptyState } from '@/features/farm/components/EmptyStateCard';
import { JobType, JobExecution } from '@/features/farm/components/pondwork/JobItem';
import { JobListCard } from '@/features/farm/components/pondwork/JobListCard';
import { Button } from '@/shared/components/buttons/Button';
import { useFarm } from '@/features/farm/context/FarmContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';

// Job Type Constants
const JOB_TYPES = {
  FEED: 'FEED' as const,
  SHRIMP_INSPECTION: 'SHRIMP_INSPECTION' as const,
  ENVIRONMENT: 'ENVIRONMENT' as const,
  WATER_TREATMENT: 'WATER_TREATMENT' as const,
  WATER_CHANGE: 'WATER_CHANGE' as const,
  SIPHON: 'SIPHON' as const,
  CLEAN_POND: 'CLEAN_POND' as const,
  SUN_DRY_POND: 'SUN_DRY_POND' as const,
};

// Initial Jobs Configuration (Template)
const JOB_TEMPLATE: { type: JobType; items: never[] }[] = [
  { type: JOB_TYPES.FEED, items: [] },
  { type: JOB_TYPES.SHRIMP_INSPECTION, items: [] },
  { type: JOB_TYPES.ENVIRONMENT, items: [] },
  { type: JOB_TYPES.WATER_TREATMENT, items: [] },
  { type: JOB_TYPES.WATER_CHANGE, items: [] },
  { type: JOB_TYPES.SIPHON, items: [] },
  { type: JOB_TYPES.CLEAN_POND, items: [] },
  { type: JOB_TYPES.SUN_DRY_POND, items: [] },
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

  const handleInfoPress = () => {
    if (pond) {
      navigation.navigate('PondInfo', { pond });
    }
  };

  const handleCyclePress = () => {
    console.log('Các chu kì nuôi pressed');
  };

  const menuOptions = [
    { value: 'Thông tin ao', onMenuOptionPress: handleInfoPress },
    { value: 'Các chu kì nuôi', onMenuOptionPress: handleCyclePress },
  ];

  const handleStartCycle = () => {
    console.log('Start Cycle pressed');
  };

  const handleAddJobItem = (type: JobType) => {
    if (!pond?.id) return;

    if (type === JOB_TYPES.FEED) {
      navigation.navigate('FeedTheShrimp', { pondId: pond.id });
      return;
    }

    // For shrimp inspection, go to inspection screen to enter details
    if (type === JOB_TYPES.SHRIMP_INSPECTION) {
      navigation.navigate('ShrimpInspectionScreen', { pond });
      return;
    }

    if (type === JOB_TYPES.ENVIRONMENT) {
      navigation.navigate('AddEnvironmentScreen', { pond });
      return;
    }

    if (type === JOB_TYPES.SIPHON) {
      navigation.navigate('AddSiphonScreen', { pond });
      return;
    }

    const currentItems = getPondJobItems(pond.id, type);

    // Calculate next index based on max existing label
    let maxIndex = 0;
    currentItems.forEach(item => {
      const match = item.label.match(/Lần (\d+)/);
      if (match) {
        const index = parseInt(match[1], 10);
        if (index > maxIndex) maxIndex = index;
      }
    });
    const nextIndex = maxIndex + 1;

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const newItem: JobExecution = {
      id: Date.now().toString(),
      label: `Lần ${nextIndex}`,
      time: timeString,
    };

    updatePondJob(pond.id, type, [...currentItems, newItem]);
  };

  const handleEditJobItem = (type: JobType, item: JobExecution) => {
    if (!pond?.id) return;

    if (type === JOB_TYPES.FEED) {
      // Navigate to Edit screen for Feed
      navigation.navigate('EditFeeder', { pondId: pond.id, jobId: item.id });
      return;
    }

    // For shrimp inspection, navigate to edit screen
    if (type === JOB_TYPES.SHRIMP_INSPECTION) {
      navigation.navigate('ShrimpInspectionScreen', { pond, itemToEdit: item });
      return;
    }

    if (type === JOB_TYPES.ENVIRONMENT) {
      navigation.navigate('AddEnvironmentScreen', { pond, itemToEdit: item });
      return;
    }

    if (type === JOB_TYPES.SIPHON) {
      navigation.navigate('AddSiphonScreen', { pond, itemToEdit: item });
      return;
    }

    const itemToEdit = item; // Alias for compatibility with below code if needed

    // For other job types, keep the delete behavior (or implement edit later)
    const currentItems = getPondJobItems(pond.id, type);
    const newItems = currentItems.filter(i => i.id !== itemToEdit.id);
    updatePondJob(pond.id, type, newItems);
  };

  const handleJobPress = (type: JobType) => {
    if (type === JOB_TYPES.FEED && pond?.id) {
      navigation.navigate('FeedingLog', { pondId: pond.id });
      return;
    }
    if (type === JOB_TYPES.SHRIMP_INSPECTION && pond) {
      navigation.navigate('PondworkLogScreen', { pond });
    }
    if (type === JOB_TYPES.ENVIRONMENT && pond) {
      navigation.navigate('EnvironmentLogScreen', { pond });
    }
    if (type === JOB_TYPES.SIPHON && pond) {
      navigation.navigate('SiphonLog', { pond });
    }
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
        menuOptions={menuOptions}
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
                onPressJob={handleJobPress}
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
