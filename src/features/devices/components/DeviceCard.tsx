/**
 * @file DeviceCard.tsx
 * @description Device Card Component
 * @author Kindy
 * @created 2025-11-18
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ToggleSwitch } from '@/shared/components/toggle/ToggleSwitch';
import { spacing } from '@/styles';
import { FanIcon, PumpIcon, XyphonIcon } from './icons';

interface DeviceCardProps {
  id: string;
  name: string;
  type: 'pump' | 'fan' | 'xyphon';
  status: boolean;
  onToggle: (id: string) => void;
  activeColor: string;
  backgroundColor: string;
}

export const DeviceCard = React.memo(
  ({ id, name, type, status, onToggle, activeColor, backgroundColor }: DeviceCardProps) => {
    const handleCardPress = () => {
      onToggle(id);
    };

    const handleTogglePress = (e: any) => {
      // Stop propagation to prevent card press
      e.stopPropagation();
      onToggle(id);
    };

    const cardBorderStyle = {
      borderColor: status ? activeColor : 'transparent',
    };

    const iconBackgroundStyle = {
      backgroundColor: status ? backgroundColor : '#F5F7FA',
    };

    const renderDeviceIcon = () => {
      // Ensure good contrast - use slightly darker gray for inactive state
      const inactiveColor = '#90A4AE'; // Better contrast than #B0BEC5

      const iconProps = {
        width: 80,
        height: 80,
        color: status ? activeColor : inactiveColor,
        isActive: status,
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
      <View>
        <TouchableOpacity
          style={[styles.card, styles.cardWhiteBg, cardBorderStyle]}
          onPress={handleCardPress}
          activeOpacity={0.9}
          accessible={true}
          accessibilityLabel={`${name}, ${status ? 'đang bật' : 'đã tắt'}`}
          accessibilityHint="Nhấn để bật hoặc tắt thiết bị"
          accessibilityRole="button"
          accessibilityState={{ disabled: false, selected: status }}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <Text style={styles.deviceName}>{name}</Text>
              <View style={styles.toggleWrapper}>
                <TouchableOpacity
                  onPress={handleTogglePress}
                  accessible={true}
                  accessibilityLabel={`Công tắc ${name}`}
                  accessibilityHint={status ? 'Nhấn để tắt' : 'Nhấn để bật'}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: status }}
                >
                  <ToggleSwitch
                    value={status}
                    onValueChange={() => {}} // Handled by TouchableOpacity
                    activeColor={activeColor}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.cardRight}>
              {/* Background splash effect */}
              <View style={[styles.iconBackground, iconBackgroundStyle]}>{renderDeviceIcon()}</View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md, // Reduced padding for tighter look
    minHeight: 100,
  },
  cardLeft: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.sm,
  },
  toggleWrapper: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  cardRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWhiteBg: {
    backgroundColor: '#FFFFFF',
  },
  iconBackground: {
    width: 100, // Larger background area
    height: 100,
    borderRadius: 50, // Circle or rounded shape
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -30, // Pull it to the right edge like the design
    marginBottom: -30, // Pull it to the bottom edge
    marginTop: -10,
  },
});
