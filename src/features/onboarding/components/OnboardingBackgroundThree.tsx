import { Dimensions, Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

import { colors } from '@/styles';
import PhoneLarger from '@/assets/Icon/IconOnBoarding/phone-lager.svg';
import ShrimpChatPreview from '@/features/onboarding/components/AnimatedChatBubble.tsx';

// Image assets
const growthChartImage: ImageSourcePropType = require('@/assets/backgrounds/growth-chart.png');
const iconForQuestionImage: ImageSourcePropType = require('@/assets/backgrounds/icon-for-question.png');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PHONE_WIDTH = SCREEN_WIDTH * 0.9;
const PHONE_HEIGHT = SCREEN_HEIGHT * 0.6;

export default function OnboardingBackgroundThree() {
    const rotateSmartphone = useSharedValue(-20); // Start tilted
    const smartphoneTranslateY = useSharedValue(0);

    const rotateSmartphoneStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotate: `${rotateSmartphone.value}deg` },
                { translateY: smartphoneTranslateY.value },
            ],
        };
    });

    useEffect(() => {
        rotateSmartphone.value = withTiming(0, {
            // Animate to upright
            duration: 1000,
        });
        smartphoneTranslateY.value = withTiming(-150, {
            duration: 1000,
        });
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
                    <Image source={growthChartImage} style={styles.backgroundGrowthChart} />

                    <View style={styles.centerContainer}>
                        <Animated.View style={[styles.backgroundSmartphone, rotateSmartphoneStyle]}>
                            <PhoneLarger width={PHONE_WIDTH} height={PHONE_HEIGHT} />
                        </Animated.View>
                        <View style={styles.animatedChatBuddle}>
                            <ShrimpChatPreview
                                avatarSource={iconForQuestionImage}
                                question="Ao tôm của tôi hôm nay thế nào rồi?"
                                answer="Mức oxy hôm nay rất tốt đó!"
                                metrics={[
                                    {
                                        id: 'temp',
                                        label: 'Nhiệt độ',
                                        value: '30 °C',
                                        iconName: 'thermometer',
                                        iconColor: colors.red[900],
                                    },
                                    {
                                        id: 'ph',
                                        label: 'Độ pH',
                                        value: '7.2',
                                        iconName: 'water',
                                        iconColor: colors.cyan[800],
                                    },
                                    {
                                        id: 'oxy',
                                        label: 'Oxy hòa tan',
                                        value: '8.5',
                                        unit: 'mg/L',
                                        iconName: 'flash',
                                        iconColor: colors.orange[700],
                                    },
                                    {
                                        id: 'shrimp',
                                        label: 'Số lượng tôm',
                                        value: '2,450',
                                        iconName: 'fish',
                                        iconColor: colors.green[600],
                                    },
                                ]}
                            />
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    layerBackground: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundGrowthChart: {
        width: '100%',
        position: 'absolute',
        bottom: '60%',
        zIndex: 1,
    },
    backgroundSmartphone: {
        alignSelf: 'center',
        zIndex: 2,
        marginTop: '20%',
    },
    animatedChatBuddle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
        position: 'absolute',
        top: '21%',
        left: 0,
        right: 0,
    },
    linearGradient: {
        flex: 1,
    },
});
