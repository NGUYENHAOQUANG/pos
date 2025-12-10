import React from 'react';
import { View, StyleSheet } from 'react-native';
import FeedingChart from '../../components/Chart/FeedingChart';
import FilterDate from '../../components/schedule/FilterDate';
import { spacing } from '@/styles';

function SensorStatisticsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.filterWrapper}>
        <FilterDate />
      </View>
      <FeedingChart />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterWrapper: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
});

export default SensorStatisticsScreen;
