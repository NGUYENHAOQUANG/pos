/**
 * @file ChatbotInput.tsx
 */
import React, { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '@/styles/themeContext';
import { useChatbotStyles } from '@/features/menu/screens/chatbot/styles/chatbotStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChatbotInputToolbarProps {
    onSend: (text: string) => void;
    setShowQuickSheet: (show: boolean) => void;
}

export const ChatbotInputToolbar: React.FC<ChatbotInputToolbarProps> = ({
    onSend,
    setShowQuickSheet,
}) => {
    const theme = useAppTheme();
    const styles = useChatbotStyles();
    const insets = useSafeAreaInsets();

    const [text, setText] = useState('');

    const handleSend = useCallback(() => {
        if (text.trim().length > 0) {
            onSend(text.trim());
            setText('');
        }
    }, [text, onSend]);

    const paddingBottom = Math.max(16, insets.bottom + 4);
    const hasText = text.trim().length > 0;

    return (
        <View style={[styles.inputToolbar, { paddingBottom }]}>
            {/* Quick Sheet Button */}
            <TouchableOpacity
                style={styles.quickSheetButton}
                onPress={() => setShowQuickSheet(true)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <Ionicons name="options-outline" size={22} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* Input Pill */}
            <View style={styles.inputPrimary}>
                <TextInput
                    style={styles.composerInput}
                    value={text}
                    onChangeText={setText}
                    placeholder="Hỏi Mebieco AI..."
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    returnKeyType="default"
                    blurOnSubmit={false}
                />

                {/* Send Button (inside pill) */}
                <TouchableOpacity
                    style={styles.sendContainer}
                    onPress={handleSend}
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
            </View>
        </View>
    );
};
