import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/styles';
import { formatNumber } from '@/features/farm/utils/numberUtils';

interface Props {
    materialCode: string;
    price: number;
    supplier: string;
    remainingQuantity?: number;
}

const BreedInfoCard: React.FC<Props> = ({ materialCode, price, supplier, remainingQuantity }) => {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Thông tin giống</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.row}>
                    <Text style={styles.label}>Mã vật tư:</Text>
                    <Text style={styles.value}>{materialCode}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Giá tôm:</Text>
                    <Text style={styles.value}>{formatNumber(price)} VND/con</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Nhãn hiệu:</Text>
                    <Text style={styles.value}>{supplier}</Text>
                </View>

                {remainingQuantity !== undefined && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Số lượng còn lại:</Text>
                        <Text style={styles.value}>{formatNumber(remainingQuantity)}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default BreedInfoCard;

/* ===== STYLES ===== */
const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
        overflow: 'hidden',
    },

    header: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.backgroundPrimary,
    },

    headerText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text,
    },

    content: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.xs,
        backgroundColor: colors.white,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },

    label: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
        fontWeight: typography.fontWeight.medium,
    },

    value: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        color: colors.text,
        textAlign: 'right',
        maxWidth: '60%',
    },
});
