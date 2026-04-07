import React from 'react';
import { View, StyleSheet, TouchableOpacity, UIManager, Platform } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors, spacing, borderRadius } from '@/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button } from '@/shared/components/buttons/Button';
import { DropdownMaterialItem } from '@/features/material/components/DropdownMaterialItem';
import { DropdownWarehouseItem } from '@/features/material/components/inventory/DropdownWarehouseItem';
import { CurrencyValue } from '@/features/material/components/CurrencyValue';
import { DetailRow } from '@/features/material/components/DetailRow';
import { CollapseHead } from '@/shared/components/layout/CollapseHead';
import { Input, InputFormat } from '@/shared/components/forms/Input';
import { warehouseFormUtils } from '@/features/material/utils/warehouseFormUtils';
import TrashIcon from '@/assets/Icon/IconMenu/Trash.svg';
import { IMaterial } from '@/features/material/types/material.types';
import { IWarehouseItem } from '@/features/material/types/warehouse.types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export enum WarehouseFormType {
    ImportReceipt = 'ImportReceipt',
    ExportWarehouse = 'ExportWarehouse',
}

export interface MaterialItem {
    id: string;
    materialId?: string;
    materialName: string;
    quantity: string;
    price: string;
    availableQuantity?: number;
    unit?: string;
}

interface AddWarehouseMaterialProps {
    materials: MaterialItem[];
    onUpdateMaterial: (id: string, field: keyof MaterialItem, value: any) => void;
    onAddMaterial: () => void;
    onRemoveMaterial?: (id: string) => void;
    title?: string;
    isPriceDisabled?: boolean;
    warehouseId?: string;
    formType?: WarehouseFormType;
}

