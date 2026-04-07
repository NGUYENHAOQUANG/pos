/**
 * @file RefreshControl.tsx
 * @description Shared RefreshControl component with built-in haptic feedback.
 * Drop-in replacement for React Native's RefreshControl.
 * Only need to change the import path, no JSX changes required.
 *
 * Usage:
 *   // Replace this:
 *   import { RefreshControl } from 'react-native';
 *   // With this:
 *   import { RefreshControl } from '@/shared/components/layout/RefreshControl';
 */
import React, { useCallback } from 'react';
import { RefreshControl as RNRefreshControl, RefreshControlProps } from 'react-native';
import { haptics } from '@/shared/utils/haptics';
import { useAppTheme } from '@/styles/themeContext';

/**
 * Shared RefreshControl with haptic feedback and consistent styling.
 * Same API as native RefreshControl — just swap the import.
 */
export const RefreshControl: React.FC<RefreshControlProps> = ({
    onRefresh,
    tintColor,
    colors: refreshColors,
    progressBackgroundColor,
    ...props
}) => {
    const theme = useAppTheme();
    const activeTintColor = tintColor || theme.text;
    const activeColors = refreshColors || [theme.text];
    const activeBackgroundColor = progressBackgroundColor || theme.background;

    const handleRefresh = useCallback(() => {
        haptics.light();
        onRefresh?.();
    }, [onRefresh]);

    return (
        <RNRefreshControl
            onRefresh={handleRefresh}
            tintColor={activeTintColor}
            colors={activeColors}
            progressBackgroundColor={activeBackgroundColor}
            {...props}
        />
    );
};
