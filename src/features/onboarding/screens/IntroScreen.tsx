import type { AuthStackNavigationProp } from '@/app/navigation/types';
import { colors, spacing, typography } from '@/styles';
import { Logo } from '@/shared/components/brand/Logo';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo } from 'react';
import { Dimensions, StatusBar, StyleSheet, Text, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Ellipse } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const NUM_RINGS = 4;
const RING_SPACING = 34;
const MIN_RADIUS = 26;

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

type WaveRingProps = {
  index: number;
  center: number;
  progress: SharedValue<number>;
};

function WaveRing({ index, center, progress }: WaveRingProps) {
  const animatedProps = useAnimatedProps(() => {
    const offset = (index + progress.value * NUM_RINGS) % NUM_RINGS;

    const baseRadius = MIN_RADIUS + offset * RING_SPACING;

    const rx = baseRadius * 1.2;
    const ry = baseRadius * 0.8;

    const distance = offset / (NUM_RINGS - 1 || 1);

    const opacity = 0.2 + (1 - distance) * 0.25;
    const strokeWidth = 9 + (1 - distance) * 5;

    return {
      rx,
      ry,
      opacity,
      strokeWidth,
    };
  });

  return (
    <AnimatedEllipse
      cx={center}
      cy={center}
      stroke="#FFFFFF"
      fill="none"
      animatedProps={animatedProps}
    />
  );
}

export function IntroScreen() {
  const navigation = useNavigation<AuthStackNavigationProp>();

  // wave background
  const waveProgress = useSharedValue(0);
  const waveOpacity = useSharedValue(0);

  // Logo
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(20);
  const logoScale = useSharedValue(0.9);

  // Slogan
  const sloganOpacity = useSharedValue(0);
  const sloganTranslateY = useSharedValue(15);

  useEffect(() => {
    // Fade in wave background
    waveOpacity.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });

    waveProgress.value = withRepeat(
      withTiming(1, {
        duration: 7500,
        easing: Easing.inOut(Easing.cubic),
      }),
      -1,
      false
    );

    // Logo
    logoOpacity.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
    logoTranslateY.value = withTiming(0, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
    logoScale.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });

    // Slogan
    sloganOpacity.value = withDelay(
      500,
      withTiming(1, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      })
    );
    sloganTranslateY.value = withDelay(
      500,
      withTiming(0, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      })
    );

    // Auto navigate
    const timer = setTimeout(() => {
      navigation.navigate('Onboarding');
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const waveAnimatedStyle = useAnimatedStyle(() => ({
    opacity: waveOpacity.value,
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }, { scale: logoScale.value }],
  }));

  const sloganAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sloganOpacity.value,
    transform: [{ translateY: sloganTranslateY.value }],
  }));

  const center = 200;
  const ringIndices = useMemo(() => Array.from({ length: NUM_RINGS }, (_, i) => i), []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <Animated.View style={[styles.waveContainer, waveAnimatedStyle]}>
        <Svg width={400} height={400} viewBox="0 0 400 400">
          {ringIndices.map(i => (
            <WaveRing key={i} index={i} center={center} progress={waveProgress} />
          ))}
        </Svg>
      </Animated.View>

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Logo size="large" />
      </Animated.View>

      {/* Slogan */}
      <Animated.View style={[styles.sloganContainer, sloganAnimatedStyle]}>
        <Text style={styles.sloganText}>NỀN TẢNG NUÔI TÔM HÀNG ĐẦU</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: '#DFF5FD',
    overflow: 'hidden',
  },
  waveContainer: {
    position: 'absolute',
    width: 400,
    height: 400,
    top: SCREEN_HEIGHT / 2 - 200,
    left: SCREEN_WIDTH / 2 - 200,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    zIndex: 1,
  },
  sloganContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  sloganText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
