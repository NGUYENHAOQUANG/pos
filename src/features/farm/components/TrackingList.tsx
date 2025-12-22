import React, { useState } from 'react';
import { View, StyleSheet, Text, LayoutAnimation, Platform, UIManager } from 'react-native';
import { colors, spacing } from '@/styles';
import { CollapseHead } from './CollapseHead';
import { TimelineEntry } from './Timeline';
import { ActivityData } from './ActivityCard';
import { parseDate } from '@/features/farm/utils/dateUtils';

// Kích hoạt LayoutAnimation
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Interface ---
export interface TimelineActivity {
  id: string;
  time: string;
  title: string;
  data: ActivityData[];
  note?: string;
  onEdit?: () => void;
}

export interface TrackingGroup {
  id: string;
  date: string;
  activities: TimelineActivity[];
}

interface TrackingDayCardProps {
  group: TrackingGroup;
  style?: any;
}

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const formatSectionTitle = (dateKey: string): string => {
  const date = parseDate(dateKey);
  if (isToday(date)) {
    return `Hôm nay, ${dateKey}`;
  }
  return dateKey;
};

export const TrackingDayCard: React.FC<TrackingDayCardProps> = ({ group, style }) => {
  const [expanded, setExpanded] = useState(true);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const displayDate = formatSectionTitle(group.date);

  return (
    <View style={style}>
      {/* Header */}
      <CollapseHead
        title={displayDate}
        isExpanded={expanded}
        onToggle={toggleExpand}
        style={expanded ? styles.headerExpanded : styles.headerCollapsed}
      />

      {/* Body: Timeline List */}
      {expanded && (
        <View style={styles.cardBody}>
          {group.activities.map(activity => (
            <TimelineEntry
              key={activity.id}
              time={activity.time}
              title={activity.title}
              data={activity.data}
              note={activity.note}
              onEdit={
                activity.onEdit ? activity.onEdit : () => console.log('Edit activity', activity.id)
              }
            />
          ))}

          {group.activities.length === 0 && (
            <Text style={styles.emptyText}>Không có hoạt động</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerExpanded: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  headerCollapsed: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBody: {
    paddingTop: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontStyle: 'italic',
    padding: 10,
  },
});
