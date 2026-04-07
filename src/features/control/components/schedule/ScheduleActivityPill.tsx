import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '@/styles/themeContext';

interface ScheduleActivityPillProps {
    isActive: boolean;
    isPrevActive: boolean;
    isNextActive: boolean;
    color?: string;
}

export const ScheduleActivityPill: React.FC<ScheduleActivityPillProps> = ({
    isActive,
    isPrevActive,
    isNextActive,
    color,
}) => {
    const theme = useAppTheme();
    const pillColor = color || theme.primary;

    if (!isActive) return null;

    const indicatorStyle = {
        borderTopLeftRadius: isPrevActive ? 0 : 16,
        borderTopRightRadius: isPrevActive ? 0 : 16,
        borderBottomLeftRadius: isNextActive ? 0 : 16,
        borderBottomRightRadius: isNextActive ? 0 : 16,
        marginTop: 0,
        marginBottom: 0,
        top: 0,
        bottom: 0,
    };

    return (
        <View style={[styles.activeIndicator, indicatorStyle, { backgroundColor: pillColor }]} />
    );
};

const styles = StyleSheet.create({
    activeIndicator: {
        position: 'absolute',
        left: '50%',
        marginLeft: -5,
        width: 10,
    },
});
