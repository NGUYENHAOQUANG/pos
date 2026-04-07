import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors, spacing, borderRadius } from '@/styles';
import TrashIcon from '@/assets/Icon/IconMenu/Trash.svg';
import { DropdownWarehouseItem } from './DropdownWarehouseItem';
import { Input, InputFormat } from '@/shared/components/forms/Input';
import { DetailRow } from '@/features/material/components/DetailRow';
import { InventoryItem } from './InventoryMaterialList';
import { IWarehouseItem } from '@/features/material/types/warehouse.types';

interface InventoryMaterialItemProps {
    item: InventoryItem;
    index: number;
    /** Warehouse ID for fetching items in the dropdown */
    warehouseId?: string;
    /** IDs of materials already selected by other rows */
    usedMaterialIds: Set<string>;
    onUpdateItem: (id: string, field: keyof InventoryItem, value: any) => void;
    onRemoveItem: (id: string) => void;
}

export const InventoryMaterialItem: React.FC<InventoryMaterialItemProps> = React.memo(
    ({ item, index, warehouseId, usedMaterialIds, onUpdateItem, onRemoveItem }) => {
        const theme = useAppTheme();
        const styles = getStyles(theme);
        const roundTo5 = (n: number) => parseFloat(n.toFixed(5));
        const oldStock = roundTo5(item.oldStock);
        const diff = roundTo5(
            item.newStock ? Number(item.newStock) - item.oldStock : -item.oldStock
        );

        const handleMaterialChange = React.useCallback(
            (materialId: string, warehouseItem: IWarehouseItem) => {
                onUpdateItem(item.id, 'materialId', materialId);
                onUpdateItem(item.id, 'materialName', warehouseItem.materialName || '');
                onUpdateItem(item.id, 'oldStock', warehouseItem.quantity || 0);
                onUpdateItem(item.id, 'unit', warehouseItem.unitName || '');
            },
            [item.id, onUpdateItem]
        );

        return (
            <View style={styles.materialWrapper}>
                <View style={styles.materialCard}>
                    <View style={styles.materialHeader}>
                        <Text style={styles.materialHeaderTitle}>Vật tư {index + 1}</Text>
                        <TouchableOpacity
                            onPress={() => onRemoveItem(item.id)}
                            style={styles.trashButton}
                        >
                            <TrashIcon width={16} height={16} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        {/* Material Selection */}
                        <View style={styles.inputGroup}>
                            <DropdownWarehouseItem
                                label="Tên vật tư​"
                                required
                                value={item.materialId}
                                displayValue={item.materialName}
                                onChange={handleMaterialChange}
                                placeholder="Chọn vật tư​"
                                warehouseId={warehouseId}
                                excludeIds={usedMaterialIds}
                            />
                        </View>

                        {/* Stock Info */}
                        <View>
                            <DetailRow
                                label="Tồn kho cũ:"
                                value={`${oldStock} ${item.unit || ''}`}
                                style={styles.stockRow}
                            />

                            <Input
                                label="Tồn kho mới"
                                required
                                value={item.newStock}
                                onChangeText={val => onUpdateItem(item.id, 'newStock', val)}
                                inputFormat={InputFormat.DECIMAL}
                                containerStyle={styles.noMarginBottom}
                                suffix={item.unit}
                            />
                        </View>

                        {/* Difference Footer */}
                        <DetailRow
                            label="Tổng chênh lệch:"
                            value={`${diff > 0 ? `+${diff}` : diff} ${item.unit || ''}`}
                            valueStyle={diff < 0 ? styles.diffNegative : styles.diffPositive}
                            style={styles.footer}
                        />
                    </View>
                </View>
            </View>
        );
    }
);

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        materialWrapper: {
            marginBottom: spacing.md,
        },
        materialCard: {
            backgroundColor: theme.background,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: theme.border,
        },
        materialHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderLight,
            backgroundColor: theme.backgroundPrimary,
            borderTopLeftRadius: borderRadius.md,
            borderTopRightRadius: borderRadius.md,
        },
        materialHeaderTitle: {
            fontSize: 15,
            fontWeight: '600',
            color: theme.text,
        },
        trashButton: {
            width: 32,
            height: 32,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: borderRadius.full,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.background,
        },
        content: {
            padding: spacing.md,
        },
        inputGroup: {
            marginBottom: 12,
        },
        stockRow: {
            marginBottom: 12,
        },
        footer: {
            marginTop: 12,
        },
        diffNegative: {
            color: theme.error,
            fontWeight: '600',
        },
        diffPositive: {
            color: theme.success,
            fontWeight: '600',
        },
        noMarginBottom: {
            marginBottom: 0,
        },
    });
