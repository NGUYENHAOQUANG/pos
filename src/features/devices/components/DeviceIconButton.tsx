/**
 * @file DeviceIconButton.tsx
 * @description Device Icon Button Component
 * @author Kindy
 * @created 2025-11-18
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { spacing } from '@/styles';
import { FanIcon, PumpIcon, XyphonIcon } from './icons';

interface DeviceIconButtonProps {
  name: string;
  type: 'pump' | 'fan' | 'xyphon';
  backgroundColor: string;
  iconColor: string;
  isActive?: boolean;
  onPress: () => void;
}

export const DeviceIconButton = React.memo(({
  name,
  type,
  backgroundColor,
  iconColor,
  isActive = true,
  onPress,
}: DeviceIconButtonProps) => {
  const renderIcon = () => {
    const iconProps = {
      width: 40,
      height: 40,
      color: iconColor,
      isActive,
    };

    switch (type) {
      case 'fan':
        return <FanIcon {...iconProps} />;
      case 'xyphon':
        return <XyphonIcon {...iconProps} />;
      default:
        return <PumpIcon {...iconProps} />;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`${name}, ${isActive ? 'đang hoạt động' : 'đã tắt'}`}
      accessibilityHint="Nhấn để xem chi tiết thiết bị"
      accessibilityRole="button"
      accessibilityState={{ disabled: false, selected: isActive }}
    >
      <View style={[styles.iconCircle, { backgroundColor }]}>
        {renderIcon()}
      </View>
      <Text style={styles.label}>{name}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  label: {
    fontSize: 12,
    color: '#424242',
    fontWeight: '500',
    textAlign: 'center',
  },
});
