import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { colors, spacing } from '@/styles';
import { JobExecution } from '@/features/farm/context/FarmContext';
import { ShrimpInspectionMeta } from '@/features/farm/types/farm.types';
import { TimelineEntry } from '@/features/farm/components/Timeline';
import { ActivityData } from '@/features/farm/components/ActivityCard';

interface ShrimpInspectionLogItemProps {
  item: JobExecution;
  meta?: ShrimpInspectionMeta;
  style?: ViewStyle;
  onEdit?: (item: JobExecution) => void;
}

/**
 * Convert ShrimpInspectionMeta to ActivityData array for ActivityCard
 */
const convertShrimpInspectionMetaToActivityData = (meta: ShrimpInspectionMeta): ActivityData[] => {
  const data: ActivityData[] = [
    { label: 'Lượng thức ăn cho vào nhá:', value: meta.foodAmount || '--' },
    { label: 'Thức ăn thừa:', value: meta.leftoverFood || '--' },
    { label: 'Đường ruột:', value: meta.intestine || '--' },
    { label: 'Màu đường ruột:', value: meta.intestineColor || '--' },
    { label: 'Màu phân:', value: meta.stoolColor || '--' },
  ];

  if (meta.liver) {
    data.push({ label: 'Gan:', value: meta.liver });
  }
  if (meta.images && meta.images.length > 0) {
    data.push({ label: 'Hình ảnh:', value: `${meta.images.length} ảnh` });
  }

  return data;
};

export const ShrimpInspectionLogItem: React.FC<ShrimpInspectionLogItemProps> = ({
  item,
  meta = {},
  style,
  onEdit,
}) => {
  // Convert meta to ActivityData
  const activityData: ActivityData[] = useMemo(() => {
    return convertShrimpInspectionMetaToActivityData(meta);
  }, [meta]);

  return (
    <View style={[styles.container, style]}>
      <TimelineEntry
        time={item.time}
        title={item.label}
        data={activityData}
        note={meta.notes}
        onEdit={onEdit ? () => onEdit(item) : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
  },
});
