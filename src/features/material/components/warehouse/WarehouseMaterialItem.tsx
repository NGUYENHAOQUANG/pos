import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, UIManager } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MaterialGroup } from '@/features/material/components/MaterialTag';
import { ButtonMaterialList } from '@/features/material/components/material_form/ButtonMaterialList';
import { colors, spacing, borderRadius } from '@/styles';
import { useMaterial } from '@/features/material/hooks/useMaterials';
import { IWarehouseItem } from '@/features/material/types/warehouse.types';
import EditIcon from '@/assets/Icon/IconFarm/Edit.svg';
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

                <View style={styles.separator} />

                {/* Status Field */}
                {showStatus && (
                    <View style={styles.detailRow}>
                        <DetailRow
                            label="Trạng thái:"
                            value={detail?.isActive !== false ? 'Hoạt động' : 'Ngưng'}
                        />
                    </View>
                )}

                {/* Basic Info Row */}
                <View
                    style={[
                        styles.infoRow,
                        isExpanded ? { marginBottom: 0 } : { marginBottom: 12 },
                    ]}
                >
                    <Text style={styles.infoText}>
                        <Text style={styles.label}>Đơn vị tính: </Text>
                        <Text style={styles.detailValue}>{detail?.unitName || item.unitName}</Text>
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
                        <ButtonMaterialList
                            title="Sửa thông tin"
                            icon={<EditIcon />}
                            style={styles.editButton}
                        />
                    </View>
                )}

                {/* Expand Toggle */}
                {!alwaysExpanded && (
                    <TouchableOpacity
                        style={styles.expandToggle}
                        onPress={() => setIsExpanded(!isExpanded)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.expandText}>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</Text>
                        <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                )}

                {!alwaysExpanded && <View style={styles.separator} />}

                {/* Action Buttons */}
                {(onHistoryPress || onAdjustmentPress) && (
                    <View style={styles.actionRow}>
                        {onHistoryPress && (
                            <ButtonMaterialList
                                title="Lịch sử nhập kho"
                                onPress={() => onHistoryPress(item)}
                                style={[
                                    styles.actionButton,
                                    !onAdjustmentPress ? { flex: 0, minWidth: '48%' } : undefined,
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
        );
    },
    arePropsEqual
);

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        marginHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    name: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
        flex: 1,
        marginRight: spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.md,
    },
    infoText: {
        fontSize: 14,
        color: colors.text,
    },
    label: {
        fontWeight: '400',
        fontSize: 14,
        color: colors.text,
    },
    detailRow: {
        marginBottom: 12,
        gap: 12,
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
        marginTop: spacing.sm,
        marginBottom: spacing.md,
    },
    expandText: {
        fontSize: 12,
        color: colors.primary,
        marginRight: 4,
        fontWeight: '500',
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: spacing.md,
    },
    actionButton: {
        flex: 1,
    },
    spacer: {
        width: spacing.md,
    },
    separator: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginHorizontal: -spacing.md,
    },
    separatorCenter: {
        backgroundColor: colors.borderLight,
    },
});
