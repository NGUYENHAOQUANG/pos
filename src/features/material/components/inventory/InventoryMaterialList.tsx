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
import { DropdownMaterial, DropdownOption } from '../material/DropdownMaterialGroup';
import { CollapseHead } from '@/shared/components/layout/CollapseHead';
import { numericStringSchema } from '@/shared/utils/validation';
import { Input } from '@/shared/components/forms/Input';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface InventoryItem {
    id: string; // FE internal ID
    inventoryCheckItemId?: string; // Backend ID (if exists)
    materialId: string;
    materialName: string;
    oldStock: number;
    newStock: string;
    difference: number;
    unit?: string;
}

interface InventoryMaterialListProps {
    items: InventoryItem[];
    onUpdateItem: (id: string, field: keyof InventoryItem, value: any) => void;
    onAddItem: () => void;
    onRemoveItem: (id: string) => void;
    materialOptions?: DropdownOption[];
    onDropdownOpen?: (itemIndex: number) => void;
}

export const InventoryMaterialList: React.FC<InventoryMaterialListProps> = ({
    items,
    onUpdateItem,
    onAddItem,
    onRemoveItem,
    materialOptions = [],
    onDropdownOpen,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const handleToggleDropdown = (id: string, index: number) => {
        if (activeDropdownId === id) {
            setActiveDropdownId(null);
        } else {
            setActiveDropdownId(id);
            onDropdownOpen?.(index);
        }
    };

    // Calculate used material IDs to filter options
    const usedMaterialIds = new Set(items.map(i => i.materialId).filter(Boolean));

    return (
        <View style={styles.mainMaterialCard}>
            <CollapseHead
                title="Vật tư điều chỉnh"
                isExpanded={isExpanded}
                onToggle={toggleExpand}
            />

            {isExpanded && (
                <View style={styles.mainContent}>
                    {items.map((item, index) => {
                        const isDropdownOpen = activeDropdownId === item.id;
                        const diff = item.newStock
                            ? Number(item.newStock) - item.oldStock
                            : -item.oldStock;

                        // Filter options: Exclude materials selected in other rows
                        const currentItemMaterialId = item.materialId;
                        const availableOptions = materialOptions.filter(
                            opt =>
                                !usedMaterialIds.has(String(opt.value)) ||
                                String(opt.value) === String(currentItemMaterialId)
                        );

                        return (
                            <View
                                key={item.id}
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
                                                onChange={val =>
                                                    onUpdateItem(item.id, 'materialId', val)
                                                }
                                                placeholder="Chọn vật tư"
                                                showAllOption={false}
                                                isOpen={isDropdownOpen}
                                                onToggle={() =>
                                                    handleToggleDropdown(item.id, index)
                                                }
                                                inline={true}
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
                                                        const normalizedText = val.replace(
                                                            /,/g,
                                                            '.'
                                                        );
                                                        if (
                                                            numericStringSchema.safeParse(
                                                                normalizedText
                                                            ).success
                                                        ) {
                                                            onUpdateItem(
                                                                item.id,
                                                                'newStock',
                                                                normalizedText
                                                            );
                                                        }
                                                    }}
                                                    keyboardType="numeric"
                                                    containerStyle={styles.noMarginBottom}
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
                    })}

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={onAddItem}
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
                shadowColor: colors.black,
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
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
