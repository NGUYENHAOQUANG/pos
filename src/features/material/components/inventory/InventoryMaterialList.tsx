import React, { useState } from 'react';
import { View, StyleSheet, LayoutAnimation, UIManager, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '@/styles/themeContext';
import { Colors, spacing, borderRadius } from '@/styles';
import { Button } from '@/shared/components/buttons/Button';
import { CollapseHead } from '@/shared/components/layout/CollapseHead';
import { InventoryMaterialItem } from '@/features/material/components/inventory/InventoryMaterialItem';

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
    /** Warehouse ID for the dropdown */
    warehouseId?: string;
}

export const InventoryMaterialList: React.FC<InventoryMaterialListProps> = ({
    items = [],
    onUpdateItem,
    onAddItem,
    onRemoveItem,
    warehouseId,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    // Compute used material IDs once for all items
    const usedMaterialIds = React.useMemo(
        () => new Set(items.map(i => i.materialId).filter(Boolean)),
        [items]
    );

    return (
        <View style={styles.mainMaterialCard}>
            <CollapseHead
                title="Vật tư điều chỉnh"
                isExpanded={isExpanded}
                onToggle={toggleExpand}
            />

            {isExpanded && (
                <View style={styles.mainContent}>
                    {items.map((item, index) => (
                        <InventoryMaterialItem
                            key={item.id}
                            item={item}
                            index={index}
                            warehouseId={warehouseId}
                            usedMaterialIds={usedMaterialIds}
                            onUpdateItem={onUpdateItem}
                            onRemoveItem={onRemoveItem}
                        />
                    ))}

                    <Button
                        title="Thêm vật tư​"
                        variant="outline"
                        onPress={onAddItem}
                        renderLeftIcon={<Ionicons name="add" size={20} color={theme.text} />}
                        fullWidth
                        style={styles.addButton}
                        textStyle={styles.addButtonText}
                    />
                </View>
            )}
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
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.md,
            zIndex: 2,
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
    });
