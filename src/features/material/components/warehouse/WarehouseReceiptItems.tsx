import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';

export interface MaterialItem {
    id: string;
    materialName: string;
    quantity: string;
    price: string;
}

interface WarehouseReceiptItemsProps {
    materials: MaterialItem[];
}

export const WarehouseReceiptItems: React.FC<WarehouseReceiptItemsProps> = ({
    materials,
}) => {
    const formatCurrency = (value: number) => {
        return value.toLocaleString('vi-VN') + ' đ';
    };

    return (
        <View style={styles.container}>
            {materials.map((item, index) => {
                const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0);

                return (
                    <View key={item.id} style={styles.materialCard}>
                        {/* Header */}
                        <View style={styles.materialHeader}>
                            <Text style={styles.materialHeaderTitle}>Vật tư {index + 1}</Text>
                        </View>

                        <View style={styles.content}>
                            {/* Material Name - No Label */}
                            <View style={styles.nameRow}>
                                <Text style={styles.materialName}>{item.materialName}</Text>
                            </View>

                            {/* Quantity and Price */}
                            <View style={styles.detailsRow}>
                                <View style={styles.detailItem}>
                                    <View style={styles.detailContent}>
                                        <Text style={styles.label}>Số lượng: </Text>
                                        <Text style={styles.value}>{item.quantity}</Text>
                                    </View>
                                </View>
                                <View style={styles.detailItem}>
                                    <View style={[styles.detailContent, { justifyContent: 'flex-end' }]}>
                                        <Text style={styles.label}>Đơn giá: </Text>
                                        <Text style={styles.value}>{formatCurrency(parseFloat(item.price) || 0)}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Total Amount */}
                            <View style={styles.footer}>
                                <Text style={styles.footerLabel}>Thành tiền:</Text>
                                <Text style={styles.footerValue}>{formatCurrency(itemTotal)}</Text>
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
        borderColor: '#E5E7EB',
        marginBottom: spacing.md,
    },
    materialHeader: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: '#F9FAFB',
        borderTopLeftRadius: borderRadius.md,
        borderTopRightRadius: borderRadius.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    materialHeaderTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    content: {
        padding: spacing.md,
    },
    nameRow: {
        marginBottom: spacing.md,
    },
    materialName: {
        fontSize: 15,
        color: colors.text,
        fontWeight: '400',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
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
    },
    footerLabel: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '600',
    },
    footerValue: {
        fontSize: 15,
        color: colors.text,
        fontWeight: '400',
    },
});
