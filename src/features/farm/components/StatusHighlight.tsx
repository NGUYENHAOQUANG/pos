import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles';
import { IconWarningOutlined } from '@/assets/icons';

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
        <IconWarningOutlined width={16} height={16} style={styles.icon} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.status.warningHighlightBg,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.status.warningHighlightText,
    lineHeight: 22,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.status.warningHighlightText,
    lineHeight: 22,
  },
  icon: {
    marginLeft: 8,
  },
});
