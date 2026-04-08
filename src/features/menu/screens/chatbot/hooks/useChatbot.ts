/**
 * @file useChatbot.ts
 * @description Hook quản lý toàn bộ state và logic cho ChatbotScreen
 */
import { useState, useCallback, useRef } from 'react';
import { Animated, PanResponder } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';

import { IChatMessage } from '../types';
import { sendMessageToAI } from '../services/chatbotApi';
import { BOT_USER, CURRENT_USER_ID } from '../constants';

import { ChatSession } from '../components/ChatHistoryBottomSheet';

// Mock data cho lịch sử chat
const MOCK_SESSIONS: ChatSession[] = [
    { id: '1', title: 'Tình trạng ao nuôi tuần này thế nào?', date: 'Hôm nay' },
    { id: '2', title: 'Bật quạt nước ao 1', date: 'Hôm qua' },
    { id: '3', title: 'Báo cáo chất lượng nước tháng 3', date: '01/04/2026' },
    { id: '4', title: 'Xin chào', date: '28/03/2026' },
];

export const useChatbot = () => {
    // ─── State ──────────────────────────────────────────────────────────────
    const [messages, setMessages] = useState<IChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    // History
    const [sessions] = useState<ChatSession[]>(MOCK_SESSIONS);
    const [currentSessionId, setCurrentSessionId] = useState<string | undefined>('1');

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

    // ─── Xử lý phản hồi từ AI ──────────────────────────────────────────────
    const processAIResponse = useCallback(async (userText: string) => {
        setIsTyping(true);

        try {
            const aiResponse = await sendMessageToAI(userText);

            const botMessage: IChatMessage = {
                _id: `bot-${Date.now()}`,
                text: aiResponse.text,
                createdAt: new Date(),
                user: BOT_USER,
                ...(aiResponse.widget && { widget: aiResponse.widget }),
            };

            setMessages(prev => GiftedChat.append(prev, [botMessage]));
        } catch (_error) {
            const errorMessage: IChatMessage = {
                _id: `error-${Date.now()}`,
                text: '❌ Đã xảy ra lỗi khi xử lý. Vui lòng thử lại sau.',
                createdAt: new Date(),
                user: BOT_USER,
            };
            setMessages(prev => GiftedChat.append(prev, [errorMessage]));
        } finally {
            setIsTyping(false);
        }
    }, []);

    // ─── Xử lý gửi tin nhắn ────────────────────────────────────────────────
    const onSend = useCallback(
        (newMessages: IChatMessage[] = []) => {
            setMessages(prev => GiftedChat.append(prev, newMessages));

            if (newMessages.length > 0) {
                processAIResponse(newMessages[0].text);
            }
        },
        [processAIResponse]
    );

    // ─── Xử lý Quick Reply / Suggestion ────────────────────────────────────
    const handleQuickAction = useCallback(
        (text: string) => {
            const userMessage: IChatMessage = {
                _id: `user-${Date.now()}`,
                text,
                createdAt: new Date(),
                user: { _id: CURRENT_USER_ID },
            };
            onSend([userMessage]);
        },
        [onSend]
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
