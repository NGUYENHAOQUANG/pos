import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, ViewStyle } from 'react-native';

interface SafeInputLayoutProps {
    children: React.ReactNode;
    style?: ViewStyle;
    keyboardVerticalOffset?: number;
}

/**
 * A wrapper component that handles keyboard avoidance on both iOS and Android.
 * Use this to wrap your ScrollView or content containing inputs.
 *
 * Usage:
 * <SafeInputLayout>
 *   <ScrollView>
 *      ...inputs
 *   </ScrollView>
 * </SafeInputLayout>
 */
export const SafeInputLayout: React.FC<SafeInputLayoutProps> = ({
    children,
    style,
    keyboardVerticalOffset = 0,
}) => {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, style]}
            keyboardVerticalOffset={keyboardVerticalOffset + (Platform.OS === 'android' ? 20 : 0)}
        >
            {children}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
