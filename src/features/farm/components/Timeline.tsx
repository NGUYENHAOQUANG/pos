import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { ActivityCard, ActivityData } from './ActivityCard';

interface TimelineEntryProps {
  time: string;
  title: string;
  data: ActivityData[];
  onEdit?: () => void;
  note?: string;
}

export const TimelineEntry: React.FC<TimelineEntryProps> = ({
  time,
  title,
  data,
  onEdit,
  note,
}) => {
  return (
    <View style={styles.row}>
      {/* Cột thời gian bên trái */} <Text style={styles.timeText}>{time}</Text>
      <View style={styles.timeColumn}>
        <View style={styles.timelineGraphic}>
          <View style={styles.dot} />
          <View style={styles.line} />
        </View>
      </View>
      {/* Nội dung Card bên phải */}
      <View style={styles.contentColumn}>
        <ActivityCard title={title} data={data} onEdit={onEdit} note={note} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  timeColumn: {
    width: 60,
    alignItems: 'center',
    paddingRight: 8,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  timelineGraphic: {
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray[300],
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.gray[200],
    marginTop: -2,
  },
  contentColumn: {
    flex: 1,
    paddingBottom: 16,
  },
});
