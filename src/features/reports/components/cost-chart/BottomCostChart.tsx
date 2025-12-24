import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';

const LEGEND_ITEMS = [
    { label: 'Chất xử lý nước đầu vào', color: colors.green[800] },
    { label: 'Trị bệnh', color: colors.orange[600] },
    { label: 'Chế phẩm sinh học', color: colors.orange[200] },
    { label: 'Chất cải thiện ao nuôi', color: colors.blue[700] },
    { label: 'Khoáng chất', color: colors.blue[400] },
    { label: 'Dinh dưỡng bổ sung', color: colors.blue[50] },
    { label: 'Thức ăn cho tôm', color: colors.red[600] },
    { label: 'Tôm giống', color: colors.success },
];

const BottomCostChart = () => {
    return (
        <View style={styles.container}>
            {LEGEND_ITEMS.map((item, index) => (
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
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12, // Using gap for easier spacing
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    label: {
        fontSize: typography.fontSize.xs, // Small text as per chart legends usually
        fontFamily: typography.fontFamily.regular,
        color: colors.textSecondary,
    },
});

export default BottomCostChart;
