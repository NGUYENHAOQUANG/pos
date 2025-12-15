import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';

export type TagStatus = 'active' | 'preparing';

interface TagProps {
  status: TagStatus;
  label?: string; // Optional custom label, defaults to status mapping
  style?: StyleProp<ViewStyle>;
}

export const Tag: React.FC<TagProps> = ({ status, label, style }) => {
  const getStyle = () => {
    switch (status) {
      case 'active':
        return styles.green;
      case 'preparing':
        return styles.orange;
      default:
        return styles.green;
    }
  };

  const getLabel = () => {
    if (label) return label;
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'preparing':
        return 'Chuẩn bị';
      default:
        return '';
    }
  };

  return (
    <View style={[styles.container, getStyle(), style]}>
      <Text style={styles.text}>{getLabel()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '400', // Regular weight as per image look
    color: colors.white, // Always white text for these solid tags
  },
  // Green - Đang hoạt động
  green: {
    backgroundColor: colors.green[600], // Dark/Solid Green
  },
  // Orange - Chuẩn bị
  orange: {
    backgroundColor: colors.orange[500], // Dark/Solid Orange (using 500 or 600 based on look, 500 seems closer to 'Chuẩn bị' yellow/orange)
  },
});
