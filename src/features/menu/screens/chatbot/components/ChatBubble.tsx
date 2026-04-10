/**
 * @file ChatBubble.tsx
 * @description Render từng tin nhắn chat (user bubble bên phải, bot bubble bên trái)
 * với hỗ trợ widget (PondStatus, DeviceControl) và quick replies.
 */
import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import ChatBotIcon from '@/assets/Icon/IconMenu/ChatBotIcon.svg';

import {
    IChatMessage,
    PondStatusData,
    DeviceControlData,
} from '@/features/menu/screens/chatbot/types';
import { BOT_USER } from '@/features/menu/screens/chatbot/constants';
import { PondStatusWidget } from '@/features/menu/screens/chatbot/widgets/PondStatusWidget';
import { DeviceControlWidget } from '@/features/menu/screens/chatbot/widgets/DeviceControlWidget';

interface ChatBubbleProps {
    message: IChatMessage;
    onQuickReply?: (value: string) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = React.memo(({ message, onQuickReply }) => {
    const theme = useAppTheme();
    const styles = useBubbleStyles(theme);
    const isBot = message.user._id === BOT_USER._id;

    // ── Widget rendering ────────────────────────────────────────────────
    const renderWidget = () => {
        if (!message.widget) return null;

        switch (message.widget.type) {
            case 'POND_STATUS':
                return <PondStatusWidget data={message.widget.data as PondStatusData} />;
            case 'DEVICE_CONTROL':
                return <DeviceControlWidget data={message.widget.data as DeviceControlData} />;
            default:
                return null;
        }
    };

    // ── Quick Replies ───────────────────────────────────────────────────
    const renderQuickReplies = () => {
        if (!message.quickReplies?.values || !onQuickReply) return null;

        return (
            <View style={styles.quickRepliesContainer}>
                {message.quickReplies.values.map((reply, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.quickReplyChip}
                        onPress={() => onQuickReply(reply.value)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.quickReplyText}>{reply.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    if (isBot) {
        return (
            <View style={styles.botRow}>
                <View style={styles.botAvatar}>
                    <ChatBotIcon width={32} height={32} />
                </View>
                <View style={styles.botBubbleContainer}>
                    {message.text ? (
                        <View style={styles.botBubble}>
                            <Text style={styles.botText}>{message.text}</Text>
                        </View>
                    ) : null}
                    {renderWidget()}
                    {renderQuickReplies()}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.userRow}>
            <View style={styles.userBubble}>
                <Text style={styles.userText}>{message.text}</Text>
            </View>
        </View>
    );
});

const useBubbleStyles = (theme: any) =>
    useMemo(
        () =>
            StyleSheet.create({
                // ── Bot Message ──
                botRow: {
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    marginBottom: 4,
                    paddingHorizontal: 8,
                    paddingRight: 48,
                },
                botAvatar: {
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: theme.background,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 8,
                    flexShrink: 0,
                },
                botBubbleContainer: {
                    flex: 1,
                    alignItems: 'flex-start',
                },
                botBubble: {
                    backgroundColor: 'transparent',
                    paddingVertical: 6,
                    paddingHorizontal: 4,
                    maxWidth: '100%',
                },
                botText: {
                    fontSize: 14,
                    color: theme.text,
                    lineHeight: 20,
                },

                // ── User Message ──
                userRow: {
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    marginBottom: 4,
                    paddingHorizontal: 8,
                    paddingLeft: 48,
                },
                userBubble: {
                    backgroundColor: theme.background,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 22,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    maxWidth: '85%',
                },
                userText: {
                    fontSize: 14,
                    color: theme.text,
                    lineHeight: 20,
                },

                // ── Quick Replies ──
                quickRepliesContainer: {
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    marginTop: 8,
                    gap: 8,
                },
                quickReplyChip: {
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: theme.border,
                    backgroundColor: theme.backgroundPrimary,
                },
                quickReplyText: {
                    fontSize: 14,
                    fontWeight: '500',
                    color: theme.text,
                },
            }),
        [theme]
    );
