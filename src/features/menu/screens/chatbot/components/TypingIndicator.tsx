/**
 * @file TypingIndicator.tsx
 * @description Hiển thị animation 3 chấm khi bot đang typing
 */
import React, { useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '@/styles/colors';
import { ChatbotAvatar } from '@/features/menu/screens/chatbot/animation/ChatbotAvatar';

export const TypingIndicator: React.FC = () => {
    const styles = useTypingStyles();

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
            <ChatbotAvatar size={40} animated />
            <View style={styles.bubble}>
                <Animated.View style={[styles.dot, dotStyle(dot1)]} />
                <Animated.View style={[styles.dot, dotStyle(dot2)]} />
                <Animated.View style={[styles.dot, dotStyle(dot3)]} />
            </View>
        </View>
    );
};

const useTypingStyles = () =>
    useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    paddingLeft: 8,
                    paddingBottom: 4,
                    gap: 8,
                },
                bubble: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.chatbot.glassBg,
                    borderWidth: 1,
                    borderColor: colors.chatbot.glassBorder,
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    gap: 4,
                },
                dot: {
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: colors.textSecondary,
                },
            }),
        []
    );
