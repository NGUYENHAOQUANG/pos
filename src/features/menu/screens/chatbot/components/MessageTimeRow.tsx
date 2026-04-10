/**
 * @file MessageTimeRow.tsx
 * @description Instagram-style swipe-to-reveal time cho mỗi message row
 */
import React, { useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';

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
    const theme = useAppTheme();
    const styles = useTimeRowStyles(theme);

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

const useTimeRowStyles = (theme: any) =>
    useMemo(
        () =>
            StyleSheet.create({
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
                    color: theme.textSecondary,
                    fontWeight: '400',
                },
            }),
        [theme]
    );
