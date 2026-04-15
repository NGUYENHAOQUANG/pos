/**
 * @file ChatbotScreen.tsx
 */
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { View, Platform, FlatList } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IChatMessage } from '@/features/menu/screens/chatbot/types';
import { ChatBubble } from '@/features/menu/screens/chatbot/components/ChatBubble';
import { ChatbotInputToolbar } from '@/features/menu/screens/chatbot/components/ChatbotInput';
import { useUserProfile } from '@/features/menu/hooks/useUserProfile';
import { MessageTimeRow } from '@/features/menu/screens/chatbot/components/MessageTimeRow';
import { TypingIndicator } from '@/features/menu/screens/chatbot/components/TypingIndicator';
import { WelcomeContent } from '@/features/menu/screens/chatbot/components/WelcomeContent';
import { useChatbot } from '@/features/menu/screens/chatbot/hooks/useChatbot';
import { useChatbotStyles } from '@/features/menu/screens/chatbot/styles/chatbotStyles';

import { ChatHistoryBottomSheet } from '@/features/menu/screens/chatbot/components/ChatHistoryBottomSheet';
import { ChatbotShaderBackground } from '@/features/menu/screens/chatbot/animation/ChatbotShaderBackground';
import { ChatbotHeader } from '@/features/menu/screens/chatbot/components/ChatbotHeader';

export const ChatbotScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { userData } = useUserProfile();
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

    const [showHistorySheet, setShowHistorySheet] = useState(false);
    const [resetKey, setResetKey] = useState(0);
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
    // Wrap handleNewChat to also bump resetKey → force WelcomeContent remount
    const handleNewChatWithReset = useCallback(() => {
        handleNewChat();
        setResetKey(prev => prev + 1);
    }, [handleNewChat]);

    const renderEmptyComponent = useCallback(
        () => (
            <WelcomeContent
                key={resetKey}
                userName={userData.name}
                onSuggestionPress={handleQuickAction}
            />
        ),
        [userData.name, handleQuickAction, resetKey]
    );

    return (
        <View style={styles.container}>
            <ChatbotShaderBackground />
            <KeyboardAvoidingView
                style={[
                    {
                        flex: 1,
                        paddingTop: insets.top,
                    },
                ]}
                behavior="padding"
            >
                {/* Header */}
                <ChatbotHeader onNewChat={handleNewChatWithReset} />

                {/* Chat area — FlatList top-to-bottom */}
                <View style={styles.chatContainer} {...chatPanResponder.panHandlers}>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        removeClippedSubviews={Platform.OS === 'android'}
                        maxToRenderPerBatch={8}
                        windowSize={5}
                        initialNumToRender={10}
                        updateCellsBatchingPeriod={100}
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

                {/* Input Toolbar with inline chips fully managing the flow */}
                <ChatbotInputToolbar
                    onSend={onSend}
                    onQuickAction={handleQuickAction}
                    resetKey={resetKey}
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
                        handleNewChatWithReset();
                        setShowHistorySheet(false);
                    }}
                />
            </KeyboardAvoidingView>
        </View>
    );
};
