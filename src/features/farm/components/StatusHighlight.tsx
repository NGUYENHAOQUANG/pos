import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@/styles';

interface StatusHighlightProps {
  label: string;
  value: string | number;
  unit?: string;
}

export const StatusHighlight: React.FC<StatusHighlightProps> = ({ label, value, unit }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.valueContainer}>
        <Text style={styles.value}>
          {value} {unit}
        </Text>
        <Ionicons name="warning-outline" size={14} color={colors.warning} style={styles.icon} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.schedule.schedule,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.warning,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.warning,
  },
  icon: {
    marginLeft: 6,
  },
});
