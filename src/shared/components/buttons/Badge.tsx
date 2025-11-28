import React from 'react';
import { Badge as AntdBadge } from '@ant-design/react-native';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/styles';

interface BadgeProps {
 
  label?: string | number;
  /**
   * Visual variant of the badge
   * @default 'primary'
   */
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  /**
   * Size of the badge
   * @default 'medium'
   */
  size?: 'small' | 'medium';
  /**
   * Custom style for the badge container
   */
  style?: ViewStyle;
  /**
   * Display as a dot badge (no text)
   * @default false
   */
  dot?: boolean;
  /**
   * Children to wrap with badge (for notification badges)
   */
  children?: React.ReactNode;
}

/**
 * Badge component using Ant Design React Native
 *
 * Supports both standalone badges and notification badges that wrap children.
 * Can display as a dot or with text/number content.
 *
 *
 * @example
 * // Standalone badge
 * <Badge label="New" variant="primary" />
 *
 * @example
 * // Dot badge
 * <Badge dot variant="error" />
 *
 * @example
 * // Notification badge
 * <Badge label={3} variant="error">
 *   <Icon name="notifications" />
 * </Badge>
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  style,
  dot = false,
  children,
}) => {
  // Map variant to background color
  const getBackgroundColor = (): string => {
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'neutral':
        return colors.gray[500];
      default:
        return colors.primary;
    }
  };

  // If no label is provided and not explicitly set as dot, treat as dot
  const isDot = dot || label === undefined;

  // For standalone badges (no children), render a simple badge
  if (!children) {
    return (
      <View style={[styles.standalone, style]}>
        <AntdBadge
          text={isDot ? undefined : String(label)}
          dot={isDot}
          style={{
            backgroundColor: getBackgroundColor(),
            ...(size === 'small' && styles.smallBadge),
          }}
        />
      </View>
    );
  }

  // For notification badges (with children), wrap the children
  return (
    <View style={style}>
      <AntdBadge
        text={isDot ? undefined : String(label)}
        dot={isDot}
        style={{
          backgroundColor: getBackgroundColor(),
          ...(size === 'small' && styles.smallBadge),
        }}
      >
        {children}
      </AntdBadge>
    </View>
  );
};

const styles = StyleSheet.create({
  standalone: {
    alignSelf: 'flex-start',
  },
  smallBadge: {
    minWidth: 16,
    height: 16,
    fontSize: 10,
  } as TextStyle,
});
