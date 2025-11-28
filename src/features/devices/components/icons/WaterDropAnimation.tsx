import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

interface WaterDropAnimationProps {
  isActive: boolean;
  color?: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const WaterDropAnimation = React.memo(function WaterDropAnimation({
  isActive,
  color = '#2196F3',
}: WaterDropAnimationProps) {
  // Tạo 5 giọt nước với vị trí và timing khác nhau
  const drops = [
    { x: 10, delay: 0 },
    { x: 25, delay: 100 },
    { x: 40, delay: 50 },
    { x: 55, delay: 150 },
    { x: 70, delay: 80 },
  ];

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel="Hiệu ứng giọt nước"
      accessibilityRole="image"
    >
      <Svg width="80" height="60" style={StyleSheet.absoluteFill}>
        {drops.map((drop, index) => (
          <WaterDrop
            key={index}
            x={drop.x}
            delay={drop.delay}
            isActive={isActive}
            color={color}
          />
        ))}
      </Svg>
    </View>
  );
});

interface WaterDropProps {
  x: number;
  delay: number;
  isActive: boolean;
  color: string;
}

const WaterDrop = React.memo(function WaterDrop({ x, delay, isActive, color }: WaterDropProps) {
  const translateY = useSharedValue(-10);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      translateY.value = withDelay(
        delay,
        withSequence(
          withTiming(40, {
            duration: 350, // Slightly faster for snappier feel
            easing: Easing.bezier(0.4, 0.0, 0.6, 1), // Ease-in for falling
          }),
          withTiming(50, {
            duration: 100,
            easing: Easing.bezier(0.4, 0.0, 1, 1), // Quick bounce
          })
        )
      );

      scale.value = withDelay(
        delay,
        withSequence(
          withTiming(1, {
            duration: 180,
            easing: Easing.bezier(0.0, 0.0, 0.2, 1), // Ease-out
          }),
          withTiming(0.8, {
            duration: 270,
            easing: Easing.bezier(0.4, 0.0, 1, 1),
          })
        )
      );

      opacity.value = withDelay(
        delay,
        withSequence(
          withTiming(1, {
            duration: 100,
            easing: Easing.bezier(0.0, 0.0, 0.2, 1),
          }),
          withTiming(0.7, {
            duration: 180,
            easing: Easing.linear,
          }),
          withTiming(0, {
            duration: 170,
            easing: Easing.bezier(0.4, 0.0, 1, 1), // Ease-in for fade
          })
        )
      );
    } else {
      translateY.value = -10;
      scale.value = 0;
      opacity.value = 0;
    }

    // Cleanup: cancel animations on unmount
    return () => {
      cancelAnimation(translateY);
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [isActive, delay, translateY, scale, opacity]);

  const animatedProps = useAnimatedProps(() => ({
    cy: translateY.value,
    r: 3 * scale.value,
    opacity: opacity.value,
  }));

  return (
    <AnimatedCircle
      cx={x}
      cy={0}
      r={3}
      fill={color}
      // @ts-ignore - animatedProps typing issue with react-native-svg
      animatedProps={animatedProps}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 80,
    height: 60,
    top: -10,
  },
});
