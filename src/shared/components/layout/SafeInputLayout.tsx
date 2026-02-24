import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface SafeInputLayoutProps {
    children: React.ReactNode;
    style?: ViewStyle;
    contentContainerStyle?: ViewStyle;
    extraScrollHeight?: number;
}

/**
 * A wrapper component that uses react-native-keyboard-aware-scroll-view
 * Configurations are set specifically to work correctly on both iOS and Android.
 */
export const SafeInputLayout: React.FC<SafeInputLayoutProps> = ({
    children,
    style,
    contentContainerStyle,
    extraScrollHeight = 20,
}) => {
    return (
        <KeyboardAwareScrollView
            style={[styles.container, style]}
            contentContainerStyle={contentContainerStyle}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            extraScrollHeight={extraScrollHeight}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardOpeningTime={0}
        >
            {children}
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
