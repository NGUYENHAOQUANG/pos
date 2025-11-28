import { colors, spacing, typography } from '@/styles';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export interface FilterSelectorProps {
  label: string;
  value?: string;
  onPress: () => void;
  onClear?: () => void;
  containerStyle?: ViewStyle;
  fullWidth?: boolean;
}

export const FilterSelector: React.FC<FilterSelectorProps> = ({
  label,
  value,
  onPress,
  onClear,
  containerStyle,
  fullWidth = false,
}) => {
  const displayText = value || label;
  const isSelected = !!value;

  return (
    <TouchableOpacity
      style={[styles.container, fullWidth && styles.fullWidth, containerStyle]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, isSelected && styles.textSelected]} numberOfLines={1}>
        {displayText}
      </Text>
      {isSelected && onClear && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onClear();
          }}
          style={styles.clearButton}
          activeOpacity={0.7}
        >
          <View style={styles.clearIconContainer}>
            <Ionicons name="close" size={12} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 44,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
    flex: 1,
  },
  textSelected: {
    color: colors.text,
  },
  clearButton: {
    marginLeft: spacing.xs,
  },
  clearIconContainer: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

