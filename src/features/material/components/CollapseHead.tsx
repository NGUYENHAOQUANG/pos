import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius } from '@/styles';

interface CollapseHeadProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  showIcon?: boolean;
}

export const CollapseHead: React.FC<CollapseHeadProps> = ({
  title,
  isExpanded,
  onToggle,
  style,
  titleStyle,
  showIcon = true,
}) => {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onToggle} activeOpacity={0.7}>
      <Text style={[styles.title, titleStyle]}>{title}</Text>

      {showIcon && (
        <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.text} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: typography.fontFamily?.medium,
    flex: 1,
  },
});
