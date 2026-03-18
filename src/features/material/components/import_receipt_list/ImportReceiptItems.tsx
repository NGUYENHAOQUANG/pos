import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, borderRadius } from '@/styles';
import { formatCurrency } from '@/features/material/utils/formatCurrency';
import { ImportReceiptDetailItem } from '@/features/material/types/importReceipt.types';
import { formatCurrencyValue } from '@/shared/utils';
import { DetailRow } from '@/features/material/components/DetailRow';

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
                            <View style={styles.materialHeader}>
                                <Text style={styles.materialHeaderTitle}>Vật tư {index + 1}</Text>
                            </View>

                            <View style={styles.content}>
                                <Text style={styles.materialName}>{item.materialName}</Text>
                                <DetailRow label="Số lượng:" value={item.quantity} />
                                <DetailRow
                                    label="Đơn giá:"
                                    value={formatCurrency(item.unitPrice || 0)}
                                />
                                <DetailRow
                                    label="Thành tiền:"
                                    value={formatCurrencyValue(item.totalPrice)}
                                />
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
        paddingHorizontal: spacing.md,
    },
    materialCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.md,
    },
    materialHeader: {
        paddingVertical: 12,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.gray[100],
        borderTopLeftRadius: borderRadius.sm,
        borderTopRightRadius: borderRadius.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    materialHeaderTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    content: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: spacing.sm,
    },
    nameRow: {
        paddingVertical: 4,
    },
    materialName: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
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
    detailRow: {
        flexDirection: 'row',
        marginBottom: 12,
        flexWrap: 'wrap',
        marginTop: spacing.sm,
    },
    detailLabel: {
        fontWeight: '400',
        fontSize: 14,
        color: colors.text,
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
});
