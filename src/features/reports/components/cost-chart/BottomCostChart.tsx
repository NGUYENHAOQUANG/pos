import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { CostItem } from './costChartData';

interface Props {
    data: CostItem[];
}

const DISPLAY_ORDER = [
    'Chất xử lý nước đầu vào',
    'Trị bệnh',
    'Chế phẩm sinh học',
    'Chất cải thiện ao nuôi',
    'Khoáng chất',
    'Dinh dưỡng bổ sung',
    'Thức ăn cho tôm',
    'Tôm giống',
];

const BottomCostChart = ({ data }: Props) => {
    const sortedData = useMemo(() => {
        return DISPLAY_ORDER.map(label => data.find(item => item.label === label)).filter(
            (item): item is CostItem => !!item
        );
    }, [data]);

    return (
        <View style={styles.container}>
            {sortedData.map((item, index) => (
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
        paddingHorizontal: 8, // Reduced padding to fit 3 items
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
