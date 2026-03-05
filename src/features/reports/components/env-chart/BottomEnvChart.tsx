import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
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
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
        >
            {LEGEND_ITEMS.map((item, index) => (
                <View key={index} style={styles.item}>
                    <View style={[styles.dot, { backgroundColor: item.color }]} />
                    <Text style={styles.text}>{item.label}</Text>
                </View>
            ))}
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
        paddingVertical: 12,
        paddingHorizontal: 8,
        gap: 16,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
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
