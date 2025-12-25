import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';

interface PondData {
    id: string;
    name: string;
    value: string;
    color: string;
}

interface PondIndexProps {
    data?: PondData[];
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

export const PondIndex = ({ data = DEFAULT_DATA }: PondIndexProps) => {
    const firstRow = data.slice(0, 4);
    const secondRow = data.slice(4, 7);

    return (
        <View style={styles.container}>
            {/* Row 1: 4 Items */}
            <View style={styles.row}>
                {firstRow.map(item => (
                    <View key={item.id} style={[styles.item, { borderColor: item.color }]}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.value}>{item.value}</Text>
                    </View>
                ))}
            </View>

            {/* Row 2: 3 Items + 1 Ghost Item for perfect alignment */}
            <View style={styles.row}>
                {secondRow.map(item => (
                    <View key={item.id} style={[styles.item, { borderColor: item.color }]}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.value}>{item.value}</Text>
                    </View>
                ))}
                {/* Invisible filler item to match the 4-column layout of row 1 */}
                <View
                    style={[
                        styles.item,
                        { borderColor: 'transparent', backgroundColor: 'transparent' },
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        gap: 12,
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    item: {
        flex: 1, // Auto scale
        // aspectRatio: 1, // Removed to allow rectangular shape
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        padding: 4,
        paddingVertical: 12, // More height padding
        backgroundColor: colors.white,
    },
    name: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.xs,
        color: colors.text,
        marginBottom: 4,
        textAlign: 'center',
        fontWeight: '400',
    },
    value: {
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.sm,
        color: colors.text,
        textAlign: 'center',
        fontWeight: '700',
    },
});
