import React, { useState, useCallback } from 'react';
import { useAppTheme } from '@/styles/themeContext';
import { View, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Text } from '@/shared/components/typography/Text';

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
    const theme = useAppTheme();
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
                { backgroundColor: theme.background, borderColor: theme.border },
                isProdSummary && styles.cardProd,
                isActive && onPress && item.color
                    ? { borderColor: item.color, borderWidth: 2 }
                    : undefined,
            ]}
        >
            {item.color ? (
                <View style={[styles.indicator, { backgroundColor: item.color }]} />
            ) : null}
            <Text
                style={[
                    styles.title,
                    { color: theme.textSecondary },
                    isProdSummary && styles.titleProd,
                ]}
                numberOfLines={1}
            >
                {item.name}
            </Text>
            <View style={styles.valueRow}>
                <Text
                    style={[
                        styles.valueNumber,
                        { color: theme.text },
                        isProdSummary && { fontWeight: '700' },
                    ]}
                >
                    {valuePart}
                </Text>
                {unitPart ? (
                    <Text
                        style={[
                            styles.valueUnit,
                            { color: theme.textSecondary },
                            isProdSummary && { fontSize: 14 },
                        ]}
                    >
                        {unitPart}
                    </Text>
                ) : null}
            </View>

            {/* Tooltip overlay */}
            {showTooltip && tooltipValue ? (
                <View style={styles.tooltipWrapper}>
                    {/* Caret arrow */}
                    <View style={styles.tooltipCaret} />
                    <Pressable style={styles.tooltipOverlay} onPress={() => setShowTooltip(false)}>
                        <Text style={styles.tooltipText}>{tooltipValue}</Text>
                    </Pressable>
                </View>
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

        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 10,
    },
    cardProd: {
        flex: 1,
        borderRadius: 8,
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

        fontWeight: '500',
    },
    valueNumberProd: {
        fontSize: 16,
        fontWeight: '700',
    },
    valueUnit: {
        fontSize: 12,

        fontWeight: '500',
        marginLeft: 4,
    },
    valueUnitProd: {
        fontSize: 14,
    },
    tooltipWrapper: {
        position: 'absolute',
        top: '100%',
        left: -4,
        right: -4,
        marginTop: 18,
        zIndex: 100,
        alignItems: 'center',
    },
    tooltipCaret: {
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#1C2632',
        marginBottom: -1,
        zIndex: 101,
    },
    tooltipOverlay: {
        backgroundColor: '#0B1117',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    tooltipText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '500',
        textAlign: 'center',
    },
});
