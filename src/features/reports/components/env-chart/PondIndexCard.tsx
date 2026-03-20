import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors } from '@/styles/colors';

export interface PondIndexCardData {
    id: string;
    name: string;
    value: string;
    color: string;
}

type PondIndexCardVariant = 'default' | 'prodSummary';

interface PondIndexCardProps {
    item: PondIndexCardData;
    variant?: PondIndexCardVariant;
    onPress?: () => void;
    isActive?: boolean;
    /** Full value to display in tooltip on long press */
    tooltipValue?: string;
}

const parseValueAndUnit = (value: string): { value: string; unit: string } => {
    const firstSpace = value.indexOf(' ');
    if (firstSpace === -1) return { value, unit: '' };
    return {
        value: value.slice(0, firstSpace),
        unit: value.slice(firstSpace),
    };
};

export const PondIndexCard: React.FC<PondIndexCardProps> = ({
    item,
    variant = 'default',
    onPress,
    isActive = true,
    tooltipValue,
}) => {
    const { value: valuePart, unit: unitPart } = parseValueAndUnit(item.value);
    const isProdSummary = variant === 'prodSummary';
    const [showTooltip, setShowTooltip] = useState(false);

    const handleTooltipPress = useCallback(() => {
        if (tooltipValue) {
            setShowTooltip(prev => !prev);
        }
    }, [tooltipValue]);

    const card = (
        <View
            style={[
                styles.card,
                isProdSummary && styles.cardProd,
                isActive && onPress && item.color ? { borderColor: item.color } : undefined,
            ]}
        >
            {item.color ? (
                <View style={[styles.indicator, { backgroundColor: item.color }]} />
            ) : null}
            <Text style={[styles.title, isProdSummary && styles.titleProd]} numberOfLines={1}>
                {item.name}
            </Text>
            <View style={styles.valueRow}>
                <Text style={[styles.valueNumber, isProdSummary && styles.valueNumberProd]}>
                    {valuePart}
                </Text>
                {unitPart ? (
                    <Text style={[styles.valueUnit, isProdSummary && styles.valueUnitProd]}>
                        {unitPart}
                    </Text>
                ) : null}
            </View>

            {/* Tooltip overlay */}
            {showTooltip && tooltipValue ? (
                <Pressable style={styles.tooltipOverlay} onPress={() => setShowTooltip(false)}>
                    <Text style={styles.tooltipText}>{tooltipValue}</Text>
                </Pressable>
            ) : null}
        </View>
    );

    if (onPress || tooltipValue) {
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                    onPress?.();
                    handleTooltipPress();
                }}
            >
                {card}
            </TouchableOpacity>
        );
    }
    return card;
};

const styles = StyleSheet.create({
    card: {
        minWidth: 88,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray[200],
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 10,
        backgroundColor: colors.white,
    },
    cardProd: {
        flex: 1,
        borderRadius: 8,
        borderColor: colors.gray[200],
    },
    cardInactive: {
        opacity: 0.4,
    },
    indicator: {
        width: 8,
        height: 3,
        borderRadius: 2,
        marginBottom: 8,
    },
    title: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '400',
        marginBottom: 4,
    },
    titleProd: {
        fontSize: 14,
        fontWeight: '400',
        marginBottom: 6,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        flexWrap: 'wrap',
    },
    valueNumber: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    valueNumberProd: {
        fontSize: 16,
        fontWeight: '700',
    },
    valueUnit: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '500',
        marginLeft: 4,
    },
    valueUnitProd: {
        fontSize: 14,
    },
    tooltipOverlay: {
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 6,
        marginBottom: 10,
        zIndex: 100,
        alignItems: 'center',
    },
    tooltipText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
        textAlign: 'center',
    },
});
