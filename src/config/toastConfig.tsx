import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ToastConfig } from 'react-native-toast-message';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, spacing } from '@/styles';
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
                    <CloseIcon width={16} height={16} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export const toastConfig: ToastConfig = {
    success: ({ text1, text2 }) => <CustomToast text1={text1} text2={text2} type="success" />,
    error: ({ text1, text2 }) => <CustomToast text1={text1} text2={text2} type="error" />,
};

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        paddingHorizontal: spacing.md,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 40,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        paddingVertical: 12,
        paddingHorizontal: spacing.md,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
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
        color: colors.text,
        fontWeight: '400',
    },
    subText: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: '400',
        marginTop: 2,
    },
    errorTextIcon: {
        color: colors.red[900],
        fontWeight: '400',
    },
    closeButton: {
        marginLeft: 8,
        padding: 4,
    },
    closeText: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '400',
    },
});
