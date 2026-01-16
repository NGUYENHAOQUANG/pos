import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { WarehouseReceiptItems } from './WarehouseReceiptItems';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { IWarehouseReceipt } from '@/features/material/types/material.types';
import { formatCurrencyValue } from '@/shared/utils/formatters';
import { formatMaterialDateTime } from '@/features/material/utils/dateUtils';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface WarehouseMaterialListProps {
    receipts: IWarehouseReceipt[];
}

export const WarehouseMaterialList: React.FC<WarehouseMaterialListProps> = ({ receipts }) => {
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    const toggleExpand = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedIds.includes(id)) {
            setExpandedIds(expandedIds.filter(i => i !== id));
        } else {
            setExpandedIds([...expandedIds, id]);
        }
    };

    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            const millions = parseFloat((value / 1000000).toFixed(6));
            return (
                <>
                    {formatCurrencyValue(millions)} Triệu{' '}
                    <Text style={{ textDecorationLine: 'underline' }}>đ</Text>
                </>
            );
        }
        return (
            <>
                {formatCurrencyValue(value)}{' '}
                <Text style={{ textDecorationLine: 'underline' }}>đ</Text>
            </>
        );
    };

    const renderItem = ({ item }: { item: IWarehouseReceipt }) => {
        const isExpanded = expandedIds.includes(item.id);

        return (
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    {/* Header Info */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Nhập kho:</Text>
                        <Text style={styles.value}>{formatMaterialDateTime(item.date)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tạo phiếu:</Text>
                        <Text style={styles.value}>{formatMaterialDateTime(item.date)}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Summary Info */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Tổng hàng hoá:</Text>
                        <Text style={styles.value}>{item.materials.length}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tổng giá trị:</Text>
                        <Text style={styles.value}>{formatCurrency(item.totalAmount)}</Text>
                    </View>
                </View>

                {/* Expanded Details */}
                {isExpanded && (
                    <View style={styles.detailsContainer}>
                        {/* Supplier Info */}
                        <View style={styles.supplierRow}>
                            <Text style={styles.label}>Nhà cung cấp:</Text>
                            <Text style={styles.value}>{item.supplier || '---'}</Text>
                        </View>

                        <WarehouseReceiptItems materials={item.materials} />
                    </View>
                )}

                {/* Expand Button */}
                <TouchableOpacity style={styles.expandButton} onPress={() => toggleExpand(item.id)}>
                    <Text style={styles.expandText}>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</Text>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={colors.primary}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <FlatList
            data={receipts}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
        />
    );
};

const styles = StyleSheet.create({
    listContainer: {
        paddingBottom: 100,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
        overflow: 'hidden',
        paddingBottom: spacing.sm,
    },
    cardContent: {
        padding: spacing.md,
        paddingBottom: 0,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
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
        maxWidth: '60%',
        textAlign: 'right',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: spacing.sm,
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        gap: 4,
    },
    expandText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '500',
    },
    detailsContainer: {
        backgroundColor: colors.white,
    },
    supplierRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
});
