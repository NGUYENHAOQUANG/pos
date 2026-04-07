import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';

type IndicatorStatus = 'active' | 'idle' | 'warning' | 'success' | 'default';

interface IndicatorProps {
    status?: IndicatorStatus;
    style?: StyleProp<ViewStyle>;
}

export const Indicator: React.FC<IndicatorProps> = ({ status = 'active', style }) => {
    const theme = useAppTheme();

    // Color mapping for different statuses
    const STATUS_COLORS: Record<IndicatorStatus, string> = {
        active: theme.primary,
        idle: theme.schedule.remote,
        warning: theme.schedule.schedule,
        success: theme.schedule.local,
        default: theme.gray[200],
    };

    const backgroundColor = STATUS_COLORS[status] || STATUS_COLORS.default;

    return <View style={[styles.container, { backgroundColor }, style]} />;
};

const styles = StyleSheet.create({
    container: {
        width: 4,
        height: '100%',
        borderRadius: borderRadius.sm,
        minHeight: 40,
    },
});
