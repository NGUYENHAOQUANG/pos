import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import XyphonSvg from '@/assets/images/xyphon.svg';

interface XyphonIconProps {
  width?: number;
  height?: number;
  color?: string;
  isActive?: boolean;
}

export const XyphonIcon = React.memo(function XyphonIcon({
  width = 64,
  height = 64,
  color: _color = '#00BCD4',
  isActive = false,
}: XyphonIconProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, {
            duration: 600, // Slightly faster pulse
            easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Material Design ease-in-out
          }),
          withTiming(1, {
            duration: 600,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          })
        ),
        -1,
        false
      );
    } else {
      scale.value = withTiming(1, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Ease-out
      });
    }

    // Cleanup: cancel animation on unmount
    return () => {
      cancelAnimation(scale);
    };
  }, [isActive, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      accessible={true}
      accessibilityLabel={isActive ? 'Xyphon đang hoạt động' : 'Xyphon đã tắt'}
      accessibilityRole="image"
      accessibilityState={{ disabled: !isActive }}
    >
      <XyphonSvg width={width} height={height} />
    </Animated.View>
  );
});
