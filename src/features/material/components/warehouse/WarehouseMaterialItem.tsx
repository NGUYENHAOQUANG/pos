import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MaterialGroup } from '@/features/material/components/material/MaterialGroup';
import { ButtonMaterialList } from '@/features/material/components/material/ButtonMaterialList';
import { colors, spacing, borderRadius } from '@/styles';
import { MaterialGroupType } from '@/features/material/types/material.types';
import { useMaterial } from '@/features/material/hooks/useMaterials';
import { IWarehouseItem } from '@/features/material/types/warehouse.types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface WarehouseMaterialItemProps {
    item: IWarehouseItem;
    onEdit?: (item: IWarehouseItem) => void;
    onHistoryPress?: (item: IWarehouseItem) => void;
    onAdjustmentPress?: (item: IWarehouseItem) => void;
    hideRemaining?: boolean;
    alwaysExpanded?: boolean;
    showStatus?: boolean;
}

export const WarehouseMaterialItem: React.FC<WarehouseMaterialItemProps> = ({
    item,
    onEdit,
    onHistoryPress,
    onAdjustmentPress,
    hideRemaining,
    alwaysExpanded,
    showStatus,
}) => {
    const [isExpanded, setIsExpanded] = useState(alwaysExpanded || false);

    // Fetch details for this material item using the hook
    const { data: detail } = useMaterial(item.materialId);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    return (
        <View style={styles.container}>
            {/* Header Row */}
            <View style={styles.headerRow}>
                <Text style={styles.name}>{detail?.name || item.materialName}</Text>
                <MaterialGroup group={detail?.group || MaterialGroupType.FARMING} />
            </View>

            <View style={styles.separator} />

            {/* Status Field */}
            {showStatus && (
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Trạng thái: </Text>
                    <Text
                        style={[
                            styles.detailValue,
                            {
                                color:
                                    detail?.isActive !== false
                                        ? colors.green[600]
                                        : colors.red[500],
                            },
                        ]}
                    >
                        {detail?.isActive !== false ? 'Hoạt động' : 'Ngưng'}
                    </Text>
                </View>
            )}

            {/* Basic Info Row */}
            <View style={styles.infoRow}>
                <Text style={styles.infoText}>
                    <Text style={styles.label}>Đơn vị tính: </Text>
                    {detail?.unitName || item.unitName}
                </Text>
                {!hideRemaining && (
                    <Text style={styles.infoText}>
                        <Text style={styles.label}>Còn: </Text>
                        {item.quantity}
                    </Text>
                )}
            </View>

            {/* Expanded Content */}
            {isExpanded && (
                <View>
                    {!alwaysExpanded && <View style={styles.separatorCenter} />}
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Loại vật tư: </Text>
                        <Text style={styles.detailValue}>{detail?.type || '---'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailValue}>
                            <Text style={styles.detailLabel}>Nhãn Hàng: </Text>
                            {detail?.manufacturer || '---'}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailValue}>
                            <Text style={styles.detailLabel}>Mô tả:</Text> {detail?.usage || '---'}
                        </Text>
                    </View>

                    {/* Edit Button */}
                    {onEdit && (
                        <ButtonMaterialList
                            title="Sửa thông tin"
                            onPress={() => onEdit(item)}
                            style={styles.editButton}
                        />
                    )}
                </View>
            )}

            {/* Expand Toggle */}
            {!alwaysExpanded && (
                <TouchableOpacity
                    style={styles.expandToggle}
                    onPress={toggleExpand}
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
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    name: {
        fontSize: 18,
        color: colors.text,
        flex: 1,
        marginRight: spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: spacing.sm,
    },
    infoText: {
        fontSize: 14,
        color: colors.text,
    },
    label: {
        fontWeight: '600',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: spacing.xs,
        flexWrap: 'wrap',
        marginTop: spacing.sm,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    detailValue: {
        fontSize: 14,
        color: colors.text,
        flex: 1,
    },
    editButton: {
        marginTop: spacing.sm,
    },
    expandToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: spacing.sm,
    },
    expandText: {
        fontSize: 14,
        color: colors.primary,
        marginRight: 4,
        fontWeight: '600',
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
        height: 1,
        backgroundColor: colors.borderLight,
    },
});
