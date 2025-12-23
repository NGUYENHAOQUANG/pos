import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';

const LEGEND_ITEMS = [
    { color: colors.orange[700], label: '{tên ao}' },
    { color: colors.green[300], label: '{tên ao}' },
    { color: colors.blue[700], label: '{tên ao}' },
    { color: colors.green[800], label: '{tên ao}' },
    { color: colors.brown[900], label: '{tên ao}' },
    { color: colors.blue[300], label: '{tên ao}' },
    { color: colors.yellow[800], label: '{tên ao}' },
];

export const BottomEnvChart = () => {
    const row1 = LEGEND_ITEMS.slice(0, 5);
    const row2 = LEGEND_ITEMS.slice(5);

    return (
        <View style={styles.container}>
            {/* Row 1: 5 Items */}
            <View style={styles.row}>
                {row1.map((item, index) => (
                    <View key={`r1-${index}`} style={styles.item}>
                        <View style={[styles.dot, { backgroundColor: item.color }]} />
                        <Text style={styles.text}>{item.label}</Text>
                    </View>
                ))}
            </View>

            {/* Row 2: 2 Items */}
            <View style={styles.row}>
                {row2.map((item, index) => (
                    <View key={`r2-${index}`} style={styles.item}>
                        <View style={[styles.dot, { backgroundColor: item.color }]} />
                        <Text style={styles.text}>{item.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        gap: 8, // Vertical gap between rows
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'nowrap', // Ensure single line per row
        gap: 16, // Horizontal gap between items
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
