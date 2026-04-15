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
                    // Matches gradient average — prevents white flash before shader mounts
                    backgroundColor: '#D4CFEA',
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
                    backgroundColor: 'transparent',
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

                // Disclaimer — absolute at bottom, no layout impact
                disclaimer: {
                    position: 'absolute' as const,
                    bottom: 4,
                    left: 0,
                    right: 0,
                    textAlign: 'center' as const,
                    fontSize: 11,
                    color: theme.textSecondary,
                    paddingHorizontal: 16,
                },
            }),
        [theme]
    );
};
