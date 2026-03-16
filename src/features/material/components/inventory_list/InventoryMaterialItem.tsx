import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import TrashIcon from '@/assets/Icon/IconMenu/Trash.svg';
import { DropdownMaterial, DropdownOption } from '@/features/material/components/DropdownMaterial';
import { Input, InputFormat } from '@/shared/components/forms/Input';
import { numericStringSchema } from '@/shared/utils/validation';
import { InventoryItem } from '../inventory/InventoryMaterialList';

interface InventoryMaterialItemProps {
    item: InventoryItem;
    index: number;
    availableOptions: DropdownOption[];
    isDropdownOpen: boolean;
    onUpdateItem: (id: string, field: keyof InventoryItem, value: any) => void;
    onRemoveItem: (id: string) => void;
    handleToggleDropdown: (id: string, index: number) => void;
}

export const InventoryMaterialItem: React.FC<InventoryMaterialItemProps> = React.memo(
    ({
        item,
        index,
        availableOptions,
        isDropdownOpen,
        onUpdateItem,
        onRemoveItem,
        handleToggleDropdown,
    }) => {
        const diff = item.newStock ? Number(item.newStock) - item.oldStock : -item.oldStock;

        return (
            <View
                style={[
                    styles.materialWrapper,
                    isDropdownOpen ? styles.zIndexHigh : styles.zIndexNormal,
                ]}
            >
                <View style={styles.materialCard}>
                    <View style={styles.materialHeader}>
                        <Text style={styles.materialHeaderTitle}>Vật tư {index + 1}</Text>
                        <TouchableOpacity
                            onPress={() => onRemoveItem(item.id)}
                            style={styles.trashButton}
                        >
                            <TrashIcon width={16} height={16} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        {/* Material Selection */}
                        <View style={[styles.inputGroup, styles.zIndexMedium]}>
                            <DropdownMaterial
                                label="Tên vật tư"
                                required
                                value={item.materialId}
                                options={availableOptions}
                                onChange={val => onUpdateItem(item.id, 'materialId', val)}
                                placeholder="Chọn vật tư"
                                showAllOption={false}
                                isOpen={isDropdownOpen}
                                onToggle={() => handleToggleDropdown(item.id, index)}
                                displayValue={item.materialName}
                            />
                        </View>

                        {/* Stock Info */}
                        <View style={styles.zIndexNormal}>
                            <View style={styles.stockRow}>
                                <Text style={styles.label}>Tồn kho cũ:</Text>
                                <Text style={styles.oldStockValue}>
                                    {item.oldStock} {item.unit || ''}
                                </Text>
                            </View>

                            <Input
                                label="Tồn kho mới"
                                required
                                value={item.newStock}
                                onChangeText={val => {
                                    const normalizedText = val.replace(/,/g, '.');
                                    if (numericStringSchema.safeParse(normalizedText).success) {
                                        onUpdateItem(item.id, 'newStock', normalizedText);
                                    }
                                }}
                                keyboardType="numeric"
                                inputFormat={InputFormat.DECIMAL}
                                containerStyle={styles.noMarginBottom}
                                suffix={item.unit}
                            />
                        </View>

                        {/* Difference Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerLabel}>Tổng chênh lệch:</Text>
                            <Text
                                style={[
                                    styles.footerValue,
                                    diff < 0
                                        ? styles.footerValueNegative
                                        : styles.footerValuePositive,
                                ]}
                            >
                                {diff > 0 ? `+${diff}` : diff} {item.unit || ''}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
);

const styles = StyleSheet.create({
    materialWrapper: {
        marginBottom: spacing.md,
    },
    materialCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    materialHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[240],
        backgroundColor: colors.backgroundPrimary,
        borderTopLeftRadius: borderRadius.md,
        borderTopRightRadius: borderRadius.md,
    },
    materialHeaderTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    trashButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.gray[200],
        backgroundColor: colors.white,
    },
    content: {
        padding: spacing.md,
    },
    inputGroup: {
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.lg,
        marginBottom: 12,
    },
    stockRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '400',
    },
    oldStockValue: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    footerLabel: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
    footerValue: {
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'right',
    },
    footerValueNegative: {
        color: colors.red[900],
    },
    footerValuePositive: {
        color: colors.success,
    },
    noMarginBottom: {
        marginBottom: 0,
    },
    zIndexHigh: {
        zIndex: 100,
    },
    zIndexMedium: {
        zIndex: 20,
    },
    zIndexNormal: {
        zIndex: 10,
    },
});
