import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, G, SvgProps } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
} from 'react-native-reanimated';

interface AnimatedSunProps extends SvgProps {
    readonly size?: number;
}

const AnimatedSun: React.FC<AnimatedSunProps> = ({ size = 64, color = 'white', ...props }) => {
    // Shared values for continuous rotation and pulsing rays
    const rotation = useSharedValue(0);
    const scalePulse = useSharedValue(1);

    useEffect(() => {
        // Continuous, smooth rotation via transform (GPU)
        rotation.value = withRepeat(
            withTiming(360, { duration: 18000, easing: Easing.linear }),
            -1,
            false // no ping-pong
        );

        // Gentle pulse effect via scale transform mapping (GPU)
        scalePulse.value = withRepeat(
            withSequence(
                withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true // ping-pong
        );
    }, [rotation, scalePulse]);

    const animatedWrapperStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }],
            width: size,
            height: size,
            justifyContent: 'center',
            alignItems: 'center',
        };
    });

    const animatedPulseStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scalePulse.value }],
            ...StyleSheet.absoluteFillObject,
        };
    });

    // 8 standard radial angles for the sun rays
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];

    return (
        <Animated.View style={animatedWrapperStyle}>
            {/* 1. Core Circle Layer (Static SVG) */}
            <View style={StyleSheet.absoluteFillObject}>
                <Svg width={size} height={size} viewBox="0 0 64 64" fill="none" {...props}>
                    <Circle cx="32" cy="32" r="16" fill={color} />
                </Svg>
            </View>

            {/* 2. Rays Layer (Static SVG inside an Animated.View for scaling) */}
            <Animated.View style={animatedPulseStyle} pointerEvents="none">
                <Svg width={size} height={size} viewBox="0 0 64 64" fill="none" {...props}>
                    {angles.map(angle => (
                        <G key={angle} rotation={angle} originX="32" originY="32">
                            <Line
                                x1="32"
                                x2="32"
                                y1="4"
                                y2="10"
                                stroke={color}
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                        </G>
                    ))}
                </Svg>
            </Animated.View>
        </Animated.View>
    );
};

export default AnimatedSun;
