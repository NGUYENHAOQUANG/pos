import React, { useEffect } from 'react';
import { SvgProps } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
} from 'react-native-reanimated';

// Weather condition icons
import ClearDay from '@/assets/Icon/IconWeather/ClearDay.svg';
import ClearNight from '@/assets/Icon/IconWeather/ClearNight.svg';
import PartlyCloudy from '@/assets/Icon/IconWeather/PartlyCloudy.svg';
import CloudyNight from '@/assets/Icon/IconWeather/CloudyNight.svg';
import LightRain from '@/assets/Icon/IconWeather/LightRain.svg';
import HeavyRain from '@/assets/Icon/IconWeather/HeavyRain.svg';
import Snow from '@/assets/Icon/IconWeather/Snow.svg';
import Thunderstorm from '@/assets/Icon/IconWeather/Thunderstorm.svg';
import AnimatedPartlyCloudy from '../animation/AnimatedPartlyCloudy';
import AnimatedRain from '../animation/AnimatedRain';
import AnimatedThunderstorm from '../animation/AnimatedThunderstorm';

export type WeatherIconKey =
    | 'ClearDay'
    | 'ClearNight'
    | 'PartlyCloudy'
    | 'CloudyNight'
    | 'LightRain'
    | 'HeavyRain'
    | 'Snow'
    | 'Thunderstorm';

const ICON_MAP: Record<WeatherIconKey, React.FC<SvgProps>> = {
    ClearDay: ClearDay,
    ClearNight: ClearNight,
    PartlyCloudy: PartlyCloudy,
    CloudyNight: CloudyNight,
    LightRain: LightRain,
    HeavyRain: HeavyRain,
    Snow: Snow,
    Thunderstorm: Thunderstorm,
};

// ================= ANIMATION WRAPPERS =================

// 1. Float Effect (Clouds, Milder weather) - Gentle breathing
const FloatWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const translateY = useSharedValue(0);
    useEffect(() => {
        translateY.value = withRepeat(
            withSequence(
                withTiming(-3, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
                withTiming(3, { duration: 2500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, [translateY]);
    const style = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
    return <Animated.View style={style}>{children}</Animated.View>;
};

// 2. Night/Moon Effect (Gentle scaling + rocking) - Dreamy night vibe
const PulseMoonWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const scale = useSharedValue(1);
    const rotation = useSharedValue(-2);
    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
        rotation.value = withRepeat(
            withSequence(
                withTiming(4, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
                withTiming(-4, { duration: 3500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, [scale, rotation]);
    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    }));
    return <Animated.View style={style}>{children}</Animated.View>;
};

// 3. Snow Effect (Drifting side to side / rotating like falling snow)
const SnowWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const rotation = useSharedValue(-6);
    useEffect(() => {
        rotation.value = withRepeat(
            withSequence(
                withTiming(6, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
                withTiming(-6, { duration: 3000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, [rotation]);
    const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
    return <Animated.View style={style}>{children}</Animated.View>;
};

// ======================================================

interface WeatherIconProps extends SvgProps {
    readonly name: string;
    readonly size?: number;
    readonly animate?: boolean;
}

const getWrapper = (name: string, animate: boolean) => {
    if (!animate) return React.Fragment;
    switch (name) {
        case 'ClearNight':
            return PulseMoonWrapper;
        case 'CloudyNight':
            return FloatWrapper;
        case 'Snow':
            return SnowWrapper;
        default:
            return React.Fragment;
    }
};

/** Renders a weather SVG icon by key name */
const WeatherIcon: React.FC<WeatherIconProps> = ({
    name,
    size = 24,
    animate = false,
    color,
    ...rest
}) => {
    const IconComponent = ICON_MAP[name as WeatherIconKey];
    const ActualComponent = IconComponent || ICON_MAP.PartlyCloudy;

    // Custom monolithic path-splitted components for supreme independent animations
    if (animate) {
        if (name === 'PartlyCloudy') {
            return <AnimatedPartlyCloudy size={size} color={color} {...rest} />;
        }
        if (name === 'LightRain' || name === 'HeavyRain') {
            return (
                <AnimatedRain heavy={name === 'HeavyRain'} size={size} color={color} {...rest} />
            );
        }
        if (name === 'Thunderstorm') {
            return <AnimatedThunderstorm size={size} color={color} {...rest} />;
        }
    }

    // Use specific motion wrapper based on the weather key
    const Wrapper = getWrapper(name, animate);

    return (
        <Wrapper>
            <ActualComponent width={size} height={size} color={color} {...rest} />
        </Wrapper>
    );
};

export default WeatherIcon;
