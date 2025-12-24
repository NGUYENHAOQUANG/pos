import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/styles';

export const Legend: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.legendItem}>
                <View style={[styles.legendSquare, { backgroundColor: colors.orange[600] }]} />
                <Text style={styles.legendText}>Đã ăn</Text>
            </View>
            <View style={styles.legendItem}>
                <View style={[styles.legendSquare, { backgroundColor: colors.green[300] }]} />
                <Text style={styles.legendText}>Sản lượng</Text>
            </View>
            <View style={styles.legendItem}>
                <View style={[styles.legendSquare, { backgroundColor: colors.gray[200] }]} />
                <Text style={styles.legendText}>Dự báo</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendSquare: {
        width: 12,
        height: 12,
        borderRadius: 2,
    },
    legendText: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 20,
    },
});
