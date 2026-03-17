import React from 'react';
import { TouchableOpacity, View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors } from '@/styles/colors';

interface PondData {
    id: string;
    name: string;
    value: string;
    color: string;
}

interface PondIndexProps {
    data?: PondData[];
    isEqualWidth?: boolean;
    /** Currently selected card id for filter highlight */
    selectedId?: string | null;
    /** Called when a card is pressed */
    onPress?: (id: string) => void;
}

const DEFAULT_DATA: PondData[] = [
    { id: '1', name: 'N01', value: '{chỉ số}', color: colors.orange[700] },
    { id: '2', name: 'N02', value: '{chỉ số}', color: colors.green[300] },
    { id: '3', name: 'N03', value: '{chỉ số}', color: colors.blue[700] },
    { id: '4', name: 'V01', value: '{chỉ số}', color: colors.green[800] },
    { id: '5', name: 'V02', value: '{chỉ số}', color: colors.brown[900] },
    { id: '6', name: 'V03', value: '{chỉ số}', color: colors.blue[300] },
    { id: '7', name: 'V04', value: '{chỉ số}', color: colors.yellow[800] },
];

export const PondIndex = ({
    data = DEFAULT_DATA,
    isEqualWidth,
    selectedId,
    onPress,
}: PondIndexProps) => {
    const parseValueAndUnit = (value: string): { value: string; unit: string } => {
        const firstSpace = value.indexOf(' ');
        if (firstSpace === -1) return { value, unit: '' };
        return {
            value: value.slice(0, firstSpace),
            unit: value.slice(firstSpace),
        };
    };

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
                styles.scrollContent,
                isEqualWidth && styles.scrollContentEqual,
            ]}
            style={styles.scrollView}
        >
            {data.map(item => {
                const { value: valuePart, unit: unitPart } = parseValueAndUnit(item.value);
                const isSelected = selectedId === item.id;
                const CardWrapper = onPress ? TouchableOpacity : View;
                return (
                    <CardWrapper
                        key={item.id}
                        style={[
                            styles.card,
                            isEqualWidth && styles.cardEqual,
                            isSelected && { borderColor: item.color, borderWidth: 2 },
                        ]}
                        activeOpacity={0.7}
                        onPress={onPress ? () => onPress(item.id) : undefined}
                    >
                        <View style={[styles.indicator, { backgroundColor: item.color }]} />
                        <Text style={styles.title} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <View style={styles.valueRow}>
                            <Text style={styles.valueNumber}>{valuePart}</Text>
                            {unitPart ? <Text style={styles.valueUnit}>{unitPart}</Text> : null}
                        </View>
                    </CardWrapper>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flexGrow: 0,
    },
    scrollContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
    },
    card: {
        minWidth: 88,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 10,
        paddingTop: 8,
        paddingBottom: 12,
        backgroundColor: colors.white,
    },
    scrollContentEqual: {
        width: '100%',
        justifyContent: 'space-between',
    },
    cardEqual: {
        flex: 1,
    },
    indicator: {
        width: 20,
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
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        flexWrap: 'wrap',
    },
    valueNumber: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '700',
    },
    valueUnit: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '400',
        marginLeft: 2,
    },
});
