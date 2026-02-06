import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ColorValue, Modal } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    cancelAnimation,
    interpolate,
    FadeOut,
    SharedValue,
} from 'react-native-reanimated';
import { colors } from '@/styles';

const DOT_COUNT = 6;
const CYCLE_DURATION = 2400;

const getNumericSize = (size: 'small' | 'large' | number): number => {
    if (typeof size === 'number') return size;
    return size === 'small' ? 24 : 48;
};

// ... Dot component ...
const Dot = React.memo(
    ({
        index,
        sizeNum,
        color,
        progress,
    }: {
        index: number;
        sizeNum: number;
        color: string;
        progress: SharedValue<number>;
    }) => {
        const angle = (index * 60 * Math.PI) / 180;
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);

        const style = useAnimatedStyle(() => {
            const step = 1 / DOT_COUNT;
            let localP = (progress.value - index * step) % 1;
            if (localP < 0) localP += 1;

            let animValue = 0;

            if (localP < step) {
                // 0 -> 1 using smoothstep
                const t = localP / step;
                animValue = t * t * (3 - 2 * t);
            } else if (localP < 2 * step) {
                // 1 -> 0
                const t = (localP - step) / step;
                animValue = 1 - t * t * (3 - 2 * t);
            } else {
                animValue = 0;
            }

            const maxRadius = sizeNum / 2 - sizeNum / 10;
            const minRadius = 0;

            const currentRadius = interpolate(animValue, [0, 1], [maxRadius, minRadius]);
            const currentScale = interpolate(animValue, [0, 1], [1, 0.4]);

            const translateX = currentRadius * cosAngle;
            const translateY = currentRadius * sinAngle;

            return {
                transform: [{ translateX }, { translateY }, { scale: currentScale }],
                opacity: interpolate(animValue, [0, 1], [1, 0.5]),
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
    transparent?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
    size = 'large',
    color = colors.primary,
    children,
    isLoading = true,
    animateExit = true,
    transparent = true,
}) => {
    const sizeNum = getNumericSize(size);
    const mainColor = color as string;

    const rotation = useSharedValue(0);
    const progress = useSharedValue(0);

    useEffect(() => {
        // Continuous rotation
        rotation.value = withRepeat(
            withTiming(360, {
                duration: 6000,
                easing: Easing.linear,
            }),
            -1
        );

        // Continuous pulse driver 0 -> 1
        progress.value = withRepeat(
            withTiming(1, {
                duration: CYCLE_DURATION,
                easing: Easing.linear,
            }),
            -1
        );
    }, [rotation, progress]);

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
                    <Dot
                        key={i}
                        index={i}
                        sizeNum={sizeNum}
                        color={mainColor}
                        progress={progress}
                    />
                ))}
            </Animated.View>
        ),
        [sizeNum, mainColor, containerStyle, progress]
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
            // Strategy: Immediate Fade
            // 1. Start fading immediately (300ms)
            overlayOpacity.value = withTiming(0, { duration: 300 });

            // 2. Unmount after fade completes
            const timer = setTimeout(() => {
                setIsOverlayVisible(false);
            }, 300);
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
                    <Modal
                        transparent
                        animationType="none" // Animation is handled by Animated.View
                        visible={isOverlayVisible}
                        statusBarTranslucent
                    >
                        <Animated.View
                            style={[
                                styles.overlay,
                                overlayAnimatedStyle,
                                !transparent && { backgroundColor: colors.white },
                            ]}
                        >
                            {Spinner}
                        </Animated.View>
                    </Modal>
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
        backgroundColor: colors.overlayLoading,
        zIndex: 9999,
    },
    dot: {
        // Base position center, animated via transform
    },
});
