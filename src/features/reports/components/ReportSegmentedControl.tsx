import { colors, spacing, typography } from '@/styles';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

export interface ReportSegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  containerStyle?: ViewStyle;
}

export const ReportSegmentedControl: React.FC<ReportSegmentedControlProps> = ({
  options,
  selectedIndex,
  onSelect,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;
        return (
          <TouchableOpacity
            key={index}
            style={styles.tab}
            onPress={() => onSelect(index)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>
              {option}
            </Text>
            {isSelected && <View style={styles.underline} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  tabTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: spacing.sm,
    right: spacing.sm,
    height: 2,
    backgroundColor: colors.primary,
  },
});

