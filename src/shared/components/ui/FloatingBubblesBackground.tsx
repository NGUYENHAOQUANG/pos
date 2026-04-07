import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    withDelay,
} from 'react-native-reanimated';
import { useAppTheme } from '@/styles/themeContext';

const { width, height } = Dimensions.get('window');

const FloatingBubble = ({
    initialX,
    initialY,
    size,
    color,
    delay = 0,
    duration = 4000,
}: {
    initialX: number;
    initialY: number;
    size: number;
    color: string;
    delay?: number;
    duration?: number;
}) => {
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        translateY.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(-50, { duration: duration, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: duration, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            )
        );

        scale.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1.2, {
                        duration: duration * 1.5,
                        easing: Easing.inOut(Easing.ease),
                    }),
                    withTiming(1, { duration: duration * 1.5, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            )
        );
    }, [delay, duration, scale, translateY]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }, { scale: scale.value }],
        };
    });

    return (
        <Animated.View
            style={[
                styles.bubble,
                {
                    left: initialX,
                    top: initialY,
                    width: size,
                    height: size,
                    backgroundColor: color,
                    borderRadius: size / 2,
                },
                animatedStyle,
            ]}
        />
    );
};

interface FloatingBubblesBackgroundProps {
    bubbleColor?: string;
}

export const FloatingBubblesBackground: React.FC<FloatingBubblesBackgroundProps> = ({
    bubbleColor,
}) => {
    const theme = useAppTheme();

    // Light mode: subtle blue tint | Dark mode: faint white glow
    const resolvedColor =
        bubbleColor ?? (theme.isDark ? 'rgba(255, 255, 255, 0.06)' : theme.primary + '10');

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <FloatingBubble
                initialX={-50}
                initialY={height * 0.1}
                size={200}
                color={resolvedColor}
                duration={5000}
            />
            <FloatingBubble
                initialX={width * 0.8}
                initialY={-40}
                size={180}
                color={resolvedColor}
                delay={500}
                duration={6500}
            />
            <FloatingBubble
                initialX={width * 0.6}
                initialY={height * 0.4}
                size={150}
                color={resolvedColor}
                delay={1000}
                duration={6000}
            />
            <FloatingBubble
                initialX={width * 0.1}
                initialY={height * 0.7}
                size={250}
                color={resolvedColor}
                delay={2000}
                duration={7000}
            />
            <FloatingBubble
                initialX={width * 0.7}
                initialY={height * 0.85}
                size={120}
                color={resolvedColor}
                delay={1500}
                duration={5500}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    bubble: {
        position: 'absolute',
    },
});
