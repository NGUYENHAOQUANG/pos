import React, { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography, borderRadius } from '@/styles';

interface Props {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
}

export const DateTimePickerField: React.FC<Props> = ({
  label,
  value,
  onChange,
}) => {
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const formatDateTime = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${d}-${m}-${y}, ${h}:${min}`;
  };

  const openPicker = () => {
    if (Platform.OS === 'android') {
      setShowDate(true);
    } else {
      setShowDate(true);
    }
  };

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity style={styles.input} onPress={openPicker}>
        <Text style={[styles.text, !value && styles.placeholder, styles.valueText]}>
          {value
            ? formatDateTime(value)
            : 'dd-mm-yyyy, hr:mm (hiện tại)'}
        </Text>
        <Ionicons
          name="calendar-outline"
          size={20}
          color={colors.textSecondary}
          style={styles.icon}
        />
      </TouchableOpacity>

      {/* ===== ANDROID DATE ===== */}
      {showDate && Platform.OS === 'android' && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display="calendar"
          onChange={(_, selectedDate) => {
            setShowDate(false);
            if (selectedDate) {
              setTempDate(selectedDate);
              setShowTime(true);
            }
          }}
        />
      )}

      {/* ===== ANDROID TIME ===== */}
      {showTime && Platform.OS === 'android' && tempDate && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display="clock"
          onChange={(_, selectedTime) => {
            setShowTime(false);
            if (selectedTime) {
              const finalDate = new Date(tempDate);
              finalDate.setHours(selectedTime.getHours());
              finalDate.setMinutes(selectedTime.getMinutes());
              onChange(finalDate);
            }
          }}
        />
      )}

      {/* ===== IOS ===== */}
      {showDate && Platform.OS === 'ios' && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="datetime"
          display="spinner"
          onChange={(_, selectedDate) => {
            if (selectedDate) {
              onChange(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  valueText: {
      flex: 1,
  },
  text: {
    ...typography.body,
    color: colors.text,
  },
  placeholder: {
    color: colors.text,
  },
});
