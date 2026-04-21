/**
 * @file useChatbot.ts
 * @description Hook quản lý toàn bộ state và logic cho ChatbotScreen
 *
 * Không còn phụ thuộc GiftedChat — tự quản lý messages array.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animated, PanResponder } from 'react-native';

import { IChatMessage } from '@/features/menu/types/chatbot.types';
import { sendMessageToAI } from '@/features/menu/services/chatbotApi';
import { BOT_USER, CURRENT_USER_ID } from '@/features/menu/constants/chatbot.constants';

import { ChatSession } from '@/features/menu/components/chatbot/ChatHistoryBottomSheet';

// ─── Constants ──────────────────────────────────────────────────────────────

export const useChatbot = () => {
    // ─── State ──────────────────────────────────────────────────────────────
    const [messages, setMessages] = useState<IChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const CHAT_HISTORY_KEY = '@chatbot_messages_history';

    // ─── Lấy lịch sử Local Storage khi khởi tạo ───────────────────────────────
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const storedText = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
                if (storedText) {
                    const parsedMessages = JSON.parse(storedText);
                    // Restore Date objects for 'createdAt'
                    const restoredMessages = parsedMessages.map((msg: any) => ({
                        ...msg,
                        createdAt: new Date(msg.createdAt),
                    }));
                    setMessages(restoredMessages);
                }
            } catch (e) {
                console.error('Error loading chat history:', e);
            }
        };
        loadHistory();
    }, []);

    // ─── Lưu lịch sử vào Local Storage mỗi khi có message mới ───────────────
    useEffect(() => {
        const saveHistory = async () => {
            try {
                if (messages.length > 0) {
                    await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
                } else {
                    // Nếu rỗng thì có thể xóa hoặc gán mảng rỗng
                    await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
                }
            } catch (e) {
                console.error('Error saving chat history:', e);
            }
        };
        saveHistory();
    }, [messages]);

    // History
    const [sessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();

    // ─── Shared swipe state (Instagram-style global time reveal) ────────
    const swipeTranslateX = useRef(new Animated.Value(0)).current;
    const swipeTimeOpacity = useRef(new Animated.Value(0)).current;

    const chatPanResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gs) => {
                return gs.dx < -8 && Math.abs(gs.dx) > Math.abs(gs.dy) * 2;
            },
            onPanResponderMove: (_, gs) => {
                if (gs.dx < 0) {
                    const clampedX = Math.max(-60, gs.dx);
                    swipeTranslateX.setValue(clampedX);
                    const opacity = Math.min(1, Math.abs(clampedX) / 30);
                    swipeTimeOpacity.setValue(opacity);
                }
            },
            onPanResponderRelease: () => {
                Animated.parallel([
                    Animated.spring(swipeTranslateX, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 40,
                        friction: 8,
                    }),
                    Animated.timing(swipeTimeOpacity, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]).start();
            },
        })
    ).current;

    // ─── Append message helper (thay thế GiftedChat.append) ─────────────────
    const appendMessages = useCallback((newMessages: IChatMessage[]) => {
        setMessages(prev => [...prev, ...newMessages]);
    }, []);

    // ─── Xử lý phản hồi từ AI ──────────────────────────────────────────────
    const processAIResponse = useCallback(
        async (userText: string) => {
            setIsTyping(true);

            try {
                const aiResponse = await sendMessageToAI(userText);

                const botMessage: IChatMessage = {
                    _id: `bot-${Date.now()}`,
                    text: aiResponse.text,
                    createdAt: new Date(),
                    user: BOT_USER,
                    ...(aiResponse.widget && { widget: aiResponse.widget }),
                    ...(aiResponse.quickReplies && { quickReplies: aiResponse.quickReplies }),
                };

                appendMessages([botMessage]);
            } catch (_error) {
                const errorMessage: IChatMessage = {
                    _id: `error-${Date.now()}`,
                    text: 'Đã xảy ra lỗi khi xử lý. Vui lòng thử lại sau.',
                    createdAt: new Date(),
                    user: BOT_USER,
                };
                appendMessages([errorMessage]);
            } finally {
                setIsTyping(false);
            }
        },
        [appendMessages]
    );

    // ─── Xử lý gửi tin nhắn ────────────────────────────────────────────────
    const onSend = useCallback(
        (text: string) => {
            if (!text.trim()) return;

            const userMessage: IChatMessage = {
                _id: `user-${Date.now()}`,
                text: text.trim(),
                createdAt: new Date(),
                user: { _id: CURRENT_USER_ID },
            };

            appendMessages([userMessage]);
            processAIResponse(text.trim());
        },
        [appendMessages, processAIResponse]
    );

    // ─── Xử lý Quick Reply / Suggestion ────────────────────────────────────
    // Strip prefix markers ([Trại], [Loại ao], [Ao]) for clean display
    const cleanDisplayText = (raw: string): string => raw.replace(/^\[(Trại|Loại ao|Ao)\]\s*/i, '');

    const handleQuickAction = useCallback(
        (text: string) => {
            const displayText = cleanDisplayText(text);

            // Hiển thị tin nhắn sạch (không prefix) cho user
            const userMessage: IChatMessage = {
                _id: `user-${Date.now()}`,
                text: displayText,
                createdAt: new Date(),
                user: { _id: CURRENT_USER_ID },
            };
            appendMessages([userMessage]);

            // Gửi giá trị đầy đủ (có prefix) cho AI xử lý intent
            processAIResponse(text);
        },
        [appendMessages, processAIResponse]
    );

    // ─── Xử lý Chat History ────────────────────────────────────────────────
    const handleNewChat = useCallback(() => {
        setMessages([]); // Clear màn hình
        setCurrentSessionId(undefined); // Bỏ chọn session
    }, []);

    const handleSelectSession = useCallback((sessionId: string) => {
        setCurrentSessionId(sessionId);
        // FIXME: Ở thực tế sẽ gọi API tải nội dung chat
        // Tạm thời clear giả lập load session mới
        setMessages([]);
    }, []);

    return {
        // State
        messages,
        isTyping,

        // Swipe
        swipeTranslateX,
        swipeTimeOpacity,
        chatPanResponder,

        // Actions
        onSend,
        handleQuickAction,
        handleNewChat,
        handleSelectSession,

        // Data
        sessions,
        currentSessionId,
    };
};
