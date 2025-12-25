import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/styles';
import { BasicDropDownButton } from '@/features/reports/components/BasicDropDownButton';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import { mockFoodChartData } from './foodData';

const BAR_MAX_HEIGHT = 200;

export const FoodChart: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date('2025-11-01'));

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const chartData = useMemo(() => {
    const dateStr = formatDate(selectedDate);
    const data = mockFoodChartData.find(d => d.date === dateStr);

    if (!data) return null;

    return [
      { id: '1', value: data.time06, label: '06:00' },
      { id: '2', value: data.time08, label: '08:00' },
      { id: '3', value: data.time10, label: '10:00' },
      { id: '4', value: data.time12, label: '12:00' },
      { id: '5', value: data.time14, label: '14:00' },
      { id: '6', value: data.time16, label: '16:00' },
      { id: '7', value: data.time18, label: '18:00' },
      { id: '8', value: data.time20, label: '20:00' },
    ];
  }, [selectedDate]);

  const totalFood = useMemo(() => {
    const dateStr = formatDate(selectedDate);
    return mockFoodChartData.find(d => d.date === dateStr)?.total || 0;
  }, [selectedDate]);

  const yAxisConfig = useMemo(() => {
    if (!chartData) return { max: 40, labels: [40, 30, 20, 10, 0] };

    const maxValue = Math.max(...chartData.map(d => d.value));
    const roundMax = Math.ceil(maxValue / 10) * 10 || 10; // Round up to nearest 10

    // Create 4 steps
    const step = roundMax / 4;
    const labels = [roundMax, roundMax - step, roundMax - step * 2, roundMax - step * 3, 0];

    return { max: roundMax, labels };
  }, [chartData]);

  const getBarHeight = (value: number) => (value / yAxisConfig.max) * BAR_MAX_HEIGHT;

  return (
    <View style={styles.card}>
      <View style={styles.headerWrapper}>
        <BasicDropDownButton
          label="THỐNG KÊ LƯỢNG THỨC ĂN"
          onPress={() => setIsCollapsed(!isCollapsed)}
          style={styles.headerButton}
        />

        <View style={styles.absDatePicker}>
          <DateInputButton
            date={selectedDate}
            onDateChange={setSelectedDate}
            height={32}
            dateText={selectedDate.toISOString().split('T')[0]}
          />
        </View>
      </View>

      {!isCollapsed && (
        <View style={styles.body}>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryLabel}>Tổng lượng thức ăn (kg)</Text>
            <Text style={styles.summaryValue}>{totalFood}</Text>
          </View>

          <View style={styles.chartAreaWrapper}>
            <View style={styles.yAxisLabels}>
              {yAxisConfig.labels.map((val) => (
                <View key={val} style={styles.yLabelWrapper}>
                  <Text style={styles.yLabelText}>{val}</Text>
                </View>
              ))}
              <Text style={styles.unitText}>kg</Text>
            </View>

            <View style={styles.chartContent}>
              <View style={styles.gridContainer}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={[styles.gridLine, { top: i * (BAR_MAX_HEIGHT / 4) }]}
                  />
                ))}
              </View>

              <View style={styles.barsWrapper}>
                {chartData ? (
                  chartData.map((item) => (
                    <View key={item.id} style={styles.barColumn}>
                      <View style={[styles.bar, { height: getBarHeight(item.value) }]} />
                      <View style={styles.labelContainer}>
                        <Text style={styles.bottomLabelText}>{item.label}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={{ marginTop: 80, fontSize: 12, color: colors.textSecondary }}>
                    Không có dữ liệu
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    width: '100%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  headerWrapper: {
    height: 94,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerButton: {
    height: 50,
    borderWidth: 0,
    paddingHorizontal: spacing.md,
    justifyContent: 'flex-start',
    paddingTop: 12,
  },
  customDateFontSize: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.regular,
  },
  absDatePicker: {
    position: 'absolute',
    left: 16,
    bottom: 14,
    width: 150,
    height: 32,
    zIndex: 999,
  },
  headerTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textTransform: 'uppercase',
  },
  body: {
    paddingTop: spacing.lg,
    paddingRight: spacing.sm,
    paddingBottom: spacing.md,
    paddingLeft: spacing.sm,
  },
  datePicker: {
    width: 100,
    height: 40,
    borderRadius: 1,
    borderColor: colors.borderMedium,
    marginBottom: 12,
  },
  summaryContainer: {
    alignItems: 'center',
    marginBottom: 34,
  },
  summaryLabel: {
    fontSize: 10,
    color: colors.text,
    marginTop: 4,
  },
  summaryValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  chartAreaWrapper: {
    flexDirection: 'row',
    height: BAR_MAX_HEIGHT + 32,
    marginBottom: 0,
  },
  yAxisLabels: {
    justifyContent: 'space-between',
    height: BAR_MAX_HEIGHT + 14,
    marginTop: -7,
    paddingRight: 8,
  },
  yLabelText: {
    fontSize: 8,
    color: colors.text,
    textAlign: 'right',
    width: 20,
  },
  yLabelWrapper: {
    height: 14,
    justifyContent: 'center'
  },
  unitText: {
    fontSize: 10,
    color: colors.text,
    position: 'absolute',
    left: -5,
    top: '50%',
    transform: [{ rotate: '-90deg' }],
  },
  chartContent: {
    flex: 1,
    height: BAR_MAX_HEIGHT,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'transparent',
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    height: BAR_MAX_HEIGHT,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomWidth: 0.5,
    borderStyle: 'dashed',
    backgroundColor: colors.border,
  },
  barsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: BAR_MAX_HEIGHT,
    paddingBottom: 0,
  },
  barColumn: {
    alignItems: 'center',
    width: 30,
  },
  bar: {
    width: 6,
    backgroundColor: colors.orange[700],
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  labelContainer: {
    position: 'absolute',
    bottom: -25,
    width: 50,
    alignItems: 'center',
  },
  bottomLabelText: {
    fontSize: 8,
    color: colors.text,
    transform: [{ rotate: '-45deg' }],
    textAlign: 'center',
  },
});

