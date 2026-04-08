/**
 * @file WelcomeContent.tsx
 * @description Gemini-style welcome screen hiển thị khi chưa có message
 */
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { COLORS, WELCOME_SUGGESTIONS } from '../constants';

interface WelcomeContentProps {
    userName?: string;
    onSuggestionPress: (text: string) => void;
}

export const WelcomeContent: React.FC<WelcomeContentProps> = ({ userName, onSuggestionPress }) => {
    // ── Staggered fade-in animations ──
    const greetingOpacity = useRef(new Animated.Value(0)).current;
    const greetingTranslateY = useRef(new Animated.Value(20)).current;
    const questionOpacity = useRef(new Animated.Value(0)).current;
    const questionTranslateY = useRef(new Animated.Value(20)).current;
    const chipAnimations = useRef(
        WELCOME_SUGGESTIONS.map(() => ({
            opacity: new Animated.Value(0),
            translateY: new Animated.Value(15),
        }))
    ).current;

    useEffect(() => {
        Animated.sequence([
            // 1. Greeting text
            Animated.parallel([
                Animated.timing(greetingOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(greetingTranslateY, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            // 2. Question text
            Animated.parallel([
                Animated.timing(questionOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(questionTranslateY, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            // 3. Suggestion chips (staggered)
            Animated.stagger(
                100,
                chipAnimations.map(anim =>
                    Animated.parallel([
                        Animated.timing(anim.opacity, {
                            toValue: 1,
                            duration: 350,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim.translateY, {
                            toValue: 0,
                            duration: 350,
                            easing: Easing.out(Easing.cubic),
                            useNativeDriver: true,
                        }),
                    ])
                )
            ),
        ]).start();
    }, [greetingOpacity, greetingTranslateY, questionOpacity, questionTranslateY, chipAnimations]);

    return (
        <View style={styles.wrapper}>
            {/* ── Greeting Section ─── */}
            <View style={styles.greetingSection}>
                <Animated.View
                    style={[
                        styles.greetingRow,
                        {
                            opacity: greetingOpacity,
                            transform: [{ translateY: greetingTranslateY }],
                        },
                    ]}
                >
                    <Text style={styles.greetingSmall}>
                        Xin chào{userName ? ` ${userName}` : ''}! 👋
                    </Text>
                </Animated.View>

                <Animated.View
                    style={{
                        opacity: questionOpacity,
                        transform: [{ translateY: questionTranslateY }],
                    }}
                >
                    <Text style={styles.greetingLarge}>Tôi có thể giúp gì cho bạn hôm nay?</Text>
                </Animated.View>
            </View>

            {/* ── Suggestion Chips ─── */}
            <View style={styles.suggestionsSection}>
                {WELCOME_SUGGESTIONS.map((item, index) => (
                    <Animated.View
                        key={item.id}
                        style={{
                            opacity: chipAnimations[index].opacity,
                            transform: [{ translateY: chipAnimations[index].translateY }],
                        }}
                    >
                        <TouchableOpacity
                            style={[styles.suggestionChip, { backgroundColor: item.color }]}
                            onPress={() => onSuggestionPress(item.text)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.suggestionIcon}>{item.icon}</Text>
                            <Text style={styles.suggestionText}>{item.text}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 24,
    },
    greetingSection: {
        marginBottom: 40,
    },
    greetingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    greetingSmall: {
        fontSize: 16,
        fontWeight: '400',
        color: COLORS.grayText,
    },
    greetingLarge: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A2E',
        letterSpacing: -0.3,
    },
    suggestionsSection: {
        gap: 12,
    },
    suggestionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        gap: 14,
    },
    suggestionIcon: {
        fontSize: 22,
    },
    suggestionText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1A1A2E',
        flex: 1,
    },
});
