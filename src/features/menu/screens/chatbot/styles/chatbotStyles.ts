/**
 * @file chatbotStyles.ts
 * @description Tất cả styles cho ChatbotScreen
 */
import { StyleSheet } from 'react-native';
import { COLORS } from '../constants';

export const styles = StyleSheet.create({
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
        backgroundColor: COLORS.blue,
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
        paddingTop: 8,
        paddingBottom: 8,
        gap: 8,
    },
    quickSheetButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
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
        backgroundColor: COLORS.inputBg,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        paddingLeft: 4,
        paddingRight: 4,
        maxHeight: 140,
        overflow: 'hidden',
    },
    composerInput: {
        backgroundColor: 'transparent',
        borderRadius: 0,
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 15,
        color: COLORS.black,
        marginRight: 0,
        minHeight: 40,
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
        paddingVertical: 2,
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
});
