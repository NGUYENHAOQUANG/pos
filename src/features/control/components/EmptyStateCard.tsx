import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  ImageSourcePropType,
  ViewStyle,
} from 'react-native';
import { Button } from '@/shared/components/buttons/Button';
import { colors, spacing, borderRadius } from '@/styles';

interface EmptyStateCardProps {
  message: string;
  description?: string;
  buttonTitle?: string;
  onPress?: () => void;
  imageSource?: ImageSourcePropType;
  style?: ViewStyle;
  variant?: 'default' | 'flat';
  buttonSize?: 'small' | 'medium' | 'large';
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  message,
  description,
  buttonTitle,
  onPress,
  imageSource = require('@/assets/images/EmptyState.png'),
  style,
  variant = 'default',
  buttonSize,
}) => {
  const isFlat = variant === 'flat';
  return (
    <View style={[styles.container, isFlat && styles.flatContainer, style]}>
      <Image
        source={imageSource}
        style={[styles.image, isFlat && styles.flatImage]}
        resizeMode="contain"
      />
      <Text style={styles.message}>{message}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {buttonTitle && onPress && (
        <Button
          title={buttonTitle}
          onPress={onPress}
          variant="primary"
          iconLeft="add"
          size={buttonSize || (isFlat ? 'small' : 'medium')}
          style={styles.button}
        />
      )}
    </View>
  );
};

interface EmptyPondStateProps {
  onAddPond?: () => void;
}

export const EmptyPondState: React.FC<EmptyPondStateProps> = ({ onAddPond }) => (
  <EmptyStateCard
    message="Chưa có ao nào được thêm."
    description="Vui lòng thêm ao để quản lý thiết bị."
    buttonTitle="Thêm ao"
    onPress={onAddPond}
    style={styles.emptyPondState}
  />
);

interface EmptyDeviceStateProps {
  onAddDevice?: () => void;
}

// ...
export const EmptyDeviceState: React.FC<EmptyDeviceStateProps> = ({ onAddDevice }) => (
  <EmptyStateCard
    message="Chưa có thiết bị nào được thêm."
    buttonTitle="Thêm thiết bị"
    onPress={onAddDevice}
    variant="flat"
    imageSource={require('@/assets/images/EmptyState.png')}
    buttonSize="medium"
    style={styles.emptyDeviceContainer}
  />
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  flatContainer: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: spacing.md,
    shadowOpacity: 0,
    elevation: 0,
    marginBottom: 0,
  },
  image: {
    width: 100,
    height: 64,
    marginBottom: spacing.md,
    opacity: 0.8,
  },
  flatImage: {
    width: 80,
    height: 80,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 16,
    color: colors.text, // Removed fontWeight: '500'
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    maxWidth: '90%',
  },
  button: {
    marginTop: spacing.md,
    minWidth: 160,
  },
  pondCycleEmptyState: {
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    borderRadius: 0,
  },
  emptyPondState: {
    height: '30%',
    width: '100%',
  },
  emptyDeviceContainer: {
    paddingTop: 0,
    paddingBottom: 24,
    paddingHorizontal: 0, // Ensure no extra horizontal padding if container already has it
  },
});
