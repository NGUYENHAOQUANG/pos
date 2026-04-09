/**
 * @file chatbotStyles.ts
 * @description Tất cả styles cho ChatbotScreen
 */
import { StyleSheet } from 'react-native';
import { COLORS } from '@/features/menu/screens/chatbot/constants';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },

    // Header
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
        backgroundColor: COLORS.white,
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
    },
    headerSubtitle: {
        fontSize: 12,
        color: COLORS.grayText,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    historyButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.grayLight,
        justifyContent: 'center',
        alignItems: 'center',
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
        backgroundColor: COLORS.white,
        paddingTop: 16,
    },

    // Bot Avatar
    botAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
    },

    // Input Toolbar (icon + pill layout)
    inputToolbar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
        gap: 8,
    },
    quickSheetButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputPillContainer: {
        flex: 1,
        maxHeight: 140,
    },
    inputToolbarInner: {
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        paddingHorizontal: 0,
        paddingTop: 0,
        paddingBottom: 0,
    },
    inputPrimary: {
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        paddingLeft: 8,
        paddingRight: 4,
        minHeight: 56,
        maxHeight: 140,
        overflow: 'hidden',
    },
    composerInput: {
        backgroundColor: 'transparent',
        borderRadius: 0,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        fontSize: 16,
        color: COLORS.black,
        marginRight: 0,
        minHeight: 56,
        maxHeight: 120,
        borderWidth: 0,
        textAlignVertical: 'top',
    },
    // Send button (inside pill)
    sendContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingRight: 4,
        marginBottom: 0,
        paddingVertical: 10,
        alignSelf: 'flex-end',
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.orange,
        justifyContent: 'center',
        overflow: 'hidden',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: 'transparent',
    },
    quickReplyStyle: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        backgroundColor: COLORS.white,
        marginTop: 8,
        marginRight: 8,
    },
    quickReplyTextStyle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1A1A2E',
    },
});
