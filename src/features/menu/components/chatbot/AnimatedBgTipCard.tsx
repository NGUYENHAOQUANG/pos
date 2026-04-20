import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors } from '@/styles/colors';
import { borderRadius } from '@/styles';
import { useSettingsStore } from '@/features/menu/store/settingsStore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CloseIcon from '@/assets/Icon/CloseOutlined.svg';
import Toast from 'react-native-toast-message';

/** Maximum number of times the tip card will be shown */
const MAX_DISMISS_COUNT = 3;

export const AnimatedBgTipCard: React.FC = () => {
    const isEnabled = useSettingsStore(s => s.chatbotAnimatedBgEnabled);
    const dismissCount = useSettingsStore(s => s.chatbotBgPromptDismissCount);
    const toggleAnimatedBg = useSettingsStore(s => s.toggleChatbotAnimatedBg);
    const incrementDismiss = useSettingsStore(s => s.incrementChatbotBgPromptDismiss);

    // Local state — X button hides for current session only
    const [hiddenThisSession, setHiddenThisSession] = useState(false);

    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(10)).current;

    // Show when: not enabled, not permanently dismissed, not hidden this session
    const shouldShow = !isEnabled && dismissCount < MAX_DISMISS_COUNT && !hiddenThisSession;

    useEffect(() => {
        if (shouldShow) {
            // Reset animation values when showing again
            opacity.setValue(0);
            translateY.setValue(10);
            // Delay entrance so it appears after suggestion cards
            const timer = setTimeout(() => {
                Animated.parallel([
                    Animated.timing(opacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateY, {
                        toValue: 0,
                        duration: 400,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                ]).start();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [shouldShow, opacity, translateY]);

    // X button — hide for this session only (will show again next visit)
    const handleClose = useCallback(() => {
        setHiddenThisSession(true);
    }, []);

    // "Không hiển thị lại" — permanent dismiss (YouTube style)
    const handleNeverShow = useCallback(() => {
        // Set count to max to permanently hide
        for (let i = dismissCount; i < MAX_DISMISS_COUNT; i++) {
            incrementDismiss();
        }
    }, [dismissCount, incrementDismiss]);

    // "Bật ngay" — enable animated bg
    const handleEnable = useCallback(() => {
        toggleAnimatedBg();
        Toast.show({
            type: 'success',
            text1: 'Đã bật nền động AI ✨',
            text2: 'Bạn có thể tắt trong cài đặt',
        });
    }, [toggleAnimatedBg]);

    if (!shouldShow) return null;

    return (
        <Animated.View
            style={[
                styles.card,
                {
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            {/* Close button (X) — top right */}
            <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.6}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <CloseIcon width={14} height={14} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name="sparkles" size={18} color={colors.black} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Nền động AI</Text>
                    <Text style={styles.description}>
                        Bật hiệu ứng nền loang màu chuyển động cho trải nghiệm sống động hơn
                    </Text>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.neverShowButton}
                    onPress={handleNeverShow}
                    activeOpacity={0.7}
                >
                    <Text style={styles.neverShowText}>Không hiển thị lại</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.enableButton}
                    onPress={handleEnable}
                    activeOpacity={0.7}
                >
                    <Ionicons name="sparkles" size={14} color={colors.black} />
                    <Text style={styles.enableText}>Bật ngay</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginTop: 8,
        backgroundColor: colors.chatbot.glassBg,
        borderWidth: 1,
        borderColor: colors.chatbot.glassBorder,
        borderRadius: borderRadius.md,
        padding: 16,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
        padding: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingRight: 24,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: colors.chatbot.glassButtonBg,
        borderWidth: 1,
        borderColor: colors.chatbot.glassButtonBorder,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        gap: 4,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    description: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 18,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
        marginTop: 14,
    },
    neverShowButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    neverShowText: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.textSecondary,
    },
    enableButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: borderRadius.full,
        backgroundColor: colors.chatbot.glassButtonBg,
        borderWidth: 1,
        borderColor: colors.chatbot.glassButtonBorder,
    },
    enableText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
});
