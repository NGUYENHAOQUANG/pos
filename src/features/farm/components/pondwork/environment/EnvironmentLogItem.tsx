import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

import { colors } from '@/styles';
import { JobExecution } from '@/features/farm/types/farm.types';
import { EnvironmentMeta } from '@/features/farm/types/farm.types';
import { TimelineEntry } from '@/features/farm/components/Timeline';
import { ActivityData } from '@/features/farm/components/ActivityCard';

interface EnvironmentLogItemProps {
  item: JobExecution;
  meta?: EnvironmentMeta;
  style?: any;
  onEdit?: (item: JobExecution) => void;
}

/**
 * Convert EnvironmentMeta to ActivityData array for ActivityCard
 */
const convertEnvironmentMetaToActivityData = (meta: EnvironmentMeta): ActivityData[] => {
  const data: ActivityData[] = [];

  if (meta.pH) {
    data.push({ label: 'pH:', value: meta.pH, isWarning: meta.pHWarning ?? true });
  }
  if (meta.do) {
    data.push({ label: 'DO (mg/L)', value: meta.do });
  }
  if (meta.temperature) {
    data.push({ label: 'Nhiệt độ (°C)', value: meta.temperature });
  }
  if (meta.salinity) {
    data.push({ label: 'Độ mặn (ppt)', value: meta.salinity });
  }
  if (meta.alkalinity) {
    data.push({ label: 'Độ kiềm (mg/L)', value: meta.alkalinity });
  }
  if (meta.transparency) {
    data.push({ label: 'Độ trong (cm)', value: meta.transparency });
  }

  return data;
};

export const EnvironmentLogItem: React.FC<EnvironmentLogItemProps> = ({
  item,
  meta = {},
  style,
  onEdit,
}) => {
  const activityData: ActivityData[] = useMemo(() => {
    return convertEnvironmentMetaToActivityData(meta);
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
  },
});
