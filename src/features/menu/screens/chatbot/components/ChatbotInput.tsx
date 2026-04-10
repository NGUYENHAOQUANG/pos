import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { InputToolbar, Composer, InputToolbarProps } from 'react-native-gifted-chat';
import { useAppTheme } from '@/styles/themeContext';
import { useChatbotStyles } from '@/features/menu/screens/chatbot/styles/chatbotStyles';

import { useKeyboard } from '@/shared/hooks/useKeyboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomInputProps extends InputToolbarProps<any> {
    setShowQuickSheet: (show: boolean) => void;
}

export const ChatbotInputToolbar = (props: CustomInputProps) => {
    const { setShowQuickSheet, ...giftedChatProps } = props;
    const theme = useAppTheme();
    const styles = useChatbotStyles();
    const { keyboardVisible } = useKeyboard();
    const insets = useSafeAreaInsets();

    const paddingBottom = keyboardVisible ? 12 : Math.max(16, insets.bottom + 4);

    return (
        <View style={[styles.inputToolbar, { paddingBottom }]}>
            <TouchableOpacity
                style={styles.quickSheetButton}
                onPress={() => setShowQuickSheet(true)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <Ionicons name="options-outline" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
            <View style={styles.inputPillContainer}>
                <InputToolbar
                    {...giftedChatProps}
                    containerStyle={styles.inputToolbarInner}
                    primaryStyle={styles.inputPrimary}
                />
            </View>
        </View>
    );
};

export const ChatbotComposer = (props: any) => {
    const theme = useAppTheme();
    const styles = useChatbotStyles();

    return (
        <Composer
            {...props}
            textInputStyle={styles.composerInput}
            placeholder="Hỏi Mebieco AI..."
            placeholderTextColor={theme.textSecondary}
            multiline={true}
        />
    );
};

export const ChatbotSend = (props: any) => {
    const theme = useAppTheme();
    const styles = useChatbotStyles();
    const hasText = props.text && props.text.trim().length > 0;

    return (
        <TouchableOpacity
            style={styles.sendContainer}
            onPress={() => {
                if (hasText && props.onSend) {
                    props.onSend({ text: props.text.trim() }, true);
                }
            }}
            disabled={!hasText}
            activeOpacity={0.7}
        >
            <View style={[styles.sendButton, !hasText && styles.sendButtonDisabled]}>
                <Ionicons
                    name="send"
                    size={16}
                    color={hasText ? theme.textInverse : theme.textSecondary}
                    style={{ marginLeft: 2 }}
                />
            </View>
        </TouchableOpacity>
    );
};
