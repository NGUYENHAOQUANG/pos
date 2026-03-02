import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    LayoutAnimation,
    UIManager,
    Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { DropdownMaterial, DropdownOption } from './DropdownMaterial';
import { formatCurrency } from '@/features/material/utils/formatCurrency';
import { CollapseHead } from '@/shared/components/layout/CollapseHead';
import { Input } from '@/shared/components/forms/Input';
import { warehouseFormUtils } from '@/features/material/utils/warehouseFormUtils';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
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
    materialOptions?: DropdownOption[];
    onDropdownOpen?: (itemIndex: number) => void;
    title?: string; // Optional title prop
    isPriceDisabled?: boolean; // New prop to control price input state
}

export const AddWarehouseMaterial: React.FC<AddWarehouseMaterialProps> = ({
    materials,
    onUpdateMaterial,
    onAddMaterial,
    onRemoveMaterial,
    materialOptions = [],
    onDropdownOpen,
    title = 'Vật tư nhập kho', // Default value
    isPriceDisabled = false, // Default to false (editable)
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    // Store refs for each material item to measure position
    const itemRefs = React.useRef<{ [key: string]: View | null }>({});

    const handleToggleDropdown = (id: string, index: number) => {
        if (activeDropdownId === id) {
            setActiveDropdownId(null);
        } else {
            setActiveDropdownId(id);
            // Pass item index for stable scroll calculation
            onDropdownOpen?.(index);
        }
    };

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

    return (
        <View style={styles.mainMaterialCard}>
            <CollapseHead title={title} isExpanded={isExpanded} onToggle={toggleExpand} />

            {isExpanded && (
                <View style={styles.mainContent}>
                    {materials.map((item, index) => {
                        const itemTotal = warehouseFormUtils.calculateItemTotal(
                            item.quantity,
                            item.price
                        );
                        const displayTotal =
                            itemTotal > 0 ? formatCurrency(itemTotal) : 'Tổng tiền';
                        const isDropdownOpen = activeDropdownId === item.id;

                        const rowOptions = warehouseFormUtils.getAvailableDropdownOptions(
                            materials,
                            materialOptions,
                            index
                        );
                        const isOverStock = warehouseFormUtils.isQuantityOverStock(
                            item.quantity,
                            item.availableQuantity
                        );

                        return (
                            <View
                                key={item.id}
                                ref={ref => {
                                    itemRefs.current[item.id] = ref;
                                }}
                                style={[
                                    styles.materialWrapper,
                                    isDropdownOpen ? styles.zIndexHigh : styles.zIndexNormal,
                                ]}
                            >
                                <View style={styles.materialCard}>
                                    <View style={styles.materialHeader}>
                                        <Text style={styles.materialHeaderTitle}>
                                            Vật tư {index + 1}
                                        </Text>
                                        {onRemoveMaterial && (
                                            <TouchableOpacity
                                                style={styles.removeButton}
                                                onPress={() => onRemoveMaterial(item.id)}
                                                hitSlop={{
                                                    top: 10,
                                                    bottom: 10,
                                                    left: 10,
                                                    right: 10,
                                                }}
                                            >
                                                <Ionicons
                                                    name="close-circle-outline"
                                                    size={24}
                                                    color={colors.error}
                                                />
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    <View style={styles.content}>
                                        <View style={[styles.inputGroup, styles.zIndexMedium]}>
                                            <DropdownMaterial
                                                label="Tên vật tư"
                                                required
                                                value={item.materialId} // Use ID
                                                options={rowOptions} // { label, value: ID }
                                                onChange={val =>
                                                    onUpdateMaterial(item.id, 'materialId', val)
                                                }
                                                placeholder="Chọn vật tư"
                                                showAllOption={false}
                                                isOpen={isDropdownOpen}
                                                onToggle={() =>
                                                    handleToggleDropdown(item.id, index)
                                                }
                                            />
                                            {/* Show Available Quantity */}
                                            {item.materialId &&
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

                                        <View style={[styles.row, styles.zIndexNormal]}>
                                            <View style={styles.halfWidth}>
                                                <Input
                                                    label="Số lượng"
                                                    required
                                                    placeholder="Nhập số lượng"
                                                    value={item.quantity}
                                                    onChangeText={val =>
                                                        handleQuantityChange(item.id, val)
                                                    }
                                                    keyboardType="numeric"
                                                    containerStyle={styles.noMarginBottom}
                                                />
                                                {isOverStock && (
                                                    <Text style={styles.overStockText}>
                                                        Vượt quá tồn kho ({item.availableQuantity})
                                                    </Text>
                                                )}
                                            </View>

                                            <View style={styles.halfWidth}>
                                                <Input
                                                    label={
                                                        <Text>
                                                            Đơn giá (
                                                            <Text style={styles.currencyUnderline}>
                                                                đ
                                                            </Text>
                                                            )
                                                        </Text>
                                                    }
                                                    required
                                                    placeholder="Nhập đơn giá"
                                                    value={warehouseFormUtils.formatPriceInput(
                                                        item.price
                                                    )}
                                                    onChangeText={val =>
                                                        handlePriceChange(item.id, val)
                                                    }
                                                    keyboardType="numeric"
                                                    containerStyle={styles.noMarginBottom}
                                                    disabled={isPriceDisabled}
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.footer}>
                                            <Text style={styles.footerLabel}>Thành tiền:</Text>
                                            <Text
                                                style={[
                                                    styles.footerValue,
                                                    !itemTotal && styles.placeholderText,
                                                ]}
                                            >
                                                {displayTotal}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={onAddMaterial}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={24} color={colors.textSecondary} />
                        <Text style={styles.addButtonText}>Thêm vật tư</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    mainMaterialCard: {
        backgroundColor: colors.white,
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
        zIndex: 1,
    },
    mainContent: {
        padding: spacing.md,
        zIndex: 2,
        borderTopWidth: 1,
        borderTopColor: colors.gray[100],
    },
    materialWrapper: {
        marginBottom: spacing.md,
    },
    materialCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    materialHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#F9FAFB',
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
    labelContainer: {
        flexDirection: 'row',
        marginBottom: spacing.xs,
    },
    label: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
    required: {
        fontSize: 14,
        color: colors.error || '#FF4D4F',
    },
    row: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: 12,
    },
    halfWidth: {
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
    },
    innerInput: {
        flex: 1,
        height: '100%',
        fontSize: 15,
        color: colors.text,
        padding: 0,
        ...Platform.select({
            android: {
                textAlignVertical: 'center',
            },
            ios: {
                lineHeight: 24,
                paddingVertical: (44 - 24) / 2 - 2,
            },
        }),
    },
    unitText: {
        fontSize: 15,
        color: colors.text,
        marginLeft: spacing.xs,
        flexShrink: 0,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLabel: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
    footerValue: {
        fontSize: 14,
        color: '#FF4D4F',
        fontWeight: '500',
        textAlign: 'right',
        flex: 1,
        marginLeft: spacing.sm,
    },
    placeholderText: {
        color: colors.textSecondary || '#999',
        fontWeight: '400',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: borderRadius.md,
        marginTop: spacing.xs,
        zIndex: 1,
    },
    addButtonText: {
        fontSize: 15,
        color: colors.text,
        marginLeft: spacing.xs,
        fontWeight: '500',
    },
    // Styles for stock info
    stockInfoRow: {
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    stockInfoText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    stockQuantity: {
        color: colors.blue[600],
        fontWeight: '500',
    },
    // Styles for overstock warning
    overStockText: {
        fontSize: 12,
        color: colors.error,
        marginTop: 4,
    },
    // Currency underline
    currencyUnderline: {
        textDecorationLine: 'underline',
    },
    // No margin bottom for inputs
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
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    addNewText: {
        color: colors.blue[600],
        fontSize: 14,
        fontWeight: '500',
    },
});
