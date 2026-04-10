/**
 * @file SplashScreen.tsx
 * @description Animated Splash Screen with water ripple, floating bubbles,
 * logo fade-in bounce, and smooth exit transition.
 * Uses Reanimated 3 for 60fps UI-thread animations.
 */
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    FadeOut,
    interpolate,
    runOnJS,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { AnimatedLogo } from '@/shared/components/brand/AnimatedLogo';
import AnimatedBackground from '@/shared/components/ui/AnimatedBackground';

// ─── Constants ────────────────────────────────────────────────────
const RIPPLE_COUNT = 3;

// ─── Ripple Ring Component ──────────────────────────────────────────
interface RippleRingProps {
    delay: number;
    startAnimation: SharedValue<number>;
}

const RING_SIZE = 120;

const RippleRing: React.FC<RippleRingProps> = ({ delay, startAnimation }) => {
    const progress = useSharedValue(0);
    const theme = useAppTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    useEffect(() => {
        // Start ripples shortly after logo settles
        const timer = setTimeout(() => {
            progress.value = withRepeat(
                withTiming(1, { duration: 2000, easing: Easing.out(Easing.cubic) }),
                -1,
                false
            );
        }, 500 + delay);

        return () => clearTimeout(timer);
    }, [delay, progress]);

    const animatedStyle = useAnimatedStyle(() => {
        if (startAnimation.value < 0.5) {
            return { opacity: 0 };
        }

        const scale = interpolate(progress.value, [0, 1], [0, 4]);
        const opacity = interpolate(progress.value, [0, 0.2, 1], [0.7, 0.4, 0]);

        return {
            opacity,
            transform: [{ scale }, { rotate: '45deg' }],
        };
    });

    return (
        <Animated.View style={[styles.rippleRing, animatedStyle]}>
            {/* Top half - orange */}
            <View style={styles.rippleHalfTop}>
                <View style={styles.rippleHalfTopInner} />
            </View>
            {/* Bottom half - blue */}
            <View style={styles.rippleHalfBottom}>
                <View style={styles.rippleHalfBottomInner} />
            </View>
        </Animated.View>
    );
};

// ─── Main Splash Screen ─────────────────────────────────────────────
interface SplashScreenProps {
    visible: boolean;
    onAnimationComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ visible, onAnimationComplete }) => {
    const theme = useAppTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    // Logo animation values
    const logoScale = useSharedValue(0);
    const logoOpacity = useSharedValue(0);
    const rippleStarted = useSharedValue(0);

    useEffect(() => {
        if (!visible) {
            return;
        }

        // Phase 1: Logo container fade-in with elastic bounce (0 → 600ms)
        logoOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
        logoScale.value = withSequence(
            withTiming(1.15, { duration: 400, easing: Easing.out(Easing.cubic) }),
            withTiming(0.95, { duration: 150, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) })
        );

        // Phase 2: Start ripples sooner to sync with arc spring animations
        const rippleTimer = setTimeout(() => {
            rippleStarted.value = 1;
        }, 1000);

        return () => clearTimeout(rippleTimer);
    }, [visible, logoOpacity, logoScale, rippleStarted]);

    // Logo animated style
    const logoAnimatedStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }],
    }));

    if (!visible) {
        return null;
    }

    const handleExitComplete = () => {
        if (onAnimationComplete) {
            runOnJS(onAnimationComplete)();
        }
    };

    return (
        <Animated.View
            style={styles.container}
            exiting={FadeOut.duration(500)
                .easing(Easing.out(Easing.cubic))
                .withCallback(() => {
                    'worklet';
                    if (handleExitComplete) {
                        runOnJS(handleExitComplete)();
                    }
                })}
        >
            {/* Premium Aurora Background */}
            <AnimatedBackground />

            {/* Center content: Ripples + Logo */}
            <View style={styles.centerContent}>
                {/* Water Ripple Rings */}
                {Array.from({ length: RIPPLE_COUNT }).map((_, index) => (
                    <RippleRing
                        key={`ripple-${index}`}
                        delay={index * 700}
                        startAnimation={rippleStarted}
                    />
                ))}

                {/* Animated Logo */}
                <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
                    <AnimatedLogo startAnimation={rippleStarted} />
                </Animated.View>
            </View>
        </Animated.View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: theme.isDark ? theme.backgroundPrimary : theme.background,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
        },
        centerContent: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        logoWrapper: {
            zIndex: 10,
        },
        // Water ripple ring - two-tone container
        rippleRing: {
            position: 'absolute',
            width: RING_SIZE,
            height: RING_SIZE,
            borderRadius: RING_SIZE / 2,
            overflow: 'hidden',
        },
        // Top half clip container (orange)
        rippleHalfTop: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: RING_SIZE / 2,
            overflow: 'hidden',
        },
        rippleHalfTopInner: {
            width: RING_SIZE,
            height: RING_SIZE,
            borderRadius: RING_SIZE / 2,
            borderWidth: 1.5,
            borderColor: theme.primaryOrange + 'B0',
        },
        // Bottom half clip container (blue)
        rippleHalfBottom: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: RING_SIZE / 2,
            overflow: 'hidden',
        },
        rippleHalfBottomInner: {
            width: RING_SIZE,
            height: RING_SIZE,
            borderRadius: RING_SIZE / 2,
            borderWidth: 1.5,
            borderColor: theme.primary + 'B0',
            position: 'absolute',
            bottom: 0,
        },
    });
