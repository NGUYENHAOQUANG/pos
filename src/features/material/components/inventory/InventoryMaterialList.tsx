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
import { DropdownOption } from '@/features/material/components/material/DropdownMaterialGroup';
import { CollapseHead } from '@/shared/components/layout/CollapseHead';
import { InventoryMaterialItem } from '@/features/material/components/inventory/InventoryMaterialItem';

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
});
