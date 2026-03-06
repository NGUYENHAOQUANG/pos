import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { SelectMaterial } from '@/features/farm/components/pondwork/feed/SelectMaterial';
import { IMaterial } from '@/features/material/types/material.types';
import DeleteIcon from '@/assets/Icon/Delete.svg';
import { RequiredDot } from '@/shared/components/forms/Input';

export interface SelectedMaterialItem {
    material: IMaterial;
    quantity: number;
    unit: string;
}

interface MaterialSelectionBoxProps {
    selectedMaterials: SelectedMaterialItem[];
    onMaterialsChange: (materials: SelectedMaterialItem[]) => void;
    materials: IMaterial[]; // Available materials list for SelectMaterial modal
}

/**
 * Reusable component for material selection with list display and add/remove functionality
 */
export const MaterialSelectionBox: React.FC<MaterialSelectionBoxProps> = ({
    selectedMaterials,
    onMaterialsChange,
    materials,
}) => {
    const [isModalVisible, setModalVisible] = useState(false);

    const handleAddMaterial = (data: SelectedMaterialItem) => {
        onMaterialsChange([...selectedMaterials, data]);
        setModalVisible(false);
    };

    const handleRemoveMaterial = (index: number) => {
        onMaterialsChange(selectedMaterials.filter((_, i) => i !== index));
    };

    return (
        <>
            <SelectionInfoBox
                title={
                    <View style={styles.titleWrapper}>
                        <Text style={styles.title}>Chọn vật tư</Text>
                        <RequiredDot />
                    </View>
                }
            >
                {/* List of selected materials */}
                {selectedMaterials.length > 0 && (
                    <>
                        <View style={styles.materialList}>
                            {selectedMaterials.map((item, index) => (
                                <View
                                    key={`${item.material.id}-${index}`}
                                    style={styles.materialItem}
                                >
                                    <Text style={styles.materialName}>{item.material.name}</Text>
                                    <View style={styles.materialActions}>
                                        <View style={styles.quantityBox}>
                                            <Text style={styles.quantityText} numberOfLines={1}>
                                                {item.quantity}
                                            </Text>
                                            <Text style={styles.unitText} numberOfLines={1}>
                                                {item.unit}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => handleRemoveMaterial(index)}
                                            style={styles.deleteButton}
                                        >
                                            <DeleteIcon width={18} height={18} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}
                {/* Add Button */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={16} color={colors.text} style={styles.addIcon} />
                    <Text style={styles.addButtonText} numberOfLines={1}>
                        Thêm vật tư
                    </Text>
                </TouchableOpacity>
            </SelectionInfoBox>

            {/* Select Material Modal */}
            <SelectMaterial
                isVisible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleAddMaterial}
                materials={materials.filter(
                    m => !selectedMaterials.some(sm => sm.material.id === m.id)
                )}
            />
        </>
    );
};

const styles = StyleSheet.create({
    titleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    materialList: {
        gap: spacing.md,
    },
    materialItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
    },
    materialName: {
        fontSize: 16,
        color: colors.text,
        flex: 1,
        marginRight: spacing.md,
    },
    materialActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityBox: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.sm,
        height: 40,
        width: 100,
        marginRight: spacing.sm,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    quantityText: {
        fontSize: 16,
        color: colors.text,
        flex: 1,
        marginRight: 4,
    },
    unitText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    deleteButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.gray[200],
        borderRadius: 18,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        height: 40,
        width: '100%',
        paddingHorizontal: spacing.md,
    },
    addIcon: {
        marginRight: spacing.sm,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 22,
        flexShrink: 0,
    },
});
