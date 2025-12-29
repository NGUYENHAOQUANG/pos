import React, { useEffect } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    Easing,
    cancelAnimation,
} from 'react-native-reanimated';
import FanActiveSvg from '@/assets/Icon/fan-active.svg';
import FanDeactiveSvg from '@/assets/Icon/fan-deactive.svg';

interface FanIconProps {
    width?: number;
    height?: number;
    color?: string;
    isActive?: boolean;
}

export const FanIcon = React.memo(function FanIcon({
    width = 64,
    height = 64,
    color: _color = '#FFC107',
    isActive = false,
}: FanIconProps) {
    const rotation = useSharedValue(0);

    useEffect(() => {
        if (isActive) {
            rotation.value = withRepeat(
                withTiming(360, {
                    duration: 1800, // Slightly faster for better visual feedback
                    easing: Easing.linear,
                }),
                -1, // infinite
                false // no reverse
            );
        } else {
            rotation.value = withTiming(0, {
                duration: 400, // Smoother deceleration
                easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Ease-out for natural stop
            });
        }

        // Cleanup: cancel animation on unmount
        return () => {
            cancelAnimation(rotation);
        };
    }, [isActive, rotation]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const SvgComponent = isActive ? FanActiveSvg : FanDeactiveSvg;

    return (
        <Animated.View
            style={animatedStyle}
            accessible={true}
            accessibilityLabel={isActive ? 'Quạt nước đang hoạt động' : 'Quạt nước đã tắt'}
            accessibilityRole="image"
            accessibilityState={{ disabled: !isActive }}
        >
            <SvgComponent width={width} height={height} />
        </Animated.View>
    );
});
