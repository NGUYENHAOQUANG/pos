import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { colors, spacing } from '@/styles';
import { JobExecution } from '@/features/farm/types/farm.types';
import { SiphonMeta } from '@/features/farm/types/farm.types';
import { TimelineEntry } from '@/features/farm/components/Timeline';
import { ActivityData } from '@/features/farm/components/ActivityCard';

interface SiphonLogItemProps {
  item: JobExecution;
  meta?: SiphonMeta;
  style?: ViewStyle;
  onEdit?: (item: JobExecution) => void;
}

/**
 * Convert SiphonMeta + materials to ActivityData array for ActivityCard
 */
const convertSiphonMetaToActivityData = (item: JobExecution, meta: SiphonMeta): ActivityData[] => {
  const data: ActivityData[] = [];

  if (meta.lossAmount) {
    data.push({
      label: 'Hao hụt trong ao',
      value: meta.lossAmount,
    });
  }

  if (item.materials && item.materials.length > 0) {
    item.materials.forEach(materialItem => {
      data.push({
        label: materialItem.material.name,
        value: `${materialItem.quantity} ${materialItem.unit}`,
      });
    });
  }

  if (meta.images && meta.images.length > 0) {
    data.push({
      label: 'Hình ảnh',
      value: `${meta.images.length} ảnh`,
    });
  }

  return data;
};

export const SiphonLogItem: React.FC<SiphonLogItemProps> = ({ item, meta = {}, style, onEdit }) => {
  const activityData: ActivityData[] = useMemo(() => {
    return convertSiphonMetaToActivityData(item, meta);
  }, [item, meta]);

  return (
    <View style={[styles.container, style]}>
      <TimelineEntry
        time={item.time}
        title={item.label}
        data={activityData}
        note={item.note}
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
