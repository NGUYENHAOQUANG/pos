import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ColorValue } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withDelay,
    withSequence,
    Easing,
    cancelAnimation,
    interpolate,
    FadeOut,
} from 'react-native-reanimated';
import { colors } from '@/styles';

const DOT_COUNT = 6;
const CYCLE_DURATION = 2400;
const STEP_DURATION = CYCLE_DURATION / DOT_COUNT;

const getNumericSize = (size: 'small' | 'large' | number): number => {
    if (typeof size === 'number') return size;
    return size === 'small' ? 24 : 48;
};

// ... Dot component ...
const Dot = React.memo(
    ({ index, sizeNum, color }: { index: number; sizeNum: number; color: string }) => {
        const progress = useSharedValue(0);

        const angle = (index * 60 * Math.PI) / 180;
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);

        useEffect(() => {
            const moveIn = withTiming(1, {
                duration: STEP_DURATION,
                easing: Easing.inOut(Easing.ease),
            });
            const moveOut = withTiming(0, {
                duration: STEP_DURATION,
                easing: Easing.inOut(Easing.ease),
            });

            const sequence = withSequence(
                moveIn,
                moveOut,
                withTiming(0, { duration: (DOT_COUNT - 2) * STEP_DURATION })
            );

            const initialDelay = index * STEP_DURATION;

            progress.value = withDelay(initialDelay, withRepeat(sequence, -1, false));

            // CRITICAL FIX: Do NOT cancelAnimation on cleanup.
            // This ensures the animation keeps running during the 'exiting' fade-out phase of the parent View.
            // Reanimated will automatically garbage collect the shared value when the node is truly destroyed.
        }, [index, progress]);

        const style = useAnimatedStyle(() => {
            const maxRadius = sizeNum / 2 - sizeNum / 10;
            const minRadius = 0;

            const currentRadius = interpolate(progress.value, [0, 1], [maxRadius, minRadius]);
            const currentScale = interpolate(progress.value, [0, 1], [1, 0.4]);

            const translateX = currentRadius * cosAngle;
            const translateY = currentRadius * sinAngle;

            return {
                transform: [{ translateX }, { translateY }, { scale: currentScale }],
                opacity: interpolate(progress.value, [0, 1], [1, 0.5]),
            };
        });

        const dotSize = sizeNum / 6;

        return (
            <Animated.View
                style={[
                    styles.dot,
                    {
                        width: dotSize,
                        height: dotSize,
                        borderRadius: dotSize,
                        backgroundColor: color,
                        position: 'absolute',
                    },
                    style,
                ]}
            />
        );
    }
);

interface LoadingProps {
    size?: 'small' | 'large' | number;
    color?: ColorValue;
    children?: React.ReactNode;
    isLoading?: boolean;
    animateExit?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
    size = 'large',
    color = colors.primary,
    children,
    isLoading = true,
    animateExit = true,
}) => {
    const sizeNum = getNumericSize(size);
    const mainColor = color as string;

    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, {
                duration: 6000,
                easing: Easing.linear,
            }),
            -1
        );
    }, [rotation]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const Spinner = React.useMemo(
        () => (
            <Animated.View
                style={[
                    {
                        width: sizeNum,
                        height: sizeNum,
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                    containerStyle,
                ]}
            >
                {Array.from({ length: DOT_COUNT }).map((_, i) => (
                    <Dot key={i} index={i} sizeNum={sizeNum} color={mainColor} />
                ))}
            </Animated.View>
        ),
        [sizeNum, mainColor, containerStyle]
    );

    // --- Wrapper Mode Logic ---
    const [isOverlayVisible, setIsOverlayVisible] = useState(isLoading);
    const overlayOpacity = useSharedValue(isLoading ? 1 : 0);

    useEffect(() => {
        if (!children) return;

        if (isLoading) {
            setIsOverlayVisible(true);
            cancelAnimation(overlayOpacity);
            overlayOpacity.value = 1;
        } else {
            // Strategy: Immediate Fade + Extended Keep Alive
            // 1. Start fading immediately (1000ms)
            overlayOpacity.value = withTiming(0, { duration: 1000 });

            // 2. Keep component mounted & active for 2.5s total (1s fade + 1.5s buffer)
            // This satisfies: "Hoạt động thêm 1-2 giây rồi tắt hẳn"
            // Ensures animation loop survives any UI thread locks during content mount.
            const timer = setTimeout(() => {
                setIsOverlayVisible(false);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [isLoading, children, overlayOpacity]);

    const overlayAnimatedStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }));

    if (children) {
        return (
            <View style={{ flex: 1 }}>
                {children}
                {/* 
                   Render Overlay if Visible.
                   pointerEvents='none' as soon as fading starts (isLoading=false)
                */}
                {isOverlayVisible && (
                    <Animated.View
                        style={[styles.overlay, overlayAnimatedStyle]}
                        pointerEvents={isLoading ? 'auto' : 'none'}
                    >
                        {Spinner}
                    </Animated.View>
                )}
            </View>
        );
    }

    // Standalone mode: FadeOut exiting handles unmount
    return (
        <Animated.View
            style={styles.container}
            exiting={animateExit ? FadeOut.duration(800) : undefined}
        >
            {Spinner}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        zIndex: 9999,
    },
    dot: {
        // Base position center, animated via transform
    },
});
