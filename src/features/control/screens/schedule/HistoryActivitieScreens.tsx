import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { HeadingDevices, CONTROL_TABS } from '../../components/HeaderDevices';
import { HistoryActivitie } from '../../components/schedule/HistoryActivitie';
import FilterDate from '../../components/schedule/FilterDate';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { colors, spacing } from '@/styles';

interface HistoryActivitieScreensProps {
  pondName?: string;
  onBack?: () => void;
}

import SensorStatisticsScreen from '../SensorStatisticsScreen/SensorStatisticsScreen';

export const HistoryActivitieScreens: React.FC<HistoryActivitieScreensProps> = ({
  pondName = 'Ao 1',
  onBack,
}) => {
  const { setTabBarVisible } = useTabBarVisibility();
  const [activeTab, setActiveTab] = React.useState(CONTROL_TABS[0].key);

  React.useEffect(() => {
    // Hide custom tab bar
    setTabBarVisible(false);

    return () => {
      // Restore custom tab bar
      setTabBarVisible(true);
    };
  }, [setTabBarVisible]);

  const renderRightComponent = () => (
    <View style={styles.rightComponentContainer}>
      <Text style={styles.rightText}>{pondName}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeadingDevices
        tabs={CONTROL_TABS}
        selectedTab={activeTab}
        onTabSelect={setActiveTab}
        onBackPress={onBack}
        rightComponent={renderRightComponent()}
      />
      <View style={styles.content}>
        {activeTab === 'history' ? (
          <>
            <View style={styles.filterWrapper}>
              <FilterDate />
            </View>
            <HistoryActivitie />
          </>
        ) : (
          <SensorStatisticsScreen />
        )}
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
    paddingBottom: 0,
  },
  filterWrapper: {
    marginTop: spacing.md,
    marginBottom: spacing.xs, // Small gap before list
  },
  rightComponentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rightText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
