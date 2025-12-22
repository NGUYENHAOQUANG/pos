import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { colors, spacing } from '@/styles';
import { JobExecution } from '@/features/farm/types/farm.types';
import { TransferMeta } from '@/features/farm/types/farm.types';
import { TimelineEntry } from '@/features/farm/components/Timeline';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { formatNumber } from '@/features/farm/utils/numberUtils';

interface TransferLogItemProps {
  item: JobExecution;
  meta?: TransferMeta;
  style?: ViewStyle;
  onEdit?: (item: JobExecution) => void;
}

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
