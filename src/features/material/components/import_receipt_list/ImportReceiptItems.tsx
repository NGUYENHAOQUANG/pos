import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { formatCurrency } from '@/features/material/utils/formatCurrency';
import { ImportReceiptDetailItem } from '@/features/material/types/importReceipt.types';
import { formatCurrencyValue } from '@/shared/utils';

interface ImportReceiptItemsProps {
    materials: ImportReceiptDetailItem[];
}

export const ImportReceiptItems: React.FC<ImportReceiptItemsProps> = ({ materials }) => {
    return (
        <View style={styles.container}>
            <View>
                {materials.map((item, index) => {
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
                                        <View
                                            style={[styles.detailContent, styles.detailContentEnd]}
                                        >
                                            <Text style={styles.priceLabel}>Đơn giá: </Text>
                                            <Text style={styles.priceValue}>
                                                {formatCurrency(item.unitPrice || 0)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.separatorInset} />

                                {/* Total Amount */}
                                <View style={styles.footer}>
                                    <Text style={styles.footerLabel}>Thành tiền:</Text>
                                    <Text style={styles.footerValue}>
                                        {formatCurrencyValue(item.totalPrice)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        paddingHorizontal: spacing.md,
    },
    materialCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.md,
        marginRight: spacing.xs,
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
