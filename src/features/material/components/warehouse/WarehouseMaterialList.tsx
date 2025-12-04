import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { WarehouseReceiptItems } from './WarehouseReceiptItems';
import Ionicons from 'react-native-vector-icons/Ionicons';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface WarehouseMaterialListProps {
    receipts: any[];
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
        return value.toLocaleString('vi-VN') + ' đ';
    };

    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const renderItem = ({ item }: { item: any }) => {
        const isExpanded = expandedIds.includes(item.id);

        return (
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    {/* Header Info */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Nhập kho:</Text>
                        <Text style={styles.value}>{formatDate(item.date)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tạo phiếu:</Text>
                        <Text style={styles.value}>{formatDate(item.date)}</Text>
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

                        <WarehouseReceiptItems
                            materials={item.materials}
                        />
                    </View>
                )}

                {/* Expand Button */}
                <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => toggleExpand(item.id)}
                >
                    <Text style={styles.expandText}>{isExpanded ? "Thu gọn" : "Xem thêm"}</Text>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
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
        paddingBottom: spacing.xs,
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
