import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';

const LEGEND_ITEMS = [
    { color: colors.orange[700], label: 'N01' },
    { color: colors.green[300], label: 'N02' },
    { color: colors.blue[700], label: 'N03' },
    { color: colors.green[800], label: 'V01' },
    { color: colors.brown[900], label: 'V02' },
    { color: colors.blue[300], label: 'V03' },
    { color: colors.yellow[800], label: 'V04' },
];

export const BottomEnvChart = () => {
    return (
        <View style={styles.container}>
            {LEGEND_ITEMS.map((item, index) => (
                <View key={index} style={styles.item}>
                    <View style={[styles.dot, { backgroundColor: item.color }]} />
                    <Text style={styles.text}>{item.label}</Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        gap: 16, // Consistent gap between items
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    text: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 12,
        color: colors.text,
    },
});
