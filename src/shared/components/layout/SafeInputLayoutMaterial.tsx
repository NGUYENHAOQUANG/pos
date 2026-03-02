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
 * <SafeInputLayoutMaterial>
 *   <ScrollView>
 *      ...inputs
 *   </ScrollView>
 * </SafeInputLayoutMaterial>
 */
export const SafeInputLayoutMaterial: React.FC<SafeInputLayoutProps> = ({
    children,
    style,
    keyboardVerticalOffset = 0,
}) => {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            enabled={Platform.OS === 'ios'}
            style={[styles.container, style]}
            keyboardVerticalOffset={keyboardVerticalOffset}
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
