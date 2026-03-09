import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { Button } from '@/shared/components/buttons/Button';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { SelectMaterial } from '@/features/farm/components/pondwork/feed/SelectMaterial';
import { IMaterial } from '@/features/material/types/material.types';
import DeleteIcon from '@/assets/Icon/Delete.svg';

export interface SelectedMaterialItem {
    material: IMaterial;
    quantity: number;
    unit: string;
}

interface MaterialSelectionBoxProps {
    selectedMaterials: SelectedMaterialItem[];
    onMaterialsChange: (materials: SelectedMaterialItem[]) => void;
    materials: IMaterial[];
}

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
            <SelectionInfoBox title="Chọn vật tư">
                {/* Material Cards - only render when has items */}
                {selectedMaterials.length > 0 && (
                    <View style={styles.materialCardsContainer}>
                        {selectedMaterials.map((item, index) => (
                            <View key={`${item.material.id}-${index}`} style={styles.materialCard}>
                                <Text style={styles.materialName} numberOfLines={1}>
                                    {item.material.name}
                                </Text>
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
                )}

                <Button
                    title="Thêm vật tư"
                    variant="outline"
                    onPress={() => setModalVisible(true)}
                    renderLeftIcon={<Ionicons name="add" size={20} color={colors.text} />}
                    fullWidth
                    style={styles.addButton}
                    textStyle={styles.addButtonText}
                />
            </SelectionInfoBox>

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
    materialCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
    },
    materialCardsContainer: {
        gap: 8,
    },
    materialName: {
        fontSize: 15,
        color: colors.text,
        flex: 1,
        marginRight: spacing.sm,
    },
    materialActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    quantityBox: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.sm,
        height: 40,
        width: 110,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
    },
    unitText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    deleteButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 20,
        backgroundColor: colors.white,
    },
    addButton: {
        borderColor: colors.border,
    },
    addButtonText: {
        color: colors.text,
    },
});
