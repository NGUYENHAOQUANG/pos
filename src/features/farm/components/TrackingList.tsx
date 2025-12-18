import React, { useState } from 'react';
import { View, StyleSheet, Text, LayoutAnimation, Platform, UIManager } from 'react-native';
import { colors } from '@/styles';
import { CollapseHead } from './CollapseHead';
import { TimelineEntry } from './Timeline';
import { ActivityData } from './ActivityCard';

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

export const TrackingDayCard: React.FC<TrackingDayCardProps> = ({ group, style }) => {
  const [expanded, setExpanded] = useState(true);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.cardContainer, style]}>
      {/* Header */}
      <CollapseHead
        title={group.date}
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
  cardContainer: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 8,
    // Shadow
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },

  headerExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCollapsed: {
    borderRadius: 8,
    backgroundColor: colors.white,
  },

  cardBody: {
    padding: 12,
    backgroundColor: colors.white,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontStyle: 'italic',
    padding: 10,
  },
});
