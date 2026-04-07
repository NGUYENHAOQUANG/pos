/**
 * @file ChatbotScreen.tsx
 * @description Màn hình Chatbot AI với Generative UI (Function/Tool Calling)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  KIẾN TRÚC GENERATIVE UI                                               ║
 * ║                                                                        ║
 * ║  1. User gửi tin nhắn → onSend()                                      ║
 * ║  2. Gọi sendMessageToAI() → server AI xử lý                           ║
 * ║  3. Server trả về AIResponse { text, widget? }                         ║
 * ║  4. Build IChatMessage với widget (nếu có)                             ║
 * ║  5. renderCustomView() kiểm tra widget.type → render UI component     ║
 * ║                                                                        ║
 * ║  Khi cần thêm widget mới:                                              ║
 * ║  ① Thêm type vào WidgetType trong types.ts                            ║
 * ║  ② Tạo component widget trong widgets/                                ║
 * ║  ③ Thêm case vào switch trong renderCustomView()                      ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    GiftedChat,
    Bubble,
    InputToolbar,
    Composer,
    Send,
    MessageText,
    Time,
    Avatar,
} from 'react-native-gifted-chat';

// ── Local Imports ───────────────────────────────────────────────────────────────
import { IChatMessage, PondStatusData, DeviceControlData } from './types';
import { sendMessageToAI } from './services/chatbotApi';
import { PondStatusWidget } from './widgets/PondStatusWidget';
import { DeviceControlWidget } from './widgets/DeviceControlWidget';

// ── Constants ──────────────────────────────────────────────────────────────────
const COLORS = {
    white: '#FFFFFF',
    black: '#000000',
    orange: '#FD6900',
    blue: '#006AFF',
    grayLight: '#F5F5F5',
    grayMedium: '#E0E0E0',
    grayText: '#6B7280',
    graySubtle: '#F9FAFB',
    inputBg: '#F3F4F6',
    inputBorder: '#E6E8EC',
};

/** Thông tin user của bot (dùng cho GiftedChat) */
const BOT_USER = {
    _id: 2,
    name: 'Mebieco AI',
    avatar: undefined,
};

/** ID user hiện tại */
const CURRENT_USER_ID = 1;

// ── Quick Reply Suggestions ─────────────────────────────────────────────────────
const QUICK_REPLIES = [
    { id: '1', text: '📊 Tình trạng ao nuôi' },
    { id: '2', text: '⚙️ Điều khiển quạt nước' },
    { id: '3', text: '💧 Thông số nước ao' },
    { id: '4', text: '👋 Xin chào' },
];

// ══════════════════════════════════════════════════════════════════════════════
// ██ TYPING INDICATOR COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

const TypingIndicator: React.FC = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createDotAnimation = (dot: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, {
                        toValue: 1,
                        duration: 300,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 300,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const anim1 = createDotAnimation(dot1, 0);
        const anim2 = createDotAnimation(dot2, 200);
        const anim3 = createDotAnimation(dot3, 400);
        anim1.start();
        anim2.start();
        anim3.start();

        return () => {
            anim1.stop();
            anim2.stop();
            anim3.stop();
        };
    }, [dot1, dot2, dot3]);

    const dotStyle = (animValue: Animated.Value) => ({
        transform: [
            {
                translateY: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -4],
                }),
            },
        ],
    });

    return (
        <View style={typingStyles.container}>
            <View style={typingStyles.botAvatarSmall}>
                <MaterialCommunityIcons name="robot-outline" size={14} color={COLORS.white} />
            </View>
            <View style={typingStyles.bubble}>
                <Animated.View style={[typingStyles.dot, dotStyle(dot1)]} />
                <Animated.View style={[typingStyles.dot, dotStyle(dot2)]} />
                <Animated.View style={[typingStyles.dot, dotStyle(dot3)]} />
            </View>
        </View>
    );
};

const typingStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingLeft: 8,
        paddingBottom: 4,
        gap: 8,
    },
    botAvatarSmall: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.blue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.grayLight,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.grayText,
    },
});

// ══════════════════════════════════════════════════════════════════════════════
// ██ MAIN CHATBOT SCREEN
// ══════════════════════════════════════════════════════════════════════════════

