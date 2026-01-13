import { Image, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import ShrimpChatPreview from '@/features/onboarding/components/AnimatedChatBubble.tsx';

export default function OnboardingBackgroundThree() {
    const rotateSmartphone = useSharedValue(0);
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
        rotateSmartphone.value = withTiming(10, {
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
                    colors={['rgba(233,253,255, 1)', 'rgba(252,242,240, 1)']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.linearGradient}
                >
                    <Image
                        source={require('@/assets/backgrounds/growth-chart.png')}
                        style={styles.backgroundGrowthChart}
                    />

                    <View style={styles.centerContainer}>
                        <Animated.Image
                            source={require('@/assets/backgrounds/smartphone.png')}
                            style={[styles.backgroundSmartphone, rotateSmartphoneStyle]}
                        />
                        <View style={styles.animatedChatBuddle}>
                            <ShrimpChatPreview
                                avatarSource={require('@/assets/backgrounds/icon-for-question.png')}
                                question="Ao tôm của tôi hôm nay thế nào rồi?"
                                answer="Mức oxy hôm nay rất tốt đó!"
                                metrics={[
                                    {
                                        id: 'temp',
                                        label: 'Nhiệt độ',
                                        value: '2,450',
                                        iconName: 'thermometer',
                                        iconColor: '#ef4444',
                                    },
                                    {
                                        id: 'ph',
                                        label: 'Độ pH',
                                        value: '7.2',
                                        iconName: 'water',
                                        iconColor: '#0ea5e9',
                                    },
                                    {
                                        id: 'oxy',
                                        label: 'Oxy hòa tan',
                                        value: '8.5',
                                        unit: 'mg/L',
                                        iconName: 'flash',
                                        iconColor: '#f97316',
                                    },
                                    {
                                        id: 'shrimp',
                                        label: 'Số lượng tôm',
                                        value: '2,450',
                                        iconName: 'fish',
                                        iconColor: '#22c55e',
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
        position: 'absolute',
        bottom: '20%',
        left: 0,
        right: 0,
        zIndex: 2,
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
