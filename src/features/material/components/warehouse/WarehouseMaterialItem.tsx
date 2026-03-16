import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, UIManager } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MaterialGroup } from '@/features/material/components/MaterialTag';
import { ButtonMaterialList } from '@/features/material/components/material_form/ButtonMaterialList';
import { colors, spacing } from '@/styles';
import { useMaterial } from '@/features/material/hooks/useMaterials';
import { IWarehouseItem } from '@/features/material/types/warehouse.types';
import { DetailRow } from '@/features/material/components/DetailRow';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface WarehouseMaterialItemProps {
    item: IWarehouseItem;
    onHistoryPress?: (item: IWarehouseItem) => void;
    onAdjustmentPress?: (item: IWarehouseItem) => void;
    hideRemaining?: boolean;
    alwaysExpanded?: boolean;
    showStatus?: boolean;
}

const arePropsEqual = (
    prevProps: WarehouseMaterialItemProps,
    nextProps: WarehouseMaterialItemProps
) => {
    const { item: prevItem } = prevProps;
    const { item: nextItem } = nextProps;

    return (
        prevItem.id === nextItem.id &&
        prevItem.quantity === nextItem.quantity &&
        prevItem.materialId === nextItem.materialId &&
        prevProps.hideRemaining === nextProps.hideRemaining &&
        prevProps.alwaysExpanded === nextProps.alwaysExpanded &&
        prevProps.showStatus === nextProps.showStatus
    );
};

export const WarehouseMaterialItem = React.memo<WarehouseMaterialItemProps>(
    ({ item, onHistoryPress, onAdjustmentPress, hideRemaining, alwaysExpanded, showStatus }) => {
        const [isExpanded, setIsExpanded] = useState(alwaysExpanded || false);

        // Fetch details for this material item using the hook
        const { data: detail } = useMaterial(item.materialId);

        return (
            <View style={styles.container}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                    <Text style={styles.name}>{detail?.name || item.materialName}</Text>
                    {detail?.group && <MaterialGroup group={detail.group} />}
                </View>

                {/* Body Content */}
                <View style={styles.bodyContainer}>
                    {/* Status Field */}
                    {showStatus && (
                        <DetailRow
                            label="Trạng thái:"
                            value={detail?.isActive !== false ? 'Hoạt động' : 'Ngưng'}
                        />
                    )}

                    {/* Basic Info Row */}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoText}>
                            <Text style={styles.label}>Đơn vị tính: </Text>
                            <Text style={styles.detailValue}>
                                {detail?.unitName || item.unitName}
                            </Text>
                        </Text>
                        {!hideRemaining && (
                            <Text style={styles.infoText}>
                                <Text style={styles.label}>Còn: </Text>
                                <Text style={styles.detailValue}>{item.quantity}</Text>
                            </Text>
                        )}
                    </View>

                    {/* Expanded Content */}
                    {isExpanded && (
                        <View style={styles.detailRow}>
                            {!alwaysExpanded && <View style={styles.separatorCenter} />}
                            <DetailRow label="Loại vật tư:" value={detail?.type} />
                            <DetailRow label="Nhà sản xuất:" value={detail?.manufacturer} />
                            <DetailRow label="Công dụng:" value={detail?.usage} />
                            <DetailRow label="Đơn vị sử dụng:" value={detail?.unitName} />
                            <DetailRow label="Liều dùng:" value={detail?.unitOfUse} />
                        </View>
                    )}

                    {/* Expand Toggle */}
                    {!alwaysExpanded && (
                        <TouchableOpacity
                            style={[styles.expandToggle, { marginTop: isExpanded ? 24 : 0 }]}
                            onPress={() => setIsExpanded(!isExpanded)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.expandText}>
                                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                            </Text>
                            <Ionicons
                                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                size={16}
                                color={colors.primary}
                            />
                        </TouchableOpacity>
                    )}

                    {/* Action Buttons */}
                    {(onHistoryPress || onAdjustmentPress) && (
                        <View style={styles.actionRow}>
                            {onHistoryPress && (
                                <ButtonMaterialList
                                    title="Lịch sử nhập kho"
                                    onPress={() => onHistoryPress(item)}
                                    style={[
                                        styles.actionButton,
                                        !onAdjustmentPress
                                            ? { flex: 0, minWidth: '48%' }
                                            : undefined,
                                    ]}
                                />
                            )}
                            {onHistoryPress && onAdjustmentPress && <View style={styles.spacer} />}
                            {onAdjustmentPress && (
                                <ButtonMaterialList
                                    title="Điều chỉnh tồn kho"
                                    onPress={() => onAdjustmentPress(item)}
                                    style={[
                                        styles.actionButton,
                                        !onHistoryPress ? { flex: 0, minWidth: '48%' } : undefined,
                                    ]}
                                />
                            )}
                        </View>
                    )}
                </View>
            </View>
        );
    },
    arePropsEqual
);

const styles = StyleSheet.create({
    container: {
        marginHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        gap: 4,
    },
    bodyContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        color: colors.gray[950],
        flex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoText: {
        fontSize: 14,
        color: colors.gray[500],
        lineHeight: 20,
    },
    label: {
        fontWeight: '400',
        fontSize: 14,
        color: colors.gray[500],
    },
    detailRow: {
        gap: 12,
    },
    detailLabel: {
        fontWeight: '400',
        fontSize: 14,
        color: colors.gray[500],
        flex: 1,
        lineHeight: 20,
    },
    detailValue: {
        fontSize: 14,
        color: colors.gray[950],
        fontWeight: '500',
        lineHeight: 20,
    },
    editButton: {
        marginTop: spacing.sm,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        alignSelf: 'stretch',
    },
    expandToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 12,
    },
    expandText: {
        fontSize: 14,
        color: colors.primary,
        marginRight: 4,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    actionButton: {
        flex: 1,
    },
    spacer: {
        width: 16,
    },
    separatorCenter: {
        backgroundColor: colors.borderLight,
    },
});
