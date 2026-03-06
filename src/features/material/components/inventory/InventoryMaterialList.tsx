import React, { useState } from 'react';
import { View, StyleSheet, LayoutAnimation, UIManager, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { Button } from '@/shared/components/buttons/Button';
import { DropdownOption } from '@/features/material/components/DropdownMaterial';
import { CollapseHead } from '@/shared/components/layout/CollapseHead';
import { InventoryMaterialItem } from '@/features/material/components/inventory_list/InventoryMaterialItem';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface InventoryItem {
    id: string;
    inventoryCheckItemId?: string;
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
    items = [],
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
                        const usedMaterialIds = new Set(
                            items.map(i => i.materialId).filter(Boolean)
                        );
                        const currentItemMaterialId = item.materialId;
                        const availableOptions = materialOptions.filter(
                            opt =>
                                !usedMaterialIds.has(String(opt.value)) ||
                                String(opt.value) === String(currentItemMaterialId)
                        );

                        return (
                            <InventoryMaterialItem
                                key={item.id}
                                item={item}
                                index={index}
                                availableOptions={availableOptions}
                                isDropdownOpen={isDropdownOpen}
                                onUpdateItem={onUpdateItem}
                                onRemoveItem={onRemoveItem}
                                handleToggleDropdown={handleToggleDropdown}
                            />
                        );
                    })}

                    <Button
                        title="Thêm vật tư"
                        variant="outline"
                        onPress={onAddItem}
                        renderLeftIcon={<Ionicons name="add" size={20} color={colors.text} />}
                        fullWidth
                        style={styles.addButton}
                        textStyle={styles.addButtonText}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    mainMaterialCard: {
        backgroundColor: colors.white,
        margin: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        zIndex: 1,
    },
    mainContent: {
        padding: spacing.md,
        zIndex: 2,
    },
    addButton: {
        borderColor: colors.border,
        marginTop: spacing.xs,
    },
    addButtonText: {
        fontSize: 15,
        color: colors.text,
        fontWeight: '500',
    },
});
