import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import {
    DropdownMaterial,
    DropdownOption,
} from '@/features/material/components/material/DropdownMaterialGroup';
import { Input } from '@/shared/components/forms/Input';
import { numericStringSchema } from '@/shared/utils/validation';
import { InventoryItem } from './InventoryMaterialList';

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
                            style={styles.removeButton}
                        >
                            <Ionicons
                                name="close-circle-outline"
                                size={24}
                                color={colors.red[500]}
                            />
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
                        <View style={[styles.row, styles.zIndexNormal]}>
                            <View style={styles.col}>
                                <Text style={styles.label}>Tồn kho cũ:</Text>
                                <Text style={styles.oldStockValue}>
                                    {item.oldStock} {item.unit || ''}
                                </Text>
                            </View>

                            <View style={styles.dividerVertical} />

                            <View style={styles.col}>
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
                                    containerStyle={styles.noMarginBottom}
                                    suffix={item.unit}
                                />
                            </View>
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
        backgroundColor: colors.backgroundSecondary,
        borderTopLeftRadius: borderRadius.md,
        borderTopRightRadius: borderRadius.md,
    },
    materialHeaderTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    removeButton: {
        padding: 4,
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
    col: {
        flex: 1,
    },
    dividerVertical: {
        width: 1,
        height: '100%',
        backgroundColor: colors.gray[100],
    },
    label: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 8,
        fontWeight: '400',
        lineHeight: 24,
    },
    oldStockValue: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.text,
        marginTop: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.gray[100],
        paddingTop: spacing.sm,
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
