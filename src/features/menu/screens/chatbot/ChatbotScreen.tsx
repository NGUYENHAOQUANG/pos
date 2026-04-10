/**
 * @file ChatbotScreen.tsx
 * @description Màn hình Chatbot AI - chỉ chứa render logic và JSX
 *
 * Logic & State  → hooks/useChatbot.ts
 * Styles         → styles/chatbotStyles.ts
 * Constants      → constants.ts
 * Components     → components/
 */
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { View, Platform, TouchableOpacity, KeyboardAvoidingView } from 'react-native';

import { Text } from '@/shared/components/typography/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BotIcon from '@/assets/Icon/IconMenu/BotIcon.svg';
import ChatBotIcon from '@/assets/Icon/IconMenu/ChatBotIcon.svg';
import { GiftedChat, Bubble, MessageText, Avatar, Message } from 'react-native-gifted-chat';

// ── Local Imports ───────────────────────────────────────────────────────────────
import {
    IChatMessage,
    PondStatusData,
    DeviceControlData,
} from '@/features/menu/screens/chatbot/types';
import { PondStatusWidget } from '@/features/menu/screens/chatbot/widgets/PondStatusWidget';
import { DeviceControlWidget } from '@/features/menu/screens/chatbot/widgets/DeviceControlWidget';
import {
    ChatbotInputToolbar,
    ChatbotComposer,
    ChatbotSend,
} from '@/features/menu/screens/chatbot/components/ChatbotInput';
import { useUserProfile } from '@/features/menu/hooks/useUserProfile';

import { BOT_USER, CURRENT_USER_ID } from '@/features/menu/screens/chatbot/constants';
import { TypingIndicator } from '@/features/menu/screens/chatbot/components/TypingIndicator';
import { WelcomeContent } from '@/features/menu/screens/chatbot/components/WelcomeContent';
import { MessageTimeRow } from '@/features/menu/screens/chatbot/components/MessageTimeRow';
import { useChatbot } from '@/features/menu/screens/chatbot/hooks/useChatbot';
import { useChatbotStyles } from '@/features/menu/screens/chatbot/styles/chatbotStyles';
import { QuickReplyBottomSheet } from '@/features/menu/screens/chatbot/components/QuickReplyBottomSheet';
import { ChatHistoryBottomSheet } from '@/features/menu/screens/chatbot/components/ChatHistoryBottomSheet';
import { useAppTheme } from '@/styles/themeContext';
import { useKeyboard } from '@/shared/hooks/useKeyboard';

// ══════════════════════════════════════════════════════════════════════════════
// ██ MAIN CHATBOT SCREEN
// ══════════════════════════════════════════════════════════════════════════════

