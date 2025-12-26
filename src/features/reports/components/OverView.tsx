import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/styles';

interface MetricItem {
    label: string;
    value: string;
    unit?: string;
    valueColor?: string;
}

const DATA: MetricItem[] = [
    { label: 'Sản lượng (kg)', value: '430' },
    { label: 'Cỡ tôm (g/con)', value: '1.2' },
    { label: 'Mật độ (con/m²)', value: '454' },
    { label: 'Đã ăn (kg)', value: '470' },
    { label: 'FCR', value: '1.1', valueColor: colors.green[600] }, 
    { label: 'Tỷ lệ sống (%)', value: '88.7', valueColor: colors.green[600] },
];

export const OverView = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>TỔNG QUAN</Text>
            
            <View style={styles.grid}>
                {DATA.map((item, index) => (
                    <View key={index} style={styles.card}>
                        <Text style={styles.label}>{item.label}</Text>
                        <Text style={[
                            styles.value, 
                            item.valueColor ? { color: item.valueColor } : {}
                        ]}>
                            {item.value}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: 8,
        marginBottom: 8,
    },
    title: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        textTransform: 'uppercase',
        marginBottom: spacing.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'space-between',
    },
    card: {
        width: '31%', // 3 columns with gap
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 11,
        color: colors.text,
        marginBottom: 4,
        textAlign: 'center',
    },
    value: {
        fontSize: 16,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        textAlign: 'center',
    }
});
