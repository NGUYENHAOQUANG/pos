import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
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
    chartWidth: number;
    chartHeight: number;
}

export const TooltipEnvChart = ({
    visible,
    date,
    data,
    position,
    onClose,
    chartWidth,
    chartHeight,
}: TooltipEnvChartProps) => {
    if (!visible) return null;

    // --- Formatters (use UTC to match backend date convention) ---
    const formatDate = (d: Date) => {
        const day = d.getUTCDate().toString().padStart(2, '0');
        const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month}`;
    };

    // --- Positioning Logic ---
    const tooltipWidth = 140;
    let left = position.x + 10;

    if (left + tooltipWidth > chartWidth) {
        left = position.x - tooltipWidth - 10;
    }
    if (left < 0) left = 10;

    // Estimate tooltip height: header ~30px + each row ~20px + padding 16px
    const estimatedHeight = 30 + data.length * 20 + 16;
    const tapGap = 12; // Gap between tap point and tooltip

    // Show below tap if enough space, otherwise show above
    let top: number;
    if (position.y + tapGap + estimatedHeight < chartHeight) {
        // Show below tap point
        top = position.y + tapGap;
    } else {
        // Show above tap point
        top = Math.max(0, position.y - estimatedHeight - tapGap);
    }

    return (
        <View style={[styles.tooltipContainer, { left, top }]}>
            <View style={styles.tooltipHeader}>
                <Text style={styles.tooltipDate}>{formatDate(date)}</Text>
                <TouchableOpacity
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={onClose}
                >
                    <Text style={styles.tooltipClose}>×</Text>
                </TouchableOpacity>
            </View>
            <View>
                {data.map(item => (
                    <View key={item.pond} style={styles.tooltipRow}>
                        <View style={[styles.dot, { backgroundColor: item.color }]} />
                        <Text style={styles.tooltipLabel}>
                            <Text style={{ fontWeight: 'bold' }}>{item.pond}: </Text>
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
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.black,
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
