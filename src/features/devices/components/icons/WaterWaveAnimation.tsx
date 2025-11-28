import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface WaterWaveAnimationProps {
  isActive: boolean;
  color?: string;
  width?: number;
  height?: number;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export const WaterWaveAnimation = React.memo(function WaterWaveAnimation({
  isActive,
  color = '#2196F3',
  width = 80,
  height = 20,
}: WaterWaveAnimationProps) {
  const waveOffset = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      waveOffset.value = withRepeat(
        withTiming(width, {
          duration: 2500, // Slightly slower for more natural wave motion
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      waveOffset.value = withTiming(0, {
        duration: 400,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Ease-out
      });
    }

    // Cleanup: cancel animation on unmount
    return () => {
      cancelAnimation(waveOffset);
    };
  }, [isActive, width, waveOffset]);

  const animatedProps = useAnimatedProps(() => {
    const offset = waveOffset.value;

    // Generate sine wave path with improved smoothness
    const amplitude = 3.5; // Slightly larger amplitude for better visibility
    const frequency = 2;
    const points = 30; // More points for smoother wave

    let path = `M 0,${height}`;

    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      const y =
        height - amplitude * Math.sin(((x + offset) / width) * Math.PI * frequency);
      path += ` L ${x},${y}`;
    }

    path += ` L ${width},${height} Z`;

    return { d: path };
  });

  if (!isActive) return null;

  return (
    <Svg
      width={width}
      height={height}
      style={styles.wave}
      accessible={true}
      accessibilityLabel="Hiệu ứng sóng nước"
      accessibilityRole="image"
    >
      {/* Wave layer 1 - Primary wave */}
      <AnimatedPath animatedProps={animatedProps} fill={color} opacity={0.35} />
      {/* Wave layer 2 - Secondary wave with offset */}
      <AnimatedPath
        animatedProps={animatedProps}
        fill={color}
        opacity={0.25}
        transform="translate(10, 0)"
      />
    </Svg>
  );
});

const styles = StyleSheet.create({
  wave: {
    position: 'absolute',
    bottom: 0,
  },
});
