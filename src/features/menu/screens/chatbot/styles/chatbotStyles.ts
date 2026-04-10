/**
 * @file chatbotStyles.ts
 * @description Tất cả styles cho ChatbotScreen
 */
import { StyleSheet } from 'react-native';
import { useAppTheme } from '@/styles/themeContext';
import { borderRadius } from '@/styles';
import { useMemo } from 'react';

export const useChatbotStyles = () => {
    const theme = useAppTheme();

    return useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flex: 1,
                    backgroundColor: theme.background,
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
                    backgroundColor: theme.background,
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
                    backgroundColor: theme.success,
                    borderWidth: 2,
                    borderColor: theme.background,
                },
                headerTitle: {
                    fontSize: 15,
                    fontWeight: '600',
                    color: theme.text,
                },
                headerSubtitle: {
                    fontSize: 12,
                    color: theme.textSecondary,
                },
                headerRight: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                },
                historyButton: {
                    width: 40,
                    height: 40,
                    borderRadius: borderRadius.full,
                    backgroundColor: theme.backgroundButton,
                    borderWidth: 1,
                    borderColor: theme.defaultBorder,
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                betaBadge: {
                    backgroundColor: theme.primaryOrange,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 4,
                },
                betaText: {
                    color: '#FFFFFF',
                    fontSize: 10,
                    fontWeight: '700',
                    letterSpacing: 0.5,
                },

                // Chat
                chatContainer: {
                    flex: 1,
                    backgroundColor: theme.background,
                    paddingTop: 16,
                },

                // Bot Avatar
                botAvatar: {
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: theme.background,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 4,
                },

                // Input Toolbar (icon + pill layout)
                inputToolbar: {
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    backgroundColor: theme.background,
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: 16,
                    gap: 8,
                },
                quickSheetButton: {
                    width: 48,
                    height: 48,
                    borderRadius: 32,
                    borderWidth: 1,
                    borderColor: theme.border,
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
                    backgroundColor: theme.background,
                    borderRadius: 32,
                    borderWidth: 1,
                    borderColor: theme.border,
                    paddingLeft: 8,
                    paddingRight: 4,
                    minHeight: 44,
                    maxHeight: 140,
                    overflow: 'hidden',
                },
                composerInput: {
                    backgroundColor: 'transparent',
                    borderRadius: 0,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 15,
                    color: theme.text,
                    marginRight: 0,
                    minHeight: 44,
                    maxHeight: 120,
                    borderWidth: 0,
                    textAlignVertical: 'center',
                },
                // Send button (inside pill)
                sendContainer: {
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingRight: 4,
                    marginBottom: 0,
                    paddingVertical: 5,
                    alignSelf: 'flex-end',
                },
                sendButton: {
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: theme.primaryOrange,
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
                    borderColor: theme.border,
                    backgroundColor: theme.backgroundPrimary,
                    marginTop: 8,
                    marginRight: 8,
                },
                quickReplyTextStyle: {
                    fontSize: 14,
                    fontWeight: '500',
                    color: theme.text,
                },
            }),
        [theme]
    );
};
