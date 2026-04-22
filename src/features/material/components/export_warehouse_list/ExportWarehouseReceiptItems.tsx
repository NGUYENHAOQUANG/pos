import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors, spacing, borderRadius } from '@/styles';
import { formatCurrency } from '@/features/material/utils/formatCurrency';
import { ExportReceiptItem } from '@/features/material/types/exportReceipt.types';
import { formatCurrencyValue } from '@/shared/utils';
import { DetailRow } from '@/features/material/components/DetailRow';

interface ExportWarehouseReceiptItemsProps {
    materials: ExportReceiptItem[];
}

export const ExportWarehouseReceiptItems: React.FC<ExportWarehouseReceiptItemsProps> = ({
    materials,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            <View>
                {materials.map((item, index) => (
                    <View key={item.id || index} style={styles.materialCard}>
                        <View style={styles.materialHeader}>
                            <Text style={styles.materialHeaderTitle}>Vật tư {index + 1}</Text>
                        </View>

                        <View style={styles.content}>
                            <DetailRow
                                label={item.materialName || '---'}
                                value=" "
                                labelStyle={styles.materialName}
                                style={styles.detailRow}
                            />
                            <DetailRow
                                label="Số lượng:"
                                value={item.quantity}
                                style={styles.detailRow}
                            />
                            <DetailRow
                                label="Đơn giá:"
                                value={formatCurrency(item.costPrice || 0)}
                                style={styles.detailRow}
                            />
                            <DetailRow
                                label="Thành tiền:"
                                value={formatCurrencyValue(
                                    item.totalAmount || item.quantity * item.costPrice
                                )}
                                style={styles.detailRow}
                            />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {},
        materialCard: {
            backgroundColor: theme.background,
            borderRadius: borderRadius.sm,
            borderWidth: 1,
            borderColor: theme.border,
            marginBottom: spacing.md,
        },
        materialHeader: {
            paddingVertical: 12,
            paddingHorizontal: spacing.md,
            backgroundColor: theme.backgroundSecondary,
            borderTopLeftRadius: borderRadius.sm,
            borderTopRightRadius: borderRadius.sm,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        materialHeaderTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.text,
        },
        content: {
            paddingBottom: spacing.md,
            paddingTop: 12,
            gap: spacing.sm,
        },
        nameRow: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
        },
        materialName: {
            fontSize: 14,
            color: theme.text,
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
        footer: {
            paddingHorizontal: spacing.md,
        },
        detailRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: spacing.md,
        },
        detailLabel: {
            fontWeight: '400',
            fontSize: 14,
            color: theme.text,
            flex: 1,
        },
        detailValue: {
            fontSize: 14,
            color: theme.text,
            fontWeight: '500',
        },
    });
