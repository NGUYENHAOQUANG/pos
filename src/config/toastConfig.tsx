import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { ToastConfig } from 'react-native-toast-message';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { haptics } from '@/shared/utils/haptics';
import { playSound } from '@/shared/utils/sounds';
import CheckCircleIcon from '@/assets/Icon/CheckCircleFilled.svg';
import CloseIcon from '@/assets/Icon/CloseOutlined.svg';

// Custom Toast Component positioned at bottom with full width
const CustomToast = ({
    text1,
    text2,
    type,
}: {
    text1?: string;
    text2?: string;
    type: 'success' | 'error';
}) => {
    const insets = useSafeAreaInsets();
    const theme = useAppTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    return (
        <View style={[styles.wrapper, { marginBottom: insets.bottom + 12 }]}>
            <View style={styles.container}>
                <View style={styles.iconWrapper}>
                    {type === 'success' ? (
                        <CheckCircleIcon width={20} height={20} />
                    ) : (
                        <Text style={styles.errorTextIcon}>!</Text>
                    )}
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.text}>{text1}</Text>
                    {text2 ? <Text style={styles.subText}>{text2}</Text> : null}
                </View>
                {/* Close button */}
                <TouchableOpacity onPress={() => Toast.hide()} style={styles.closeButton}>
                    <CloseIcon width={16} height={16} color={theme.textSecondary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

/** Debounce timestamp to prevent double-firing from re-renders */
let lastFeedbackTime = 0;
const DEBOUNCE_MS = 500;

/** Fire haptic + sound feedback with debounce */
const triggerFeedback = (type: 'success' | 'error') => {
    const now = Date.now();
    if (now - lastFeedbackTime < DEBOUNCE_MS) return;
    lastFeedbackTime = now;

    if (type === 'success') {
        haptics.success();
        playSound('success');
    } else {
        haptics.error();
        playSound('error');
    }
};

export const toastConfig: ToastConfig = {
    success: ({ text1, text2, isVisible }) => {
        if (isVisible) {
            triggerFeedback('success');
        }
        return <CustomToast text1={text1} text2={text2} type="success" />;
    },
    error: ({ text1, text2, isVisible }) => {
        if (isVisible) {
            triggerFeedback('error');
        }
        return <CustomToast text1={text1} text2={text2} type="error" />;
    },
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        wrapper: {
            width: '100%',
            paddingHorizontal: spacing.md,
        },
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 40,
            backgroundColor: theme.isDark ? theme.backgroundSecondary : theme.background,
            borderRadius: borderRadius.md,
            paddingVertical: 12,
            paddingHorizontal: spacing.md,
            shadowColor: theme.shadow,
            shadowOffset: {
                width: 0,
                height: -2,
            },
            shadowOpacity: theme.isDark ? 0.3 : 0.1,
            shadowRadius: borderRadius.md,
            elevation: 4,
        },
        iconWrapper: {
            marginRight: 10,
        },
        contentContainer: {
            flex: 1,
        },
        text: {
            fontSize: 16,
            color: theme.text,
            fontWeight: '400',
        },
        subText: {
            fontSize: 16,
            color: theme.textSecondary,
            fontWeight: '400',
            marginTop: 2,
        },
        errorTextIcon: {
            color: theme.error,
            fontWeight: '400',
        },
        closeButton: {
            marginLeft: 8,
            padding: 4,
        },
        closeText: {
            fontSize: 16,
            color: theme.text,
            fontWeight: '400',
        },
    });
