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
import { formatCurrencyValue } from '@/shared/utils/formatters';
import { formatMaterialDateTime } from '@/features/material/utils/dateUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
    IExportWarehouseReceipt,
    MaterialGroupType,
} from '@/features/material/types/material.types';
import { ExportWarehouseReceiptItems } from '@/features/material/components/warehouse/ExportWarehouseReceiptItems';

import { MaterialGroup } from '@/features/material/components/material/MaterialGroup';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

import { RefreshControl } from 'react-native';
import { ImportReceiptSkeleton } from '@/features/material/components/warehouse/ImportReceiptSkeleton';

interface ExportWarehouseMaterialListProps {
    receipts: IExportWarehouseReceipt[];
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
}

export const ExportWarehouseMaterialList: React.FC<ExportWarehouseMaterialListProps> = ({
    receipts,
    isLoading,
    refreshing,
    onRefresh,
}) => {
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    const toggleExpand = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedIds.includes(id)) {
            setExpandedIds(expandedIds.filter(i => i !== id));
        } else {
            setExpandedIds([...expandedIds, id]);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <FlatList
                    data={[1, 2, 3, 4, 5]}
                    renderItem={() => <ImportReceiptSkeleton />}
                    keyExtractor={item => item.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        );
    }

    const getStatusLabel = (status?: string): MaterialGroupType => {
        // Map API status to MaterialGroup display/color keys
        switch (status) {
            case 'Draft':
                return MaterialGroupType.DRAFT;
            case 'Pending':
                return MaterialGroupType.PENDING;
            case 'Approved':
                return MaterialGroupType.COMPLETED;
            case 'Rejected':
                return MaterialGroupType.REJECTED;
            default:
                // Return raw status if unknown, so we don't hide new API statuses as 'Draft'
                return (status as MaterialGroupType) || MaterialGroupType.DRAFT;
        }
    };

    const renderItem = ({ item }: { item: IExportWarehouseReceipt }) => {
        const isExpanded = expandedIds.includes(item.id);

        return (
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    {/* Header Info */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Trạng thái:</Text>
                        <MaterialGroup group={getStatusLabel(item.status)} />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Xuất kho:</Text>
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
                        <Text style={styles.value}>
                            {item.totalItems ?? item.materials?.length ?? 0}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tổng giá trị:</Text>
                        <Text style={styles.value}>
                            {formatCurrencyValue(item.totalAmount)}{' '}
                            <Text style={{ textDecorationLine: 'underline' }}>đ</Text>
                        </Text>
                    </View>

                    {/* Farm Info - Visible when Expanded */}
                    {isExpanded && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Ao yêu cầu:</Text>
                            <Text style={styles.value}>{item.farm || '---'}</Text>
                        </View>
                    )}

                    {/* Edit Button (Only for Draft or if status is undefined/Draft-like) */}
                    {(item.status === 'Draft' || !item.status) && (
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => {
                                // Handle edit logic
                            }}
                        >
                            <Text style={styles.editButtonText}>Sửa thông tin</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Expanded Details */}
                {isExpanded && (
                    <View style={styles.detailsContainer}>
                        <ExportWarehouseReceiptItems materials={item.materials} />
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
        <View style={styles.container}>
            <FlatList
                data={receipts}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
                    ) : undefined
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
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
    customerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    editButton: {
        marginTop: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
    },
    editButtonText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
});
