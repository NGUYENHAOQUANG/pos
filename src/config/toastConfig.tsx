import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ToastConfig } from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors } from '@/styles';
import CheckCircleIcon from '@/assets/Icon/CheckCircleFilled.svg';

// Custom Toast Component to handle dynamic safe area positioning
// This ensures the toast is always centered vertically relative to the HeaderSection content
const CustomToast = ({ text1, type }: { text1?: string; type: 'success' | 'error' }) => {
    // HeaderSection uses padding: insets.top + 12
    // We want the toast top to align effectively with the header content top.

    // Logic:
    // We have set <Toast topOffset={0} /> in App.tsx to remove the default library offset (40px).
    // Now we have full control. We can exactly match the HeaderSection's padding logic.
    // HeaderSection content starts at: insets.top + 12.
    // So we set marginTop to exactly insets.top + 12 to top-align (and thus center-align since heights match).
    const insets = useSafeAreaInsets();
    const topMargin = insets.top + 12;

    return (
        <View style={[styles.container, { marginTop: topMargin }]}>
            <View style={styles.iconWrapper}>
                {type === 'success' ? (
                    <CheckCircleIcon width={20} height={20} />
                ) : (
                    <Text style={styles.errorTextIcon}>!</Text>
                )}
            </View>
            <Text style={styles.text} numberOfLines={1}>
                {text1}
            </Text>
        </View>
    );
};

export const toastConfig: ToastConfig = {
    success: ({ text1 }) => <CustomToast text1={text1} type="success" />,
    error: ({ text1 }) => <CustomToast text1={text1} type="error" />,
};

const styles = StyleSheet.create({
    container: {
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
    iconWrapper: {
        marginRight: 8,
    },
    text: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
    errorTextIcon: {
        color: colors.red[900],
        fontWeight: '400',
    },
});
