import { ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useEffect, useState } from 'react';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
    withSequence,
    runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import PhoneSvg from '@/assets/Icon/IconOnBoarding/phone.svg';
import Feeder from '@/assets/Icon/IconOnBoarding/feeder.svg';
import { colors } from '@/styles';

// Image assets
const shrimpPondImage: ImageSourcePropType = require('@/assets/backgrounds/shrimp-pond.png');
const transformDataImage: ImageSourcePropType = require('@/assets/backgrounds/tranform-data.png');

type OnboardingBackgroundProps = {};

const OnboardingBackgroundTwo: React.FC<OnboardingBackgroundProps> = ({}) => {
    const pondTranslateY = useSharedValue(200);
    const tankTranslateX = useSharedValue(-80);
    const appTranslateX = useSharedValue(80);
    const phTranslateY = useSharedValue(50);
    const transformWidth = useSharedValue(0);

    // Sun/Moon toggle animation
    const [isSun, setIsSun] = useState(true);
    const iconOpacity = useSharedValue(1);

    const toggleIcon = () => {
        setIsSun(prev => !prev);
    };

    const iconAnimatedStyle = useAnimatedStyle(() => ({
        opacity: iconOpacity.value,
    }));

    const transformStyle = useAnimatedStyle(() => ({
        width: transformWidth.value,
    }));
    const pondStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: pondTranslateY.value }],
    }));
    const tankStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: tankTranslateX.value }],
    }));
    const appStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: appTranslateX.value }],
    }));
    const phStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: phTranslateY.value }],
    }));

    useEffect(() => {
        pondTranslateY.value = withTiming(0, {
            duration: 700,
            easing: Easing.out(Easing.cubic),
        });

        tankTranslateX.value = withDelay(
            200,
            withTiming(0, {
                duration: 500,
                easing: Easing.out(Easing.cubic),
            })
        );

        transformWidth.value = withDelay(
            250, // delay tí cho đẹp, muốn thì chỉnh
            withTiming(70, {
                duration: 500,
                easing: Easing.out(Easing.cubic),
            })
        );

        appTranslateX.value = withDelay(
            200,
            withTiming(0, {
                duration: 500,
                easing: Easing.out(Easing.cubic),
            })
        );

        phTranslateY.value = withDelay(
            200,
            withTiming(0, {
                duration: 500,
                easing: Easing.out(Easing.cubic),
            })
        );

        // Sun/Moon loop animation
        const animateIcon = () => {
            iconOpacity.value = withSequence(
                withTiming(0, { duration: 400 }),
                withTiming(1, { duration: 400 })
            );
        };

        const interval = setInterval(() => {
            animateIcon();
            setTimeout(() => {
                runOnJS(toggleIcon)();
            }, 400);
        }, 2000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <View style={styles.layerBackground} pointerEvents="none">
                <LinearGradient
                    colors={[colors.onboarding.gradientTop, colors.onboarding.gradientBottom]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.linearGradient}
                >
                    <SafeAreaView style={styles.safeArea}>
                        <View style={styles.topHalf}>
                            <View style={styles.badge}>
                                <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
                                    <Ionicons
                                        name={isSun ? 'sunny' : 'moon'}
                                        size={16}
                                        color={isSun ? colors.yellow[700] : colors.blue[600]}
                                    />
                                </Animated.View>
                                <Text style={styles.text}>24/7</Text>
                            </View>

                            {/* Scene container - icons are relative to this */}
                            <View style={styles.sceneContainer}>
                                {/* Pond image */}
                                <Animated.Image
                                    source={shrimpPondImage}
                                    style={[styles.pondImage, pondStyle]}
                                    resizeMode="contain"
                                />

                                {/* Top icons row - feeder, dots, phone grouped together */}
                                <View style={styles.topIconsRow}>
                                    {/* Feeder */}
                                    <Animated.View style={[styles.feederWrapper, tankStyle]}>
                                        <Feeder width={120} height={120} />
                                    </Animated.View>

                                    {/* Dots connector with white background */}
                                    <View style={styles.dotsBackground}>
                                        <Animated.Image
                                            source={transformDataImage}
                                            style={[styles.dotsConnector, transformStyle]}
                                            resizeMode="contain"
                                        />
                                    </View>

                                    {/* Phone */}
                                    <Animated.View style={[styles.phoneWrapper, appStyle]}>
                                        <PhoneSvg width={85} height={115} />
                                    </Animated.View>
                                </View>

                                <View style={styles.phBadgeContainer}>
                                    <Animated.View style={[styles.phBadge, phStyle]}>
                                        <Ionicons name="water" color={colors.black} size={24} />
                                        <Text style={styles.text}>pH 7.2</Text>
                                    </Animated.View>
                                </View>
                            </View>
                        </View>

                        {/* Nửa dưới */}
                        <View style={styles.bottomHalf} />
                    </SafeAreaView>
                </LinearGradient>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    layerBackground: {
        flex: 1,
    },
    topHalf: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        overflow: 'visible',
    },
    bottomHalf: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    linearGradient: {
        flex: 1,
    },

    // Scene container - all icons are relative to this
    sceneContainer: {
        width: '90%',
        aspectRatio: 1.3,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 20,
    },

    // Pond image - main element
    pondImage: {
        width: '100%',
        height: '80%',
        borderRadius: 16,
    },

    // Top icons row container - holds feeder, dots, phone
    topIconsRow: {
        position: 'absolute',
        top: '8%',
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },

    // Feeder wrapper (for animation)
    feederWrapper: {
        marginRight: -40,
    },

    // White background strip behind dots
    dotsBackground: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 8,
        marginHorizontal: 0,
        marginTop: '-10%',
    },

    // Dots connector
    dotsConnector: {
        width: 50,
        height: 25,
    },

    // Phone wrapper (for animation)
    phoneWrapper: {
        marginLeft: -40,
    },

    // pH Badge container - bottom left corner of pond
    phBadgeContainer: {
        position: 'absolute',
        bottom: '30%',
        left: '10%',
        zIndex: 10,
    },

    // pH Badge
    phBadge: {
        borderRadius: 16,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        shadowColor: colors.black,
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 4,
    },

    // Badge 24/7 - top center
    badge: {
        position: 'absolute',
        top: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: colors.white,
        borderRadius: 999,
        shadowColor: colors.black,
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 6,
        zIndex: 20,
    },
    iconContainer: {
        marginRight: 8,
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.gray[800],
    },
});

export default OnboardingBackgroundTwo;
