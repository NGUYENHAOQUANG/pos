/**
 * @file TypingIndicator.tsx
 * @description Hiển thị animation 3 chấm khi bot đang typing
 */
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS } from '@/features/menu/screens/chatbot/constants';
import ChatBotIcon from '@/assets/Icon/IconMenu/ChatBotIcon.svg';

export const TypingIndicator: React.FC = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createDotAnimation = (dot: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, {
                        toValue: 1,
                        duration: 300,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 300,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const anim1 = createDotAnimation(dot1, 0);
        const anim2 = createDotAnimation(dot2, 200);
        const anim3 = createDotAnimation(dot3, 400);
        anim1.start();
        anim2.start();
        anim3.start();

        return () => {
            anim1.stop();
            anim2.stop();
            anim3.stop();
        };
    }, [dot1, dot2, dot3]);

    const dotStyle = (animValue: Animated.Value) => ({
        transform: [
            {
                translateY: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -4],
                }),
            },
        ],
    });

    return (
        <View style={styles.container}>
            <View style={styles.botAvatarSmall}>
                <ChatBotIcon width={28} height={28} />
            </View>
            <View style={styles.bubble}>
                <Animated.View style={[styles.dot, dotStyle(dot1)]} />
                <Animated.View style={[styles.dot, dotStyle(dot2)]} />
                <Animated.View style={[styles.dot, dotStyle(dot3)]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingLeft: 8,
        paddingBottom: 4,
        gap: 8,
    },
    botAvatarSmall: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    bubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.grayLight,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.grayText,
    },
});
