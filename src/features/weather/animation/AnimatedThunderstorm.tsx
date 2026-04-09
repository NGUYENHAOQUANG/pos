import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
} from 'react-native-reanimated';
import type { SvgProps } from 'react-native-svg';

interface AnimatedThunderstormProps extends SvgProps {
    readonly size?: number;
}

const AnimatedThunderstorm: React.FC<AnimatedThunderstormProps> = ({
    size = 64,
    color = 'white',
    ...props
}) => {
    // Independent animation values
    const boltOpacity = useSharedValue(0);
    const boltScale = useSharedValue(0.9);
    const cloudX = useSharedValue(0);

    useEffect(() => {
        // Lightning Strobe Effect (Aggressive Double Flash)
        boltOpacity.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 1500 }), // Dark/Wait
                withTiming(1, { duration: 50 }), // Flash 1
                withTiming(0, { duration: 50 }), // Off
                withTiming(1, { duration: 50 }), // Flash 2
                withTiming(0, { duration: 300 }) // Fade out
            ),
            -1,
            true
        );

        // Lightning Scale Pop (Springs out dramatically during flashes)
        boltScale.value = withRepeat(
            withSequence(
                withTiming(0.9, { duration: 1500 }),
                withTiming(1.05, { duration: 50 }),
                withTiming(1, { duration: 50 }),
                withTiming(1.05, { duration: 50 }),
                withTiming(0.9, { duration: 300 })
            ),
            -1,
            true
        );

        // Thunder Tremble (Cloud vibrates horizontally reacting to the massive energy)
        cloudX.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 1550 }), // Wait for the first flash
                withTiming(1.5, { duration: 40 }), // Tremble Right
                withTiming(-1.5, { duration: 40 }), // Tremble Left
                withTiming(1.5, { duration: 40 }), // Tremble Right
                withTiming(0, { duration: 40 }), // Stop
                withTiming(0, { duration: 240 }) // Cool down
            ),
            -1,
            true
        );
    }, [boltOpacity, boltScale, cloudX]);

    const cloudAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: cloudX.value }],
    }));

    const boltAnimatedStyle = useAnimatedStyle(() => ({
        opacity: boltOpacity.value,
        transform: [{ scale: boltScale.value }],
    }));

    // The pristine standalone cloud path explicitly extracted from Snow.svg
    const cloudPath =
        'M25.3609 9.57534C25.2367 7.45144 24.3029 5.45601 22.7517 3.99991C21.2005 2.54381 19.1501 1.73791 17.0226 1.74814C14.8951 1.75838 12.8525 2.58397 11.3154 4.05491C9.77828 5.52586 8.86369 7.53019 8.75994 9.65519C8.74718 9.88195 8.64865 10.0954 8.48433 10.2522C8.32002 10.409 8.10221 10.4974 7.8751 10.4996H7.80947C7.57849 10.4789 7.36467 10.369 7.21351 10.1931C7.06236 10.0172 6.98579 9.78931 7.0001 9.55784C7.0305 8.94947 7.11579 8.34509 7.25494 7.75206C7.27289 7.6776 7.27098 7.59973 7.2494 7.52624C7.22782 7.45275 7.18732 7.38621 7.13195 7.33328C7.07659 7.28035 7.0083 7.24289 6.93391 7.22463C6.85952 7.20637 6.78165 7.20797 6.70807 7.22925C5.52363 7.57918 4.48499 8.30452 3.74857 9.296C3.01216 10.2875 2.61787 11.4914 2.6251 12.7264C2.64697 15.8666 5.26322 18.3746 8.40447 18.3746H17.0626C18.1948 18.3733 19.3149 18.141 20.3543 17.6919C21.3936 17.2427 22.3304 16.5862 23.1072 15.7625C23.884 14.9388 24.4845 13.9652 24.8721 12.9013C25.2596 11.8375 25.4259 10.7057 25.3609 9.57534Z';

    // Reconstructed pure Lightning Bolt detached from the cloud
    const boltPath =
        'M14.4956 18.375L12.9206 21H15.7501C15.905 21 16.0571 21.041 16.191 21.119C16.3248 21.197 16.4355 21.3092 16.5119 21.444C16.5882 21.5788 16.6273 21.7315 16.6253 21.8864C16.6233 22.0413 16.5802 22.1928 16.5004 22.3256L13.8754 26.7006C13.8162 26.7992 13.7382 26.8851 13.6458 26.9535C13.5535 27.0218 13.4485 27.0714 13.337 27.0992C13.2255 27.127 13.1096 27.1326 12.9959 27.1156C12.8822 27.0987 12.773 27.0595 12.6745 27.0003C12.5759 26.9411 12.49 26.8631 12.4216 26.7708C12.3533 26.6784 12.3037 26.5734 12.2759 26.4619C12.2481 26.3504 12.2425 26.2345 12.2594 26.1208C12.2764 26.0071 12.3156 25.8979 12.3748 25.7994L14.2046 22.75H11.3751C11.2202 22.75 11.068 22.709 10.9342 22.631C10.8004 22.553 10.6896 22.4408 10.6133 22.306C10.537 22.1712 10.4979 22.0185 10.4999 21.8636C10.5019 21.7087 10.545 21.5572 10.6248 21.4244L12.4546 18.375Z';

    return (
        <View style={{ width: size, height: size }}>
            {/* LIGHTNING BOLT LAYER - Tucked safely behind the cloud bottom edge */}
            <Animated.View style={[boltAnimatedStyle, { position: 'absolute', top: 0, left: 0 }]}>
                <Svg width={size} height={size} viewBox="0 0 28 28">
                    <Path d={boltPath} fill={color} />
                </Svg>
            </Animated.View>

            {/* CLOUD LAYER - Floating and trembling heavily when thunder strikes */}
            <Animated.View style={[cloudAnimatedStyle, { position: 'absolute', top: 0, left: 0 }]}>
                <Svg width={size} height={size} viewBox="0 0 28 28" {...props}>
                    <Path d={cloudPath} fill={color} />
                </Svg>
            </Animated.View>
        </View>
    );
};

export default AnimatedThunderstorm;
