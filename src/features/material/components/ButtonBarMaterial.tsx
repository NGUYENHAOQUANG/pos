import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Button } from '@/shared/components/buttons/Button';
import { colors, spacing } from '@/styles';

export type ButtonBarMode = 'total' | 'single' | 'double';

interface ButtonBarMaterialProps {
  mode?: ButtonBarMode;
  primaryTitle?: string;
  secondaryTitle?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  totalLabel?: string;
  totalValue?: string | number;
  primaryButtonDisabled?: boolean;
  primaryButtonStyle?: ViewStyle;
  primaryButtonTextStyle?: TextStyle;
  secondaryButtonStyle?: ViewStyle;
  secondaryButtonTextStyle?: TextStyle;
}

export const ButtonBarMaterial: React.FC<ButtonBarMaterialProps> = ({
  mode = 'single',
  primaryTitle = 'Gửi Phiếu',
  secondaryTitle = 'Huỷ',
  onPrimaryPress,
  onSecondaryPress,
  totalLabel = 'Tổng tiền:',
  totalValue = '0đ',
  primaryButtonDisabled = false,
  primaryButtonStyle,
  primaryButtonTextStyle,
  secondaryButtonStyle,
  secondaryButtonTextStyle,
}) => {
  const renderContent = () => {
    switch (mode) {
      case 'total':
        return (
          <View style={styles.row}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>{totalLabel}</Text>
              <Text style={styles.totalValue}>{totalValue}</Text>
            </View>
            <Button
              title={primaryTitle}
              onPress={onPrimaryPress || (() => {})}
              variant="primary"
              size="medium"
              disabled={primaryButtonDisabled}
              style={StyleSheet.flatten([styles.primaryButton, primaryButtonStyle])}
              textStyle={primaryButtonTextStyle}
            />
          </View>
        );
      case 'double':
        return (
          <View style={styles.row}>
            <Button
              title={secondaryTitle}
              onPress={onSecondaryPress || (() => {})}
              variant="outline"
              size="medium"
              style={StyleSheet.flatten([styles.secondaryButton, secondaryButtonStyle])}
              textStyle={StyleSheet.flatten([{ color: colors.text }, secondaryButtonTextStyle])}
            />
            <View style={styles.spacer} />
            <Button
              title={primaryTitle}
              onPress={onPrimaryPress || (() => {})}
              variant="primary"
              size="medium"
              disabled={primaryButtonDisabled}
              style={StyleSheet.flatten([styles.flexButton, primaryButtonStyle])}
              textStyle={primaryButtonTextStyle}
            />
          </View>
        );
      case 'single':
      default:
        return (
          <Button
            title={primaryTitle}
            onPress={onPrimaryPress || (() => {})}
            variant="primary"
            size="medium"
            disabled={primaryButtonDisabled}
            style={StyleSheet.flatten([styles.fullButton, primaryButtonStyle])}
            textStyle={primaryButtonTextStyle}
          />
        );
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalContainer: {
    justifyContent: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textSecondary || '#666',
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.error || '#FF4D4F',
  },
  primaryButton: {
    minWidth: 120,
  },
  secondaryButton: {
    minWidth: 100,
    backgroundColor: colors.white,
    borderColor: colors.borderDark,
  },
  flexButton: {
    flex: 1,
  },
  fullButton: {
    width: '100%',
  },
  spacer: {
    width: spacing.md,
  },
});
