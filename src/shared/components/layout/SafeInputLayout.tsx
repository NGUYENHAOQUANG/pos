import React from 'react';
import { StyleSheet, ViewStyle, RefreshControlProps, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface SafeInputLayoutProps {
    children: React.ReactNode;
    style?: ViewStyle;
    contentContainerStyle?: ViewStyle;
    extraScrollHeight?: number;
    extraHeight?: number;
    bounces?: boolean;
    scrollEnabled?: boolean;
    /** Ref to access KeyboardAwareScrollView methods (e.g. scrollToPosition) */
    innerRef?: React.Ref<KeyboardAwareScrollView>;
    /** RefreshControl component for pull-to-refresh */
    refreshControl?: React.ReactElement<RefreshControlProps>;
}

/**
 * A wrapper component that uses react-native-keyboard-aware-scroll-view
 * Configurations are set specifically to work correctly on both iOS and Android.
 */
export const SafeInputLayout: React.FC<SafeInputLayoutProps> = ({
    children,
    style,
    contentContainerStyle,
    extraScrollHeight = 15,
    extraHeight = 15,
    bounces = false, // We'll override in component body if iOS
    scrollEnabled = true,
    innerRef,
    refreshControl,
}) => {
    return (
        <KeyboardAwareScrollView
            ref={innerRef}
            style={[styles.container, style]}
            contentContainerStyle={contentContainerStyle}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            bounces={Platform.OS === 'ios' ? true : bounces}
            scrollEnabled={scrollEnabled}
            extraHeight={extraHeight}
            extraScrollHeight={extraScrollHeight}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableResetScrollToCoords={false}
            refreshControl={refreshControl}
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