export const ChatbotScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { userData } = useUserProfile();
    const theme = useAppTheme();
    const styles = useChatbotStyles();
    const { keyboardVisible, keyboardHeight } = useKeyboard();

    const {
        messages,
        isTyping,
        swipeTranslateX,
        swipeTimeOpacity,
        chatPanResponder,
        onSend,
        handleQuickAction,
        handleNewChat,
        handleSelectSession,
        sessions,
        currentSessionId,
    } = useChatbot();

    const [showQuickSheet, setShowQuickSheet] = useState(false);
    const [showHistorySheet, setShowHistorySheet] = useState(false);
    const flatListRef = useRef<any>(null);

    // Auto-scroll when messages length changes (if isInverted=false)
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 200);
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 600);
        }
    }, [messages]);

    // ══════════════════════════════════════════════════════════════════════
    // ██ GENERATIVE UI: renderCustomView
    // ══════════════════════════════════════════════════════════════════════
    const renderCustomView = useCallback((props: any) => {
        const { currentMessage } = props;

        if (!currentMessage?.widget) {
            return null;
        }

        switch (currentMessage.widget.type) {
            case 'POND_STATUS':
                return <PondStatusWidget data={currentMessage.widget.data as PondStatusData} />;
            case 'DEVICE_CONTROL':
                return (
                    <DeviceControlWidget data={currentMessage.widget.data as DeviceControlData} />
                );
            default:
                return null;
        }
    }, []);

    // ══════════════════════════════════════════════════════════════════════
    // ██ GIFTED CHAT RENDERERS
    // ══════════════════════════════════════════════════════════════════════

    const renderBubble = useCallback(
        (props: any) => (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: theme.background,
                        borderWidth: 1,
                        borderColor: theme.border,
                        borderRadius: 22,
                        marginBottom: 2,
                    },
                    left: {
                        backgroundColor: 'transparent',
                        borderRadius: 0,
                        paddingVertical: 0,
                        paddingHorizontal: 0,
                        marginBottom: 2,
                        maxWidth: '100%',
                    },
                }}
                containerStyle={{
                    right: {},
                    left: { flex: 1 },
                }}
            />
        ),
        [theme]
    );

    const renderMessageText = useCallback(
        (props: any) => (
            <MessageText
                {...props}
                containerStyle={{
                    right: { paddingHorizontal: 4, paddingVertical: 4 },
                    left: { paddingHorizontal: 4, paddingVertical: 4 },
                }}
                textStyle={{
                    right: { color: theme.text, fontSize: 14 },
                    left: { color: theme.text, fontSize: 14 },
                }}
                linkStyle={{
                    right: { color: theme.blue[200] },
                    left: { color: theme.primary },
                }}
            />
        ),
        [theme]
    );

    const renderTime = useCallback(() => null, []);

    const renderMessage = useCallback(
        (props: any) => {
            const { currentMessage } = props;
            const time = currentMessage?.createdAt
                ? new Date(currentMessage.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                  })
                : '';

            return (
                <MessageTimeRow
                    time={time}
                    swipeTranslateX={swipeTranslateX}
                    swipeTimeOpacity={swipeTimeOpacity}
                >
                    <Message {...props} />
                </MessageTimeRow>
            );
        },
        [swipeTranslateX, swipeTimeOpacity]
    );

    const renderAvatar = useCallback(
        (props: any) => {
            if (props.currentMessage?.user._id === BOT_USER._id) {
                return (
                    <View style={styles.botAvatar}>
                        <ChatBotIcon width={32} height={32} />
                    </View>
                );
            }
            return <Avatar {...props} />;
        },
        [styles.botAvatar]
    );

    const renderInputToolbar = useCallback(
        (props: any) => <ChatbotInputToolbar {...props} setShowQuickSheet={setShowQuickSheet} />,
        [setShowQuickSheet]
    );

    const renderComposer = useCallback((props: any) => <ChatbotComposer {...props} />, []);

    const renderSend = useCallback((props: any) => <ChatbotSend {...props} />, []);

    const renderFooter = useCallback(() => {
        if (isTyping) {
            return <TypingIndicator />;
        }
        return null;
    }, [isTyping]);

    const renderChatEmpty = useCallback(
        () => (
            <View style={{ transform: [{ scaleY: -1 }] }}>
                <WelcomeContent userName={userData.name} onSuggestionPress={handleQuickAction} />
            </View>
        ),
        [userData.name, handleQuickAction]
    );

    // ══════════════════════════════════════════════════════════════════════
    // ██ RENDER
    // ══════════════════════════════════════════════════════════════════════

    const Wrapper = Platform.OS === 'ios' ? KeyboardAvoidingView : View;

    return (
        <Wrapper
            style={[
                styles.container,
                {
                    paddingTop: insets.top,
                    paddingBottom:
                        Platform.OS === 'android' && keyboardVisible
                            ? keyboardHeight
                            : insets.bottom,
                },
            ]}
            {...(Platform.OS === 'ios' ? { behavior: 'padding' as const } : {})}
        >
            {/* ── Header ────────────────────────────────────────────────── */}
            <HeaderSection
                includeSafeArea={false}
                titleAlign="left"
                containerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 }}
                centerComponent={
                    <View style={styles.headerCenter}>
                        <View style={styles.headerAvatarContainer}>
                            <View style={styles.headerAvatar}>
                                <BotIcon width={36} height={36} />
                            </View>
                            <View style={styles.onlineIndicator} />
                        </View>
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.headerTitle}>Mebieco AI</Text>
                            <Text style={styles.headerSubtitle}>Trợ lý ảo • Thử nghiệm</Text>
                        </View>
                    </View>
                }
                rightComponent={
                    <View style={styles.headerRight}>
                        <View style={styles.betaBadge}>
                            <Text style={styles.betaText}>BETA</Text>
                        </View>

                        {/* Nút Tạo đoạn chat mới (Clear history tạm thời) */}
                        <TouchableOpacity
                            style={styles.historyButton}
                            onPress={handleNewChat}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            <Ionicons name="refresh" size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* ── Chat area ──────────────────────────────────────────────── */}
            <View style={styles.chatContainer} {...chatPanResponder.panHandlers}>
                <GiftedChat
                    messages={[...messages].reverse()}
                    onSend={newMessages => onSend(newMessages as IChatMessage[])}
                    user={{ _id: CURRENT_USER_ID }}
                    isInverted={false}
                    // @ts-ignore
                    listViewProps={{
                        ref: (ref: any) => {
                            flatListRef.current = ref;
                        },
                    }}
                    renderCustomView={renderCustomView}
                    renderDay={() => null}
                    renderChatEmpty={renderChatEmpty}
                    renderBubble={renderBubble}
                    renderMessageText={renderMessageText}
                    renderTime={renderTime}
                    renderMessage={renderMessage}
                    renderAvatar={renderAvatar}
                    renderInputToolbar={renderInputToolbar}
                    renderComposer={renderComposer}
                    renderSend={renderSend}
                    renderFooter={renderFooter}
                    quickReplyStyle={styles.quickReplyStyle}
                    quickReplyTextStyle={styles.quickReplyTextStyle}
                    onQuickReply={replies => {
                        const reply = replies[0];
                        if (reply) {
                            handleQuickAction(reply.value);
                        }
                    }}
                    isSendButtonAlwaysVisible
                />
            </View>

            {/* Quick Reply Bottom Sheet */}
            <QuickReplyBottomSheet
                visible={showQuickSheet}
                onClose={() => setShowQuickSheet(false)}
                onSelect={handleQuickAction}
            />

            {/* Chat History Bottom Sheet */}
            <ChatHistoryBottomSheet
                visible={showHistorySheet}
                onClose={() => setShowHistorySheet(false)}
                sessions={sessions}
                currentSessionId={currentSessionId}
                // Add typing hint so that typescript knows 'id' is a string
                onSelectSession={(id: string) => {
                    handleSelectSession(id);
                    setShowHistorySheet(false);
                }}
                onNewChat={() => {
                    handleNewChat();
                    setShowHistorySheet(false);
                }}
            />
        </Wrapper>
    );
};
