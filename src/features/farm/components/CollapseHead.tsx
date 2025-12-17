import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '@/styles';

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
      <Text style={[styles.title, titleStyle]} numberOfLines={1}>
        {title}
      </Text>

      {showIcon && (
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: colors.text,
    flex: 1,
  },
});
