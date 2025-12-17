import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, borderRadius } from '@/styles';
import { IconCalender, IconVector } from '@/assets/icons';

/**
 * Props for DateRangeFilter component
 */
interface DateRangeFilterProps {
  /** Label text for the start date */
  startLabel: string;
  /** Label text for the end date */
  endLabel: string;
  /** Callback function called when start date is pressed */
  onPressStart?: () => void;
  /** Callback function called when end date is pressed */
  onPressEnd?: () => void;
  /** Callback function called when calendar icon is pressed */
  onPressCalendar?: () => void;
  /** Additional styles for the container */
  style?: ViewStyle;
}

/**
 * A reusable date range filter component.
 *
 * Displays two date labels (start and end) with an arrow icon between them,
 * and a calendar icon on the right. Each element can be individually pressed
 * to trigger date selection.
 *
 * @example
 * ```tsx
 * <DateRangeFilter
 *   startLabel="01-01-2024"
 *   endLabel="31-01-2024"
 *   onPressStart={() => setActiveField('start')}
 *   onPressEnd={() => setActiveField('end')}
 *   onPressCalendar={() => setIsDatePickerVisible(true)}
 * />
 * ```
 */
export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startLabel,
  endLabel,
  onPressStart,
  onPressEnd,
  onPressCalendar,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textRow}>
        <TouchableOpacity
          style={styles.dateTouchable}
          onPress={onPressStart}
          activeOpacity={onPressStart ? 0.7 : 1}
        >
          <Text style={styles.dateText}>{startLabel}</Text>
        </TouchableOpacity>
        <IconVector width={12} height={5} style={styles.arrowIcon} />
        <TouchableOpacity
          style={styles.dateTouchable}
          onPress={onPressEnd}
          activeOpacity={onPressEnd ? 0.7 : 1}
        >
          <Text style={styles.dateText}>{endLabel}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onPressCalendar} activeOpacity={onPressCalendar ? 0.7 : 1}>
        <IconCalender width={15} height={15} style={styles.calendarIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderDark,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTouchable: {
    flex: 1,
  },
  dateText: {
    fontWeight: '400',
    fontStyle: 'normal',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    color: colors.text,
    textAlign: 'left',
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  calendarIcon: {
    marginLeft: 8,
  },
});
