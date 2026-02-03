import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { IExportWarehouseMaterialItem } from '@/features/material/types/warehouse.types';
import { formatCurrencyValue } from '@/shared/utils/formatters';

interface ExportWarehouseReceiptItemsProps {
    materials: IExportWarehouseMaterialItem[];
}

export const ExportWarehouseReceiptItems: React.FC<ExportWarehouseReceiptItemsProps> = ({
    materials,
}) => {
    const formatCurrency = (value: number) => {
        return (
            <>
                {formatCurrencyValue(value)}{' '}
                <Text style={{ textDecorationLine: 'underline' }}>đ</Text>
            </>
        );
    };

    return (
        <View style={styles.container}>
            {materials.map((item, index) => {
                const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0);

                return (
                    <View key={item.id || index} style={styles.materialCard}>
                        {/* Header */}
                        <View style={styles.materialHeader}>
                            <Text style={styles.materialHeaderTitle}>Vật tư {index + 1}</Text>
                        </View>

                        <View style={styles.content}>
                            {/* Material Name - No Label */}
                            <View style={styles.nameRow}>
                                <Text style={styles.materialName}>{item.materialName}</Text>
                            </View>

                            <View style={styles.separatorFull} />

                            {/* Quantity and Price */}
                            <View style={styles.detailsRow}>
                                <View style={styles.detailItem}>
                                    <View style={styles.detailContent}>
                                        <Text style={styles.label}>Số lượng: </Text>
                                        <Text style={styles.value}>{item.quantity}</Text>
                                    </View>
                                </View>
                                <View style={styles.detailItem}>
                                    <View style={[styles.detailContent, styles.detailContentEnd]}>
                                        <Text style={styles.priceLabel}>Đơn giá: </Text>
                                        <Text style={styles.priceValue}>
                                            {formatCurrency(parseFloat(item.price) || 0)}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.separatorInset} />

                            {/* Total Amount */}
                            <View style={styles.footer}>
                                <Text style={styles.footerLabel}>Thành tiền:</Text>
                                <Text style={styles.footerValue}>
                                    {formatCurrencyValue(itemTotal)}
                                </Text>
                            </View>
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xs,
    },
    materialCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.md,
    },
    materialHeader: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.gray[100],
        borderTopLeftRadius: borderRadius.md,
        borderTopRightRadius: borderRadius.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    materialHeaderTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    content: {
        paddingBottom: spacing.md,
    },
    nameRow: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    materialName: {
        fontSize: 15,
        color: colors.text,
        fontWeight: '400',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
        paddingTop: spacing.sm,
    },
    detailItem: {
        flex: 1,
    },
    detailContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '600',
    },
    value: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
    },
    footerLabel: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '600',
    },
    footerValue: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
    priceLabel: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '600',
    },
    priceValue: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
    detailContentEnd: {
        justifyContent: 'flex-end',
    },
    separatorFull: {
        height: 1,
        backgroundColor: colors.border,
        width: '100%',
    },
    separatorInset: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: spacing.md,
    },
});
