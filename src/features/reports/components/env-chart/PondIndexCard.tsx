import React from 'react';
import { View, StyleSheet } from 'react-native';
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
}

const parseValueAndUnit = (value: string): { value: string; unit: string } => {
    const firstSpace = value.indexOf(' ');
    if (firstSpace === -1) return { value, unit: '' };
    return {
        value: value.slice(0, firstSpace),
        unit: value.slice(firstSpace),
    };
};

export const PondIndexCard: React.FC<PondIndexCardProps> = ({ item, variant = 'default' }) => {
    const { value: valuePart, unit: unitPart } = parseValueAndUnit(item.value);
    const isProdSummary = variant === 'prodSummary';

    return (
        <View style={[styles.card, isProdSummary && styles.cardProd]}>
            {!isProdSummary && <View style={[styles.indicator, { backgroundColor: item.color }]} />}
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
        fontSize: 13,
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
        fontSize: 18,
    },
    valueUnit: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '400',
        marginLeft: 4,
    },
    valueUnitProd: {
        fontSize: 13,
    },
});