export const AddWarehouseMaterial: React.FC<AddWarehouseMaterialProps> = ({
    materials,
    onUpdateMaterial,
    onAddMaterial,
    onRemoveMaterial,
    title = 'Vật tư nhập kho',
    isPriceDisabled = false,
    warehouseId,
    formType = WarehouseFormType.ImportReceipt,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const handleQuantityChange = React.useCallback(
        (id: string, val: string) => {
            const cleanVal = warehouseFormUtils.sanitizeNumericInput(val, 'quantity');
            if (cleanVal !== null) {
                onUpdateMaterial(id, 'quantity', cleanVal);
            }
        },
        [onUpdateMaterial]
    );

    const handlePriceChange = React.useCallback(
        (id: string, val: string) => {
            const cleanVal = warehouseFormUtils.sanitizeNumericInput(val, 'price');
            if (cleanVal !== null) {
                onUpdateMaterial(id, 'price', cleanVal);
            }
        },
        [onUpdateMaterial]
    );

    const handleWarehouseItemSelect = React.useCallback(
        (itemId: string, materialId: string, warehouseItem: IWarehouseItem) => {
            onUpdateMaterial(itemId, 'materialId', materialId);
            onUpdateMaterial(itemId, 'materialName', warehouseItem.materialName || '');
            onUpdateMaterial(itemId, 'unit', warehouseItem.unitName || '');
            onUpdateMaterial(itemId, 'price', (warehouseItem.averagePrice ?? 0).toString());
            onUpdateMaterial(itemId, 'availableQuantity', warehouseItem.quantity || 0);
        },
        [onUpdateMaterial]
    );

    const handleMaterialSelect = React.useCallback(
        (itemId: string, materialId: string, material: IMaterial) => {
            onUpdateMaterial(itemId, 'materialId', materialId);
            onUpdateMaterial(itemId, 'materialName', material.name);
            if (material.unitName) {
                onUpdateMaterial(itemId, 'unit', material.unitName);
            }
        },
        [onUpdateMaterial]
    );

    return (
        <View style={styles.mainMaterialCard}>
            <CollapseHead title={title} />

            <View style={styles.mainContent}>
                {materials.map((item, index) => {
                    const itemTotal = warehouseFormUtils.calculateItemTotal(
                        item.quantity,
                        item.price
                    );
                    const displayTotal = 'Vui lòng nhập số lượng và đơn giá';
                    const isExportForm = formType === WarehouseFormType.ExportWarehouse;
                    const isOverStock = isExportForm
                        ? warehouseFormUtils.isQuantityOverStock(
                              item.quantity,
                              item.availableQuantity
                          )
                        : false;

                    return (
                        <View key={item.id} style={styles.materialWrapper}>
                            <View style={styles.materialCard}>
                                <View style={styles.materialHeader}>
                                    <Text style={styles.materialHeaderTitle}>
                                        Vật tư {index + 1}
                                    </Text>
                                    {onRemoveMaterial && (
                                        <TouchableOpacity
                                            onPress={() => onRemoveMaterial(item.id)}
                                            style={styles.trashButton}
                                        >
                                            <TrashIcon width={16} height={16} color={theme.text} />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <View style={styles.content}>
                                    <View style={styles.inputGroup}>
                                        {warehouseId ? (
                                            <DropdownWarehouseItem
                                                label={'Tên vật tư '}
                                                required
                                                value={item.materialId}
                                                displayValue={item.materialName}
                                                warehouseId={warehouseId}
                                                onChange={(
                                                    materialId: string,
                                                    warehouseItem: IWarehouseItem
                                                ) =>
                                                    handleWarehouseItemSelect(
                                                        item.id,
                                                        materialId,
                                                        warehouseItem
                                                    )
                                                }
                                                placeholder="Chọn vật tư​"
                                            />
                                        ) : (
                                            <DropdownMaterialItem
                                                label={'Tên vật tư\u200B'}
                                                required
                                                value={item.materialId}
                                                displayValue={item.materialName}
                                                onChange={(
                                                    materialId: string,
                                                    material: IMaterial
                                                ) =>
                                                    handleMaterialSelect(
                                                        item.id,
                                                        materialId,
                                                        material
                                                    )
                                                }
                                                placeholder="Chọn vật tư​"
                                            />
                                        )}

                                        <Input
                                            label="Số lượng"
                                            required
                                            placeholder="Nhập số lượng"
                                            value={item.quantity}
                                            onChangeText={val => handleQuantityChange(item.id, val)}
                                            keyboardType="numeric"
                                            inputFormat={InputFormat.DECIMAL}
                                            maxDecimalPlaces={5}
                                            maxLength={20}
                                            containerStyle={styles.noMarginBottom}
                                            suffix={item.unit}
                                            hint={
                                                isOverStock
                                                    ? `Vượt quá tồn kho (${item.availableQuantity})`
                                                    : undefined
                                            }
                                        />

                                        <Input
                                            label="Đơn giá"
                                            required
                                            placeholder="Nhập đơn giá"
                                            value={warehouseFormUtils.formatPriceInput(item.price)}
                                            onChangeText={val => handlePriceChange(item.id, val)}
                                            keyboardType="numeric"
                                            inputFormat={
                                                isPriceDisabled
                                                    ? InputFormat.DECIMAL
                                                    : InputFormat.INTEGER
                                            }
                                            maxLength={26}
                                            containerStyle={styles.noMarginBottom}
                                            disabled={isPriceDisabled}
                                            suffix="đ"
                                        />

                                        {/* Show Available Quantity — only for Export */}
                                        {isExportForm &&
                                            item.materialId &&
                                            item.availableQuantity !== undefined && (
                                                <View style={styles.stockInfoRow}>
                                                    <Text style={styles.stockInfoText}>
                                                        Tồn kho:{' '}
                                                        <Text style={styles.stockQuantity}>
                                                            {item.availableQuantity} {item.unit}
                                                        </Text>
                                                    </Text>
                                                </View>
                                            )}
                                    </View>

                                    <DetailRow
                                        label="Thành tiền:"
                                        value={
                                            itemTotal ? (
                                                <CurrencyValue value={itemTotal} />
                                            ) : (
                                                <Text style={styles.placeholderText}>
                                                    {displayTotal}
                                                </Text>
                                            )
                                        }
                                    />
                                </View>
                            </View>
                        </View>
                    );
                })}

                <Button
                    title="Thêm vật tư​"
                    variant="outline"
                    onPress={onAddMaterial}
                    renderLeftIcon={<Ionicons name="add" size={20} color={theme.text} />}
                    fullWidth
                    style={styles.addButton}
                    textStyle={styles.addButtonText}
                />
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        mainMaterialCard: {
            backgroundColor: theme.background,
            marginHorizontal: spacing.md,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: theme.border,
            zIndex: 1,
        },
        mainContent: {
            paddingHorizontal: 12,
            paddingBottom: 12,
            zIndex: 2,
        },
        materialWrapper: {
            marginBottom: 12,
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
            gap: spacing.md,
        },
        placeholderText: {
            fontSize: 15,
            color: theme.textSecondary,
            fontWeight: '600',
        },
        addButton: {
            borderColor: theme.border,
            marginTop: spacing.xs,
        },
        addButtonText: {
            fontSize: 15,
            color: theme.text,
            fontWeight: '500',
        },
        stockInfoRow: {
            marginTop: 4,
            flexDirection: 'row',
            alignItems: 'center',
        },
        stockInfoText: {
            fontSize: 13,
            color: theme.textSecondary,
        },
        stockQuantity: {
            color: theme.info,
            fontWeight: '500',
        },
        noMarginBottom: {
            marginBottom: 0,
        },
    });
