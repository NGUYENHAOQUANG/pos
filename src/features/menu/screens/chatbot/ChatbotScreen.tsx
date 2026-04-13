/**
 * @file ChatbotScreen.tsx
 */
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { View, Platform, TouchableOpacity, FlatList } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { Text } from '@/shared/components/typography/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BotIcon from '@/assets/Icon/IconMenu/BotIcon.svg';

import { IChatMessage } from '@/features/menu/screens/chatbot/types';
import { ChatBubble } from '@/features/menu/screens/chatbot/components/ChatBubble';
import { ChatbotInputToolbar } from '@/features/menu/screens/chatbot/components/ChatbotInput';
import { useUserProfile } from '@/features/menu/hooks/useUserProfile';
import { MessageTimeRow } from '@/features/menu/screens/chatbot/components/MessageTimeRow';
import { TypingIndicator } from '@/features/menu/screens/chatbot/components/TypingIndicator';
import { WelcomeContent } from '@/features/menu/screens/chatbot/components/WelcomeContent';
import { useChatbot } from '@/features/menu/screens/chatbot/hooks/useChatbot';
import { useChatbotStyles } from '@/features/menu/screens/chatbot/styles/chatbotStyles';
import { QuickReplyBottomSheet } from '@/features/menu/screens/chatbot/components/QuickReplyBottomSheet';
import { ChatHistoryBottomSheet } from '@/features/menu/screens/chatbot/components/ChatHistoryBottomSheet';
import { useAppTheme } from '@/styles/themeContext';

export const ChatbotScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { userData } = useUserProfile();
    const theme = useAppTheme();
    const styles = useChatbotStyles();

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
    const flatListRef = useRef<FlatList<IChatMessage>>(null);

    // Auto-scroll to newest message
    useEffect(() => {
        if (messages.length > 0) {
            const timer = setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [messages.length]);

    useEffect(() => {
        if (isTyping) {
            const timer = setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isTyping]);

    const renderItem = useCallback(
        ({ item }: { item: IChatMessage }) => {
            const time = item.createdAt
                ? new Date(item.createdAt).toLocaleTimeString('vi-VN', {
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
                    <ChatBubble message={item} onQuickReply={handleQuickAction} />
                </MessageTimeRow>
            );
        },
        [swipeTranslateX, swipeTimeOpacity, handleQuickAction]
    );

    const keyExtractor = useCallback((item: IChatMessage) => String(item._id), []);

    // Typing indicator
    const renderListFooter = useCallback(() => {
        if (!isTyping) return null;
        return <TypingIndicator />;
    }, [isTyping]);

    // Welcome content no message
    const renderEmptyComponent = useCallback(
        () => <WelcomeContent userName={userData.name} onSuggestionPress={handleQuickAction} />,
        [userData.name, handleQuickAction]
    );

    return (
        <KeyboardAvoidingView
            style={[
                styles.container,
                {
                    paddingTop: insets.top,
                },
            ]}
            behavior="padding"
            keyboardVerticalOffset={-(Math.max(16, insets.bottom + 4) - 12)}
        >
            {/* Header */}
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

            {/* Chat area — FlatList top-to-bottom */}
            <View style={styles.chatContainer} {...chatPanResponder.panHandlers}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    removeClippedSubviews={Platform.OS === 'android'}
                    maxToRenderPerBatch={15}
                    windowSize={10}
                    initialNumToRender={20}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={
                        messages.length === 0 ? { flexGrow: 1 } : { paddingVertical: 8 }
                    }
                    ListFooterComponent={renderListFooter}
                    ListEmptyComponent={renderEmptyComponent}
                />
            </View>

            {/* Input Toolbar */}
            <ChatbotInputToolbar onSend={onSend} setShowQuickSheet={setShowQuickSheet} />

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
                onSelectSession={(id: string) => {
                    handleSelectSession(id);
                    setShowHistorySheet(false);
                }}
                onNewChat={() => {
                    handleNewChat();
                    setShowHistorySheet(false);
                }}
            />
        </KeyboardAvoidingView>
    );
};
