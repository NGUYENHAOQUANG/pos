import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { colors, spacing } from '@/styles';
import { JobExecution } from '@/features/farm/context/FarmContext';
import { TransferMeta } from '@/features/farm/types/farm.types';
import { TimelineEntry } from '@/features/farm/components/Timeline';
import { ActivityData } from '@/features/farm/components/ActivityCard';

interface TransferLogItemProps {
  item: JobExecution;
  meta?: TransferMeta;
  style?: ViewStyle;
  onEdit?: (item: JobExecution) => void;
}

/**
 * Format number with dots as thousand separators
 */
const formatNumber = (num: string | number): string => {
  const numStr = typeof num === 'string' ? num.replace(/\D/g, '') : num.toString();
  if (!numStr) return '';
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Convert TransferMeta to ActivityData array for ActivityCard
 */
const convertTransferMetaToActivityData = (meta: TransferMeta): ActivityData[] => {
  const data: ActivityData[] = [];

  if (meta.shrimpSize) {
    data.push({
      label: 'Cỡ tôm (con/kg)',
      value: meta.shrimpSize,
    });
  }

  if (meta.transferMethod) {
    data.push({
      label: 'Hình thức chuyển',
      value: meta.transferMethod,
    });
  }

  if (meta.receivingPonds && meta.receivingPonds.length > 0) {
    meta.receivingPonds.forEach((pond, index) => {
      const pondLabel = pond.receivingPond ? `Ao nhận ${index + 1}` : `Ao nhận ${index + 1}`;
      const quantity = pond.quantity ? formatNumber(pond.quantity) : '';
      if (quantity) {
        data.push({
          label: pondLabel,
          value: `${quantity} con`,
        });
      }
    });
  }

  return data;
};

export const TransferLogItem: React.FC<TransferLogItemProps> = ({
  item,
  meta = {},
  style,
  onEdit,
}) => {
  const activityData: ActivityData[] = useMemo(() => {
    return convertTransferMetaToActivityData(meta);
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
