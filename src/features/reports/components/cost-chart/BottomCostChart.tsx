import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { CostItem } from './costChartData';

interface Props {
    data: CostItem[];
}

const BottomCostChart = ({ data }: Props) => {
    return (
        <View style={styles.container}>
            {data.map((item, index) => (
                <View key={index} style={styles.itemContainer}>
                    <View style={[styles.dot, { backgroundColor: item.color }]} />
                    <Text style={styles.label}>{item.label}</Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10, // Adjusted gap
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    label: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.textSecondary,
    },
});

export default BottomCostChart;
