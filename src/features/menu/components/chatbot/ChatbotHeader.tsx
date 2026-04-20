/**
 * @file ChatbotHeader.tsx
 * @description Glassmorphism header for Chatbot screen with animated gradient avatar.
 * Light-mode only — no dark mode support.
 */
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Text } from '@/shared/components/typography/Text';
import { borderRadius } from '@/styles';
import { colors } from '@/styles/colors';
import { ChatbotAvatar } from '@/features/menu/animation/ChatbotAvatar';
import ArrowsClockwiseIcon from '@/assets/Icon/IconChatBot/ArrowsClockwise.svg';

interface ChatbotHeaderProps {
    onNewChat: () => void;
}

export const ChatbotHeader: React.FC<ChatbotHeaderProps> = ({ onNewChat }) => {
    const navigation = useNavigation();

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                {/* Back button */}
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Ionicons name="arrow-back" size={20} color={colors.text} />
                </TouchableOpacity>

                {/* Avatar + Info */}
                <View style={styles.centerContent}>
                    <ChatbotAvatar size={40} />

                    {/* Title + Status */}
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Mebieco AI</Text>
                        <View style={styles.statusRow}>
                            <View style={styles.statusDot} />
                            <Text style={styles.subtitle}>Đang hoạt động</Text>
                        </View>
                    </View>
                </View>

                {/* New chat button */}
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={onNewChat}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <ArrowsClockwiseIcon width={20} height={20} color={colors.text} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: borderRadius.md,
        backgroundColor: colors.chatbot.glassBg,
        borderWidth: 1,
        borderColor: colors.chatbot.glassBorder,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: colors.chatbot.glassButtonBg,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.chatbot.glassButtonBorder,
        marginRight: 10,
    },
    centerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 1,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 4,
        backgroundColor: colors.success,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '400',
        color: colors.success,
    },
});
