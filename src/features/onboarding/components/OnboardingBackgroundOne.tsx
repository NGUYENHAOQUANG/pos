import { colors } from '@/styles';
import React, { useEffect } from 'react';
import { ImageBackground, ImageSourcePropType, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';

// Image assets
const backgroundImage: ImageSourcePropType = require('@/assets/backgrounds/background-1.png');
const shrimpBgImage: ImageSourcePropType = require('@/assets/Icon/IconOnBoarding/shrimp-bg.png');
const pondImage: ImageSourcePropType = require('@/assets/backgrounds/pond.png');
const shrimpsImage: ImageSourcePropType = require('@/assets/backgrounds/shrimps.png');
const livePulseImage: ImageSourcePropType = require('@/assets/backgrounds/live-pulse.png');

type OnboardingBackgroundProps = {};

const OnboardingBackgroundOne: React.FC<OnboardingBackgroundProps> = ({}) => {
    // 1. shared values
    const pondScale = useSharedValue(0.8);

    const shrimpsTranslateY = useSharedValue(12);
    const shrimpsOpacity = useSharedValue(0);

    const pulseTranslateY = useSharedValue(12);
    const pulseOpacity = useSharedValue(0);

    // Shrimp background (top-left framed image) - slide from left
    const shrimpBgTranslateX = useSharedValue(-200);
    const shrimpBgOpacity = useSharedValue(0);

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

    const shrimpBgAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shrimpBgTranslateX.value }],
        opacity: shrimpBgOpacity.value,
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
            })
        );
        shrimpsOpacity.value = withDelay(
            150,
            withTiming(1, {
                duration: 500,
                easing: Easing.out(Easing.cubic),
            })
        );

        // pulse nổi lên + fade in sau một chút
        pulseTranslateY.value = withDelay(
            250,
            withTiming(0, {
                duration: 500,
                easing: Easing.out(Easing.cubic),
            })
        );
        pulseOpacity.value = withDelay(
            250,
            withTiming(1, {
                duration: 500,
                easing: Easing.out(Easing.cubic),
            })
        );

        // shrimp background slide in from left + fade in
        shrimpBgTranslateX.value = withDelay(
            100,
            withTiming(0, {
                duration: 600,
                easing: Easing.out(Easing.cubic),
            })
        );
        shrimpBgOpacity.value = withDelay(
            100,
            withTiming(1, {
                duration: 600,
                easing: Easing.out(Easing.cubic),
            })
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View style={styles.layerBackground} pointerEvents="none">
            <ImageBackground source={backgroundImage} style={styles.imageBackground}>
                <View style={styles.overlay} />

                {/* Shrimp background image (top-left) with corner bracket frame */}
                <Animated.View style={[styles.shrimpBgContainer, shrimpBgAnimatedStyle]}>
                    {/* Image wrapper - corners are relative to this */}
                    <View style={styles.imageWrapper}>
                        {/* Corner brackets */}
                        <View style={[styles.cornerBracket, styles.cornerTopLeft]} />
                        <View style={[styles.cornerBracket, styles.cornerTopRight]} />
                        <View style={[styles.cornerBracket, styles.cornerBottomLeft]} />
                        <View style={[styles.cornerBracket, styles.cornerBottomRight]} />

                        <Animated.Image
                            source={shrimpBgImage}
                            style={styles.shrimpBgImage}
                            resizeMode="cover"
                        />
                    </View>
                </Animated.View>

                <Animated.View style={styles.imagePound}>
                    {/* Ao tôm: scale in */}
                    <Animated.Image
                        source={pondImage}
                        style={[styles.pondIcon, pondAnimatedStyle]}
                    />

                    {/* Shrimp: translateY lên + fade in */}
                    <Animated.Image
                        source={shrimpsImage}
                        style={[styles.shrimpsIcon, shrimpsAnimatedStyle]}
                    />

                    {/* Pulse: translateY lên + fade in */}
                    <Animated.Image
                        source={livePulseImage}
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
    imageBackground: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
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
    shrimpBgContainer: {
        position: 'absolute',
        top: 130,
        left: 40,
        width: 230,
        height: 180,
        zIndex: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageWrapper: {
        width: '90%',
        height: '90%',
        position: 'relative',
    },
    shrimpBgImage: {
        width: '100%',
        height: '100%',
        borderRadius: 4,
    },
    cornerBracket: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: colors.cyan[600],
        zIndex: 10,
    },
    cornerTopLeft: {
        top: -8,
        left: -8,
        borderTopWidth: 3,
        borderLeftWidth: 3,
    },
    cornerTopRight: {
        top: -8,
        right: -8,
        borderTopWidth: 3,
        borderRightWidth: 3,
    },
    cornerBottomLeft: {
        bottom: -8,
        left: -8,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
    },
    cornerBottomRight: {
        bottom: -8,
        right: -8,
        borderBottomWidth: 3,
        borderRightWidth: 3,
    },
});

export default OnboardingBackgroundOne;
