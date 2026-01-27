import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
} from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { formatCurrencyValue } from '@/shared/utils/formatters';
import { formatMaterialDateTime } from '@/features/material/utils/dateUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ImportReceiptSkeleton } from '@/features/material/components/warehouse/ImportReceiptSkeleton';
import { ImportReceipt } from '@/features/material/types/importReceipt.types';
import { IPaginate } from '@/shared/types/common.types';
import { MaterialEmptyState } from '@/features/material/components/EmptyStateCard';

interface ImportReceiptListProps {
    data: IPaginate<ImportReceipt> | undefined;
    onEndReached?: () => void;
    refreshing?: boolean;
    onRefresh?: () => void;
    isLoading?: boolean;
    onPressCreate?: () => void;
}

export const ImportReceiptList: React.FC<ImportReceiptListProps> = ({
    data,
    onEndReached,
    refreshing,
    onRefresh,
    isLoading,
    onPressCreate,
}) => {
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    const receipts = data?.items || [];

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

    const toggleExpand = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedIds.includes(id)) {
            setExpandedIds(expandedIds.filter(i => i !== id));
        } else {
            setExpandedIds([...expandedIds, id]);
        }
    };

    const renderItem = ({ item }: { item: ImportReceipt }) => {
        const isExpanded = expandedIds.includes(item.id);

        return (
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    {/* Header Info */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Nhập kho:</Text>
                        <Text style={styles.value}>
                            {item.createdAt ? formatMaterialDateTime(item.editedAt) : '---'}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tạo phiếu:</Text>
                        <Text style={styles.value}>
                            {item.createdAt ? formatMaterialDateTime(item.createdAt) : '---'}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Summary Info */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Tổng hàng hóa:</Text>
                        <Text style={styles.value}>{item.totalItems ?? '---'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tổng giá trị:</Text>
                        <Text style={styles.value}>
                            {item.totalAmount ? formatCurrencyValue(item.totalAmount) : '0'}{' '}
                            <Text style={{ textDecorationLine: 'underline' }}>đ</Text>
                        </Text>
                    </View>
                </View>

                {/* Expanded Details */}
                {isExpanded && (
                    <View style={styles.detailsContainer}>
                        {/* Supplier Info */}
                        <View style={styles.supplierRow}>
                            <Text style={styles.label}>Nhà cung cấp:</Text>
                            <Text style={styles.value}>{item.supplierName || '---'}</Text>
                        </View>
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
                contentContainerStyle={[
                    styles.listContainer,
                    receipts.length === 0 && styles.emptyContent,
                ]}
                showsVerticalScrollIndicator={false}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    <MaterialEmptyState tab="history" onPress={onPressCreate || (() => {})} />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.md,
    },
    listContainer: {
        paddingBottom: 100,
        flexGrow: 1,
    },
    emptyContent: {
        flex: 1,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        ...Platform.select({
            ios: {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 0.4 },
                shadowOpacity: 0.1,
                shadowRadius: 1,
            },
            android: {
                elevation: 1,
            },
        }),
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
