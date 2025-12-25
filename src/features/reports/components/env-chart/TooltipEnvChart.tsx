import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';

interface TooltipItem {
    pond: string;
    value: number;
    color: string;
    unit: string;
}

interface TooltipEnvChartProps {
    visible: boolean;
    date: Date;
    data: TooltipItem[];
    position: { x: number; y: number };
    onClose: () => void;
    chartWidth: number; // To handle boundary checks
}

export const TooltipEnvChart = ({
    visible,
    date,
    data,
    position,
    onClose,
    chartWidth,
}: TooltipEnvChartProps) => {
    if (!visible) return null;

    // --- Formatters ---
    const formatDate = (d: Date) => {
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month}`;
    };

    // --- Positioning Logic ---
    // If x is too close to right edge, shift tooltip to left
    const tooltipWidth = 140; // Approx width
    let left = position.x + 10; // Default: right of tap

    if (left + tooltipWidth > chartWidth) {
        left = position.x - tooltipWidth - 10;
    }
    
    // Ensure not off-screen left
    if (left < 0) left = 10;

    // Y position: try to keep it somewhat centered on tap or fixed?
    // User asked "popup points there". Let's use the tap Y or specific logic.
    // For now, let's just respect the passed Y, but clamp it to chart area.
    let top = Math.max(10, position.y - 100); // Shift up a bit to not cover finger
    if (top < 0) top = 10;

    return (
        <View style={[styles.tooltipContainer, { left, top }]}>
            <View style={styles.tooltipHeader}>
                <Text style={styles.tooltipDate}>{formatDate(date)}</Text>
                <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={onClose}>
                    <Text style={styles.tooltipClose}>×</Text>
                </TouchableOpacity>
            </View>
            <View>
                {data.map(item => (
                    <View key={item.pond} style={styles.tooltipRow}>
                        <View style={[styles.dot, { backgroundColor: item.color }]} />
                        <Text style={styles.tooltipLabel}>
                            <Text style={{fontWeight: 'bold'}}>{item.pond}: </Text>
                            {item.value.toFixed(2)} {item.unit}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    tooltipContainer: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: colors.borderLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 100,
        minWidth: 140,
    },
    tooltipHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        paddingBottom: 4,
    },
    tooltipDate: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 12,
        color: colors.text,
    },
    tooltipClose: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textSecondary,
        marginTop: -4,
        lineHeight: 18,
    },
    tooltipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    tooltipLabel: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 11,
        color: colors.text,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
});
