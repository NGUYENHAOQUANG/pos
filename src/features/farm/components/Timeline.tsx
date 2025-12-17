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
      {/* 1. Cột thời gian (Cố định chiều rộng) */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{time}</Text>
      </View>

      {/* 2. Cột Graphic (Line + Dot) */}
      <View style={styles.graphicColumn}>
        {/* Continuous Line */}
        <View style={styles.line} />
        {/* Dot on top */}
        <View style={styles.dot} />
      </View>

      {/* 3. Nội dung Card bên phải */}
      <View style={styles.contentColumn}>
        <ActivityCard title={title} data={data} onEdit={onEdit} note={note} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch', // Ensure columns stretch full height
  },
  timeContainer: {
    width: 50,
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingTop: 0,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    textAlign: 'right',
    lineHeight: 18, // Fixed line height for easier alignment
  },
  graphicColumn: {
    width: 20,
    alignItems: 'center',
    position: 'relative', // For absolute line
  },
  line: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.gray[200],
    left: '50%',
    marginLeft: -1, // Center the 2px line
    zIndex: 0,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray[300],
    zIndex: 1,
    marginTop: 4, // Align with text: lineHeight 18 -> center ~9. Dot 10 -> center 5. Top ~4.
  },
  contentColumn: {
    flex: 1,
    paddingBottom: 16,
    paddingLeft: 8,
  },
});
