import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { ToastConfig } from 'react-native-toast-message';
import { borderRadius, colors } from '@/styles';
import CheckCircleIcon from '@/assets/Icon/CheckCircleFilled.svg';

// We can use a custom view or customize BaseToast.
// Since the design is simple (Icon + Text), let's make a Custom View for full control.

export const toastConfig: ToastConfig = {
    success: ({ text1 }) => (
        <View style={styles.successContainer}>
            <View style={styles.iconWrapper}>
                <CheckCircleIcon width={20} height={20} />
            </View>
            <Text style={styles.text} numberOfLines={1}>
                {text1}
            </Text>
        </View>
    ),
    error: ({ text1 }) => (
        <View style={[styles.successContainer, styles.errorContainer]}>
            {/* Fallback to text for Error or use another SVG */}
            <View style={[styles.iconWrapper]}>
                <Text style={styles.errorTextIcon}>!</Text>
            </View>
            <Text style={styles.text}>{text1}</Text>
        </View>
    ),
};

const styles = StyleSheet.create({
    successContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 'auto',
        maxWidth: '80%',
        height: 40,
        backgroundColor: 'white',
        borderRadius: borderRadius.sm,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 16,
        marginTop: Platform.OS === 'android' ? 26 : 0,
        alignSelf: 'flex-end',
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        borderLeftWidth: 0,
    },
    errorContainer: {
        // Optional diff style
    },
    iconWrapper: {
        marginRight: 8,
    },
    errorIcon: {
        // backgroundColor: colors.red[500],
    },
    text: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
    errorTextIcon: {
        color: colors.red[900],
        fontWeight: 'bold',
    },
});
