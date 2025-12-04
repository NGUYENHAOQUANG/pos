/**
 * @file ToggleSwitch.tsx
 * @description Toggle Switch Component (animations removed for performance)
 * @author Kindy
 * @created 2025-11-18
 */
import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  thumbColor?: string;
}

export function ToggleSwitch({
  value,
  onValueChange,
  disabled = false,
  activeColor = '#007AFF',
  inactiveColor = '#E5E5EA',
  thumbColor = '#D6E9F5',
}: ToggleSwitchProps) {
  const handlePress = () => {
    if (disabled) return;
    onValueChange(!value);
  };

  // Direct position calculation without animation
  const thumbPosition = value ? 39 : 3; // OFF: 3px, ON: 39px
  const thumbWidth = 28; // Fixed width, no droplet effect
  const thumbBorderRadius = 14; // Fixed border radius, no morphing
  // const borderWidth = value ? 3 : 0; // Border only when active
  // const borderColor = value ? activeColor : 'transparent'; // TODO: Use when implementing border

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled}
      style={[styles.container, disabled && styles.disabled]}
    >
      <View style={styles.track}>
        <View
          style={[
            styles.trackInner,
            {
              backgroundColor: value ? activeColor : inactiveColor,
              // Removed border logic for simpler look
            },
          ]}
        >
          <View
            style={[
              styles.thumb,
              {
                backgroundColor: thumbColor,
                width: thumbWidth,
                borderRadius: thumbBorderRadius,
                transform: [{ translateX: thumbPosition }],
              },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  track: {
    width: 70, //width toggle
    height: 34, // height toggle
  },
  trackInner: {
    width: '100%',
    height: '100%',
    borderRadius: 17,
    padding: 3,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  waterBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 17,
    overflow: 'hidden',
  },
  waterImage: {
    width: '100%',
    height: '100%',
    borderRadius: 17,
  },
  thumb: {
    height: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
});
