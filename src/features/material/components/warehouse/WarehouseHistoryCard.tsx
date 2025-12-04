import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    LayoutAnimation,
    UIManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface HistoryMaterialItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
    unit?: string;
}

interface WarehouseHistoryCardProps {
    importDate: string;
    createdDate: string;
    totalItems: number;
    totalValue: string; // Pre-formatted string like "5 Triệu đ" or number
    supplier?: string;
    materials?: HistoryMaterialItem[];
}

export const WarehouseHistoryCard: React.FC<WarehouseHistoryCardProps> = ({
    importDate,
    createdDate,
    totalItems,
    totalValue,
    supplier,
    materials = [],
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('vi-VN') + ' đ';
    };

    return (
        <View style={styles.container}>
            {/* Header Info Section */}
            <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={styles.label}>Nhập kho:</Text>
                    <Text style={styles.value}>{importDate}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Tạo phiếu:</Text>
                    <Text style={styles.value}>{createdDate}</Text>
                </View>
            </View>

            <View style={styles.separator} />

            {/* Summary Section */}
            <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={styles.label}>Tổng hàng hoá:</Text>
                    <Text style={styles.value}>{totalItems}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Tổng giá trị:</Text>
                    <Text style={styles.value}>{totalValue}</Text>
                </View>

                {isExpanded && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Nhà cung cấp:</Text>
                        <Text style={styles.value}>{supplier || '---'}</Text>
                    </View>
                )}
            </View>

            {/* Expanded Content: Material List */}
            {isExpanded && (
                <View style={styles.expandedContent}>
                    {materials.map((item, index) => (
                        <View key={item.id || index} style={styles.materialCard}>
                            <View style={styles.materialHeader}>
                                <Text style={styles.materialIndex}>Vật tư {index + 1}</Text>
                            </View>
                            <View style={styles.materialBody}>
                                <Text style={styles.materialName}>{item.name}</Text>

                                <View style={styles.materialRow}>
                                    <Text style={styles.materialDetailText}>
                                        Số lượng: <Text style={styles.materialDetailValue}>{item.quantity}</Text>
                                    </Text>
                                    <Text style={styles.materialDetailText}>
                                        Đơn giá: <Text style={styles.materialDetailValue}>{formatCurrency(item.price)}</Text>
                                    </Text>
                                </View>

                                <View style={[styles.materialRow, { marginTop: spacing.xs }]}>
                                    <Text style={styles.materialDetailText}>Thành tiền:</Text>
                                    <Text style={styles.materialTotalValue}>{formatCurrency(item.total)}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Toggle Button */}
            <TouchableOpacity
                style={styles.toggleButton}
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <Text style={styles.toggleText}>
                    {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                </Text>
                <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.primary || '#007AFF'}
                    style={{ marginLeft: 4 }}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        padding: spacing.md,
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
    },
    section: {
        gap: spacing.xs,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    separator: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: spacing.md,
    },
    expandedContent: {
        marginTop: spacing.md,
        gap: spacing.md,
    },
    materialCard: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
    },
    materialHeader: {
        backgroundColor: '#F9FAFB',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    materialIndex: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    materialBody: {
        padding: spacing.md,
        gap: spacing.xs,
    },
    materialName: {
        fontSize: 15,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    materialRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    materialDetailText: {
        fontSize: 14,
        color: colors.text,
    },
    materialDetailValue: {
        fontWeight: '500',
    },
    materialTotalValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
        paddingTop: spacing.xs,
    },
    toggleText: {
        fontSize: 14,
        color: colors.primary || '#007AFF',
        fontWeight: '500',
    },
});
