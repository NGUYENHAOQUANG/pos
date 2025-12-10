import React from 'react';
import { View } from 'react-native';
import FeedingChart from '../../components/Chart/FeedingChart';
import FilterDate from '../../components/CustomFeedingMachine/FilterDate';

function SensorStatisticsScreen() {
  return (
    <View>
      <FilterDate />
      <FeedingChart />
    </View>
  );
}

export default SensorStatisticsScreen;
