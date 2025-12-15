import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';

interface ScheduleDescriptionTabProps {
  type: 'history' | 'schedule';
}

export const ScheduleDescriptionTab: React.FC<ScheduleDescriptionTabProps> = ({ type }) => {
  return (
    <View style={styles.container}>
      {/* Row 1: Common for both types */}
      <View style={styles.row}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>{type === 'history' ? 'Đã chạy' : 'Lịch hoạt động'}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: colors.error }]} />
          <Text style={styles.legendText}>Thời điểm hiện tại</Text>
        </View>
      </View>

      {/* Row 2: Only for History */}
      {type === 'history' && (
        <View style={styles.row}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: colors.schedule.remote }]} />
            <Text style={styles.legendText}>Điều khiển từ xa</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: colors.schedule.schedule }]} />
            <Text style={styles.legendText}>Lịch trình</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: colors.schedule.local }]} />
            <Text style={styles.legendText}>Điều khiển tại chỗ</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,

    // Legend Box styling
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  legendLine: {
    width: 24,
    height: 1,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
