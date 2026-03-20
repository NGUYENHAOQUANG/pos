import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
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
}) => {
    const { value: valuePart, unit: unitPart } = parseValueAndUnit(item.value);
    const isProdSummary = variant === 'prodSummary';

    const content = (
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
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
                {content}
            </TouchableOpacity>
        );
    }
    return content;
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
});
