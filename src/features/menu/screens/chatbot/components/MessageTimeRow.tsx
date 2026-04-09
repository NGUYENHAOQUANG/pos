/**
 * @file MessageTimeRow.tsx
 * @description Instagram-style swipe-to-reveal time cho mỗi message row
 */
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { COLORS } from '@/features/menu/screens/chatbot/constants';

interface MessageTimeRowProps {
    children: React.ReactNode;
    time: string;
    swipeTranslateX: Animated.Value;
    swipeTimeOpacity: Animated.Value;
}

export const MessageTimeRow: React.FC<MessageTimeRowProps> = ({
    children,
    time,
    swipeTranslateX,
    swipeTimeOpacity,
}) => {
    return (
        <View style={styles.container}>
            {/* Time — positioned on the right, visible when swiping */}
            <Animated.View style={[styles.timeContainer, { opacity: swipeTimeOpacity }]}>
                <Text style={styles.timeText}>{time}</Text>
            </Animated.View>

            {/* Message — slides left with shared animated value */}
            <Animated.View style={{ transform: [{ translateX: swipeTranslateX }] }}>
                {children}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        overflow: 'hidden',
    },
    timeContainer: {
        position: 'absolute',
        right: 8,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    timeText: {
        fontSize: 11,
        color: COLORS.grayText,
        fontWeight: '400',
    },
});