export const ChatbotScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    // ─── State Management ──────────────────────────────────────────────────
    /** Danh sách messages (sử dụng IChatMessage thay vì IMessage để hỗ trợ widget) */
    const [messages, setMessages] = useState<IChatMessage[]>([]);
    /** Trạng thái bot đang "suy nghĩ" */
    const [isTyping, setIsTyping] = useState(false);

    // ─── Khởi tạo tin nhắn chào mừng ──────────────────────────────────────
    useEffect(() => {
        const welcomeMessage: IChatMessage = {
            _id: 'welcome-1',
            text: '👋 Xin chào! Tôi là Mebieco AI Assistant.\n\nTôi có thể hỗ trợ bạn:\n• Xem thông số ao nuôi\n• Điều khiển thiết bị\n• Báo cáo tổng quan\n\nHãy thử chọn một chủ đề bên dưới!',
            createdAt: new Date(),
            user: BOT_USER,
            // Không có widget → GiftedChat render text bình thường
        };
        setMessages([welcomeMessage]);
    }, []);

    // ─── Xử lý phản hồi từ AI ─────────────────────────────────────────────
    /**
     * Gọi API AI, parse response, và build bot message.
     * Đây là nơi logic Generative UI được xử lý:
     * - Nếu response có widget → nhúng widget vào message
     * - Nếu không → message chỉ có text
     */
    const processAIResponse = useCallback(async (userText: string) => {
        // Bước 1: Hiển thị typing indicator
        setIsTyping(true);

        try {
            // Bước 2: Gọi API (mock hoặc thật)
            // ┌─────────────────────────────────────────────────────────┐
            // │ KHI TÍCH HỢP API THẬT: Chỉ cần thay đổi trong file   │
            // │ services/chatbotApi.ts, không cần sửa logic ở đây     │
            // └─────────────────────────────────────────────────────────┘
            const aiResponse = await sendMessageToAI(userText);

            // Bước 3: Build message object cho bot
            const botMessage: IChatMessage = {
                _id: `bot-${Date.now()}`,
                text: aiResponse.text,
                createdAt: new Date(),
                user: BOT_USER,
                // ★ GENERATIVE UI: Nạp widget data vào message (nếu có)
                // Khi GiftedChat render message này, renderCustomView() sẽ
                // kiểm tra trường widget và render component UI tương ứng
                ...(aiResponse.widget && { widget: aiResponse.widget }),
            };

            // Bước 4: Append bot message vào danh sách
            setMessages(prev => GiftedChat.append(prev, [botMessage]));
        } catch (_error) {
            // Xử lý lỗi: Hiển thị message lỗi cho user
            const errorMessage: IChatMessage = {
                _id: `error-${Date.now()}`,
                text: '❌ Đã xảy ra lỗi khi xử lý. Vui lòng thử lại sau.',
                createdAt: new Date(),
                user: BOT_USER,
            };
            setMessages(prev => GiftedChat.append(prev, [errorMessage]));
        } finally {
            // Bước 5: Tắt typing indicator
            setIsTyping(false);
        }
    }, []);

    // ─── Xử lý gửi tin nhắn ───────────────────────────────────────────────
    /**
     * Handler khi user gửi tin nhắn (từ input hoặc quick reply).
     * Flow: Append user message → Gọi AI → Append bot response
     */
    const onSend = useCallback(
        (newMessages: IChatMessage[] = []) => {
            // Append tin nhắn user vào state ngay lập tức (UI responsive)
            setMessages(prev => GiftedChat.append(prev, newMessages));

            // Gọi AI xử lý tin nhắn
            if (newMessages.length > 0) {
                processAIResponse(newMessages[0].text);
            }
        },
        [processAIResponse]
    );

    // ─── Xử lý Quick Reply ────────────────────────────────────────────────
    const handleQuickReply = useCallback(
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

    // ══════════════════════════════════════════════════════════════════════
    // ██ GENERATIVE UI: renderCustomView
    // ══════════════════════════════════════════════════════════════════════
    /**
     * ★ CORE FUNCTION: Render widget UI bên trong bubble chat.
     *
     * Hàm này được GiftedChat gọi cho MỖI message.
     * - Kiểm tra currentMessage có chứa widget hay không
     * - Dùng switch/case trên widget.type để render component tương ứng
     * - Return null → GiftedChat tự render text bình thường
     *
     * KHI THÊM WIDGET MỚI:
     * 1. Thêm WidgetType mới vào types.ts
     * 2. Tạo component mới trong widgets/
     * 3. Thêm case mới vào switch bên dưới
     */
    const renderCustomView = useCallback((props: any) => {
        const { currentMessage } = props;

        // Không có widget → return null để GiftedChat render text bình thường
        if (!currentMessage?.widget) {
            return null;
        }

        // Dispatch dựa trên widget type
        switch (currentMessage.widget.type) {
            case 'POND_STATUS':
                return <PondStatusWidget data={currentMessage.widget.data as PondStatusData} />;

            case 'DEVICE_CONTROL':
                return (
                    <DeviceControlWidget data={currentMessage.widget.data as DeviceControlData} />
                );

            // ┌─────────────────────────────────────────────────────────┐
            // │ THÊM WIDGET MỚI Ở ĐÂY:                                │
            // │                                                         │
            // │ case 'FEEDING_SCHEDULE':                                │
            // │     return <FeedingScheduleWidget data={...} />;        │
            // │                                                         │
            // │ case 'ALERT_CARD':                                      │
            // │     return <AlertCardWidget data={...} />;              │
            // └─────────────────────────────────────────────────────────┘

            default:
                // Widget type không được nhận diện → fallback về text
                return null;
        }
    }, []);

    // ══════════════════════════════════════════════════════════════════════
    // ██ UI RENDERING FUNCTIONS (GiftedChat customization)
    // ══════════════════════════════════════════════════════════════════════

    // ── Custom Bubble ────────────────────────────────────────────────────
    const renderBubble = useCallback((props: any) => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: COLORS.blue,
                        borderRadius: 16,
                        borderBottomRightRadius: 4,
                        paddingVertical: 2,
                        paddingHorizontal: 2,
                        marginBottom: 2,
                    },
                    left: {
                        backgroundColor: COLORS.grayLight,
                        borderRadius: 16,
                        borderBottomLeftRadius: 4,
                        paddingVertical: 2,
                        paddingHorizontal: 2,
                        marginBottom: 2,
                    },
                }}
            />
        );
    }, []);

    // ── Custom Message Text ──────────────────────────────────────────────
    const renderMessageText = useCallback((props: any) => {
        return (
            <MessageText
                {...props}
                textStyle={{
                    right: { color: COLORS.white, fontSize: 14.5, lineHeight: 21 },
                    left: { color: COLORS.black, fontSize: 14.5, lineHeight: 21 },
                }}
                linkStyle={{
                    right: { color: '#B2DDFF' },
                    left: { color: COLORS.blue },
                }}
            />
        );
    }, []);

    // ── Custom Time ──────────────────────────────────────────────────────
    const renderTime = useCallback((props: any) => {
        return (
            <Time
                {...props}
                timeTextStyle={{
                    right: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
                    left: { color: COLORS.grayText, fontSize: 11 },
                }}
            />
        );
    }, []);

    // ── Custom Avatar ────────────────────────────────────────────────────
    const renderAvatar = useCallback((props: any) => {
        if (props.currentMessage?.user._id === BOT_USER._id) {
            return (
                <View style={styles.botAvatar}>
                    <MaterialCommunityIcons name="robot-outline" size={18} color={COLORS.white} />
                </View>
            );
        }
        return <Avatar {...props} />;
    }, []);

    // ── Custom Input Toolbar ─────────────────────────────────────────────
    const renderInputToolbar = useCallback((props: any) => {
        return (
            <InputToolbar
                {...props}
                containerStyle={styles.inputToolbar}
                primaryStyle={styles.inputPrimary}
            />
        );
    }, []);

    // ── Custom Composer ──────────────────────────────────────────────────
    const renderComposer = useCallback((props: any) => {
        return (
            <Composer
                {...props}
                textInputStyle={styles.composerInput}
                placeholder="Nhập tin nhắn..."
                placeholderTextColor={COLORS.grayText}
            />
        );
    }, []);

    // ── Custom Send Button ───────────────────────────────────────────────
    const renderSend = useCallback((props: any) => {
        return (
            <Send {...props} containerStyle={styles.sendContainer}>
                <View style={styles.sendButton}>
                    <Ionicons name="send" size={18} color={COLORS.white} />
                </View>
            </Send>
        );
    }, []);

    // ── Typing Indicator Footer ─────────────────────────────────────────
    const renderFooter = useCallback(() => {
        if (isTyping) {
            return <TypingIndicator />;
        }
        return null;
    }, [isTyping]);

    // ── Quick Replies Bar ────────────────────────────────────────────────
    const renderQuickReplies = useCallback(() => {
        return (
            <View style={styles.quickRepliesContainer}>
                {QUICK_REPLIES.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.quickReplyChip}
                        onPress={() => handleQuickReply(item.text)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.quickReplyText}>{item.text}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    }, [handleQuickReply]);

    // ══════════════════════════════════════════════════════════════════════
    // ██ RENDER
    // ══════════════════════════════════════════════════════════════════════

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            {/* ── Header ────────────────────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <AntDesign name="arrowleft" size={22} color={COLORS.black} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <View style={styles.headerAvatarContainer}>
                        <View style={styles.headerAvatar}>
                            <MaterialCommunityIcons
                                name="robot-outline"
                                size={18}
                                color={COLORS.white}
                            />
                        </View>
                        <View style={styles.onlineIndicator} />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Mebieco AI</Text>
                        <Text style={styles.headerSubtitle}>Trợ lý ảo • Thử nghiệm</Text>
                    </View>
                </View>

                <View style={styles.betaBadge}>
                    <Text style={styles.betaText}>BETA</Text>
                </View>
            </View>

            {/* ── Chat Area (GiftedChat) ────────────────────────────────── */}
            <View style={styles.chatContainer}>
                <GiftedChat
                    messages={messages}
                    onSend={newMessages => onSend(newMessages as IChatMessage[])}
                    user={{ _id: CURRENT_USER_ID }}
                    // ★ GENERATIVE UI: renderCustomView là nơi widget được render
                    renderCustomView={renderCustomView}
                    // UI Customization
                    renderBubble={renderBubble}
                    renderMessageText={renderMessageText}
                    renderTime={renderTime}
                    renderAvatar={renderAvatar}
                    renderInputToolbar={renderInputToolbar}
                    renderComposer={renderComposer}
                    renderSend={renderSend}
                    renderFooter={renderFooter}
                    renderChatFooter={renderQuickReplies}
                    isSendButtonAlwaysVisible
                    scrollToBottomComponent={() => (
                        <View style={styles.scrollToBottom}>
                            <AntDesign name="down" size={16} color={COLORS.blue} />
                        </View>
                    )}
                />
            </View>
        </View>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// ██ STYLES
// ══════════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.inputBorder,
    },
    backButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginLeft: 4,
    },
    headerAvatarContainer: {
        position: 'relative',
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.blue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#34C759',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.black,
        lineHeight: 20,
    },
    headerSubtitle: {
        fontSize: 12,
        color: COLORS.grayText,
        lineHeight: 16,
    },
    betaBadge: {
        backgroundColor: COLORS.orange,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    betaText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // Chat
    chatContainer: {
        flex: 1,
        backgroundColor: COLORS.graySubtle,
    },

    // Bot Avatar
    botAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.blue,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
    },

    // Input Toolbar
    inputToolbar: {
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.inputBorder,
        paddingHorizontal: 8,
        paddingTop: 6,
        paddingBottom: 6,
    },
    inputPrimary: {
        alignItems: 'center',
    },
    composerInput: {
        backgroundColor: COLORS.inputBg,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
        fontSize: 14.5,
        lineHeight: 20,
        color: COLORS.black,
        marginRight: 8,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
    },

    // Send button
    sendContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingRight: 4,
        paddingBottom: 2,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.orange,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Quick Replies
    quickRepliesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.inputBorder,
    },
    quickReplyChip: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.blue,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 7,
    },
    quickReplyText: {
        fontSize: 13,
        color: COLORS.blue,
        fontWeight: '500',
    },

    // Scroll to bottom
    scrollToBottom: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
});
