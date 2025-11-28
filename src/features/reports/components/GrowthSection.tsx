import { colors, spacing, typography } from '@/styles';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ChartLine, LineChart } from './LineChart';
import { MetricCard } from './MetricCard';
import { ReportSegmentedControl } from './ReportSegmentedControl';

export interface GrowthSectionProps {
  containerStyle?: ViewStyle;
}

// Demo mock data - in production, this will be replaced with real API data
const getMockChartData = (): ChartLine[] => {
  return [
    {
      data: [
        { x: 0, y: 8 },
        { x: 1, y: 15 },
        { x: 2, y: 25 },
        { x: 3, y: 35 },
        { x: 4, y: 45 },
        { x: 5, y: 54 },
      ],
      color: colors.primary,
      label: 'Giá trị đo',
    },
    {
      data: [
        { x: 4, y: 45 },
        { x: 5, y: 54 },
        { x: 6, y: 58 },
      ],
      color: '#8FD5FF',
      label: 'Dự đoán',
      isDashed: true,
    },
    {
      data: [
        { x: 0, y: 7 },
        { x: 1, y: 12 },
        { x: 2, y: 20 },
        { x: 3, y: 28 },
        { x: 4, y: 38 },
        { x: 5, y: 44 },
      ],
      color: '#FFA769',
      label: 'Kì vọng',
    },
  ];
};

// Demo mock tooltip data - in production, this will be replaced with real API data
const getMockTooltipData = (): Record<
  number,
  { age: string; measured: string; prediction: string; expectation: string }
> => {
  return {
    0: { age: '76', measured: '8.05g', prediction: '10.10g', expectation: '7.10g' },
    1: { age: '91', measured: '15.05g', prediction: '18.10g', expectation: '12.10g' },
    2: { age: '106', measured: '25.05g', prediction: '28.10g', expectation: '20.10g' },
    3: { age: '121', measured: '35.05g', prediction: '38.10g', expectation: '28.10g' },
    4: { age: '136', measured: '45.05g', prediction: '48.10g', expectation: '38.10g' },
    5: { age: '151', measured: '55.05g', prediction: '58.10g', expectation: '45.10g' },
  };
};

export const GrowthSection: React.FC<GrowthSectionProps> = ({ containerStyle }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  // Sample data - in real app, this would come from props or API
  const tabs = ['Sản lượng', 'Trọng lượng con'];
  const updateTime = '17/11/2025, 9:30';

  // Demo mock data - in production, replace with API call based on filters
  const productionData: ChartLine[] = getMockChartData();
  const xAxisLabels = ['17/6', '17/7', '17/8', '17/9', '17/10', '17/11', '17/12'];

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tăng trưởng</Text>
        <Text style={styles.updateTime}>Cập nhật: {updateTime}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ReportSegmentedControl
          options={tabs}
          selectedIndex={selectedTab}
          onSelect={setSelectedTab}
        />
      </View>

      {/* Metric Cards */}
      <View style={styles.metricsContainer}>
        <MetricCard value="54.46" label="Trọng lượng (gram)" valueColor={colors.primary} />
        <MetricCard value="84.5" label="Tỉ lệ sống (%)" valueColor="#11B3B8" />
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          lines={productionData}
          xAxisLabels={xAxisLabels}
          yAxisMax={80}
          yAxisStep={10}
          getTooltipData={xIndex => {
            const tooltipDataMap = getMockTooltipData();
            return (
              tooltipDataMap[xIndex] || {
                age: '0',
                measured: '0g',
                prediction: '0g',
                expectation: '0g',
              }
            );
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xl, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  updateTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  tabsContainer: {
    marginBottom: spacing.sm,
  },
  metricsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    marginHorizontal: -spacing.xs, 
  },
  chartContainer: {
    marginTop: spacing.xs,
    marginBottom: 0, 
  },
});
