import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { colors, spacing, borderRadius, typography } from '@/styles';
import { JobExecution } from '@/features/farm/context/FarmContext';
import { IconEditOutlined } from '@/assets/icons';

interface ShrimpInspectionLogItemProps {
  item: JobExecution;
  meta?: any;
  style?: ViewStyle;
  onEdit?: (item: JobExecution) => void;
}

interface RowData {
  label: string;
  value: string;
}

const MAX_VISIBLE_ITEMS = 5;

export const ShrimpInspectionLogItem: React.FC<ShrimpInspectionLogItemProps> = ({
  item,
  meta = {},
  style,
  onEdit,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Tạo mảng các fields từ meta
  const allRows: RowData[] = useMemo(() => {
    const rows: RowData[] = [
      { label: 'Lượng thức ăn cho vào nhá:', value: meta.foodAmount || '--' },
      { label: 'Thức ăn thừa:', value: meta.leftoverFood || '--' },
      { label: 'Đường ruột:', value: meta.intestine || '--' },
      { label: 'Màu đường ruột:', value: meta.intestineColor || '--' },
      { label: 'Màu phân:', value: meta.stoolColor || '--' },
    ];

    // Thêm các fields khác nếu có
    if (meta.liver) {
      rows.push({ label: 'Gan:', value: meta.liver });
    }
    if (meta.notes) {
      rows.push({ label: 'Ghi chú:', value: meta.notes });
    }
    if (meta.images && meta.images.length > 0) {
      rows.push({ label: 'Hình ảnh:', value: `${meta.images.length} ảnh` });
    }

    return rows;
  }, [meta]);

  const hasMoreItems = allRows.length > MAX_VISIBLE_ITEMS;
  const visibleRows = isExpanded ? allRows : allRows.slice(0, MAX_VISIBLE_ITEMS);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={[styles.itemRow, style]}>
      {/* Time column */}
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>

      {/* Timeline + card */}
      <View style={styles.timelineColumn}>
        <View style={styles.timelineLine} />
        <View style={styles.timelineCircle} />
      </View>

      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.label}</Text>
            <TouchableOpacity onPress={() => onEdit?.(item)} activeOpacity={0.7}>
              <IconEditOutlined width={14} height={14} />
            </TouchableOpacity>
          </View>
          <View style={styles.rowsContainer}>
            {visibleRows.map((row, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{row.label}</Text>
                <Text style={styles.value}>{row.value}</Text>
              </View>
            ))}
          </View>

          {hasMoreItems && (
            <TouchableOpacity
              style={styles.moreButton}
              onPress={handleToggleExpand}
              activeOpacity={0.7}
            >
              <Text style={styles.moreText}>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</Text>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  timeColumn: {
    width: 60,
    paddingTop: spacing.sm,
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.regular,
  },
  timelineColumn: {
    alignItems: 'center',
    marginRight: 16,
    alignSelf: 'stretch',
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    width: 2,
    top: 0,
    bottom: -16,
    backgroundColor: colors.borderLight,
  },
  timelineCircle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#00000040',
    backgroundColor: colors.white,
    top: 4,
    zIndex: 1,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 5,
    paddingTop: 4,
    backgroundColor: '#00000005',
    paddingHorizontal: spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  rowsContainer: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  value: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  moreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  moreText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 22,
  },
});
