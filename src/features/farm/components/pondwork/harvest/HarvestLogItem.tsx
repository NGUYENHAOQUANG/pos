import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '@/styles';
import { JobExecution } from '@/features/farm/context/FarmContext';
import { HarvestMeta } from '@/features/farm/types/farm.types';
import { TimelineEntry } from '@/features/farm/components/Timeline';
import { ActivityData } from '@/features/farm/components/ActivityCard';

interface HarvestLogItemProps {
  item: JobExecution;
  meta?: HarvestMeta;
  style?: ViewStyle;
  onEdit?: (item: JobExecution) => void;
}

const convertHarvestMetaToActivityData = (
  item: JobExecution,
  meta: HarvestMeta
): ActivityData[] => {
  const data: ActivityData[] = [];

  if (meta.harvestType) {
    data.push({ label: 'Loại thu hoạch:', value: meta.harvestType });
  }

  if (meta.yieldAmount) {
    data.push({ label: 'Sản lượng (kg):', value: meta.yieldAmount });
  }

  if (meta.shrimpSize) {
    data.push({ label: 'Cỡ tôm (con/kg):', value: meta.shrimpSize });
  }

  if (meta.referencePrice) {
    data.push({ label: 'Giá tôm tham khảo (VNĐ/kg):', value: meta.referencePrice });
  }

  if (meta.revenue) {
    // Format revenue with thousand separators
    const formattedRevenue = meta.revenue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    data.push({ label: 'Doanh thu (VNĐ):', value: formattedRevenue });
  }

  return data;
};

export const HarvestLogItem: React.FC<HarvestLogItemProps> = ({
  item,
  meta = {},
  style,
  onEdit,
}) => {
  const activityData: ActivityData[] = useMemo(() => {
    return convertHarvestMetaToActivityData(item, meta);
  }, [item, meta]);

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
