import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors } from '@/styles/colors';
import { ChatbotAvatar } from '@/features/menu/screens/chatbot/animation/ChatbotAvatar';

import {
    IChatMessage,
    PondStatusData,
    DeviceControlData,
} from '@/features/menu/screens/chatbot/types';
import { BOT_USER } from '@/features/menu/screens/chatbot/constants';
import { PondStatusWidget } from '@/features/menu/screens/chatbot/widgets/PondStatusWidget';
import { DeviceControlWidget } from '@/features/menu/screens/chatbot/widgets/DeviceControlWidget';

// ── Streaming text hook — syncs with screen refresh for buttery smooth typing ──
const useStreamingText = (fullText: string, shouldStream: boolean) => {
    const [displayed, setDisplayed] = useState(shouldStream ? '' : fullText);
    const indexRef = useRef(0);
    const rafRef = useRef<number>(0);
    const lastTimeRef = useRef(0);

    useEffect(() => {
        if (!shouldStream || !fullText) {
            setDisplayed(fullText);
            return;
        }

        indexRef.current = 0;
        setDisplayed('');

        // Advance ~4 chars every 50ms — fewer re-renders, still natural speed
        const CHARS_PER_TICK = 4;
        const TICK_INTERVAL = 50; // ms between advances

        const tick = (time: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = time;
            const delta = time - lastTimeRef.current;

            if (delta >= TICK_INTERVAL) {
                lastTimeRef.current = time;
                indexRef.current = Math.min(indexRef.current + CHARS_PER_TICK, fullText.length);
                setDisplayed(fullText.slice(0, indexRef.current));
            }

            if (indexRef.current < fullText.length) {
                rafRef.current = requestAnimationFrame(tick);
            }
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            lastTimeRef.current = 0;
        };
    }, [fullText, shouldStream]);

    return displayed;
};

interface ChatBubbleProps {
    message: IChatMessage;
    onQuickReply?: (value: string) => void;
}

const formatTime = (date?: string | number | Date) => {
    if (!date) return '';
    try {
        const d = new Date(date);
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const day = d.getDay();
        const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return `${hours}:${minutes} ${days[day]}`;
    } catch {
        return '';
    }
};

export const ChatBubble: React.FC<ChatBubbleProps> = React.memo(({ message, onQuickReply }) => {
    const styles = useBubbleStyles();
    const isBot = message.user._id === BOT_USER._id;
    const fullText = message.text || '';

    // Only stream NEW bot messages (created within last 2s)
    const shouldStream = useMemo(() => {
        if (!isBot) return false;
        const msgTime = message.createdAt ? new Date(message.createdAt).getTime() : 0;
        return Date.now() - msgTime < 2000;
    }, [message.createdAt, isBot]);

    // Streaming text — synced to requestAnimationFrame
    const displayedText = useStreamingText(fullText, shouldStream);

    // ── Widget rendering ────────────────────────────────────────────────
    const renderWidget = useCallback(() => {
        if (!message.widget) return null;

        switch (message.widget.type) {
            case 'POND_STATUS':
                return <PondStatusWidget data={message.widget.data as PondStatusData} />;
            case 'DEVICE_CONTROL':
                return <DeviceControlWidget data={message.widget.data as DeviceControlData} />;
            default:
                return null;
        }
    }, [message.widget]);

    // ── Quick Replies ───────────────────────────────────────────────────
    const renderQuickReplies = useCallback(() => {
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
    }, [message.quickReplies, onQuickReply, styles]);

    if (isBot) {
        const textToShow = isBot ? displayedText : fullText;
        return (
            <View style={styles.botRow}>
                <View style={styles.botAvatar}>
                    <ChatbotAvatar size={40} />
                </View>
                <View style={styles.botBubbleContainer}>
                    <Text style={styles.senderNameBot}>Mebieco AI</Text>
                    {textToShow ? (
                        <View style={styles.botBubble}>
                            <Text style={styles.botText}>{textToShow}</Text>
                        </View>
                    ) : null}
                    <Text style={styles.timestampBot}>{formatTime(message.createdAt)}</Text>
                    {renderWidget()}
                    {renderQuickReplies()}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.userRow}>
            <View style={styles.userColumn}>
                <Text style={styles.senderNameUser}>Bạn</Text>
                <View style={styles.userBubble}>
                    <Text style={styles.userText}>{message.text}</Text>
                </View>
                <Text style={styles.timestampUser}>{formatTime(message.createdAt)}</Text>
            </View>
        </View>
    );
});

const useBubbleStyles = () =>
    useMemo(
        () =>
            StyleSheet.create({
                // ── Bot Message ──
                botRow: {
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: 16,
                    paddingHorizontal: 16,
                    paddingRight: 48,
                },
                botAvatar: {
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 8,
                    marginTop: 0,
                    flexShrink: 0,
                },
                botBubbleContainer: {
                    flex: 1,
                    alignItems: 'flex-start',
                },
                senderNameBot: {
                    fontSize: 14,
                    color: colors.text,
                    fontWeight: '500',
                    marginBottom: 6,
                },
                botBubble: {
                    backgroundColor: colors.chatbot.glassBg,
                    borderWidth: 1,
                    borderColor: colors.chatbot.glassBorder,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 16,
                    borderBottomRightRadius: 16,
                    borderBottomLeftRadius: 16,
                    maxWidth: '100%',
                },
                botText: {
                    fontSize: 15,
                    color: colors.text,
                    lineHeight: 22,
                },
                timestampBot: {
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 6,
                },

                // ── User Message ──
                userRow: {
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    marginBottom: 16,
                    paddingHorizontal: 16,
                    paddingLeft: 48,
                },
                userColumn: {
                    alignItems: 'flex-end',
                    maxWidth: '85%',
                },
                senderNameUser: {
                    fontSize: 14,
                    color: colors.text,
                    fontWeight: '500',
                    marginBottom: 6,
                },
                userBubble: {
                    backgroundColor: colors.chatbot.glassBg,
                    borderWidth: 1,
                    borderColor: colors.chatbot.glassBorder,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    borderBottomRightRadius: 4,
                    borderBottomLeftRadius: 16,
                },
                userText: {
                    fontSize: 15,
                    color: colors.text,
                    lineHeight: 22,
                },
                timestampUser: {
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 6,
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
                    borderColor: colors.chatbot.glassBorder,
                    backgroundColor: colors.chatbot.glassBg,
                },
                quickReplyText: {
                    fontSize: 14,
                    fontWeight: '500',
                    color: colors.text,
                },
                cursor: {
                    color: colors.info,
                    fontWeight: '300',
                },
            }),
        []
    );
