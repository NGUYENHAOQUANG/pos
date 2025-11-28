import React, { useEffect } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

type OnboardingBackgroundProps = {};

const OnboardingBackgroundOne: React.FC<OnboardingBackgroundProps> = ({}) => {
  // 1. shared values
  const pondScale = useSharedValue(0.8);

  const shrimpsTranslateY = useSharedValue(12);
  const shrimpsOpacity = useSharedValue(0);

  const pulseTranslateY = useSharedValue(12);
  const pulseOpacity = useSharedValue(0);

  // 2. animated styles
  const pondAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pondScale.value }],
  }));

  const shrimpsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: shrimpsTranslateY.value }],
    opacity: shrimpsOpacity.value,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pulseTranslateY.value }],
    opacity: pulseOpacity.value,
  }));

  // 3. chạy animation khi mount
  useEffect(() => {
    // scale ao tôm
    pondScale.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });

    // shrimp nổi lên + fade in
    shrimpsTranslateY.value = withDelay(
      150,
      withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      }),
    );
    shrimpsOpacity.value = withDelay(
      150,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      }),
    );

    // pulse nổi lên + fade in sau một chút
    pulseTranslateY.value = withDelay(
      250,
      withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      }),
    );
    pulseOpacity.value = withDelay(
      250,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, []);

  return (
    <View style={styles.layerBackground} pointerEvents="none">
      <ImageBackground
        source={require('@/assets/backgrounds/background-1.png')}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />

        <Animated.View style={styles.imagePound}>
          {/* Ao tôm: scale in */}
          <Animated.Image
            source={require('@/assets/backgrounds/pond.png')}
            style={[styles.pondIcon, pondAnimatedStyle]}
          />

          {/* Shrimp: translateY lên + fade in */}
          <Animated.Image
            source={require('@/assets/backgrounds/shrimps.png')}
            style={[styles.shrimpsIcon, shrimpsAnimatedStyle]}
          />

          {/* Pulse: translateY lên + fade in */}
          <Animated.Image
            source={require('@/assets/backgrounds/live-pulse.png')}
            style={[styles.livePulse, pulseAnimatedStyle]}
          />
        </Animated.View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  layerBackground: {
    flex: 1,
  },
  imagePound: {
    position: 'absolute',
    right: 2,
    top: '22.25%',
  },
  pondIcon: {
    zIndex: 1,
    position: 'absolute',
    right: 0,
  },
  shrimpsIcon: {
    zIndex: 2,
    position: 'absolute',
    right: 50,
    top: 70,
  },
  livePulse: {
    zIndex: 3,
    position: 'absolute',
    right: 35,
    top: 15,
  },
});

export default OnboardingBackgroundOne;
