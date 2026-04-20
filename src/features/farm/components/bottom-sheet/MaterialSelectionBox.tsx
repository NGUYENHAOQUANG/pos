import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput } from '@/shared/components/typography/AppTextInput';
import { Text } from '@/shared/components/typography/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { Button } from '@/shared/components/buttons/Button';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { SelectMaterialBottomSheet } from '@/features/farm/components/bottom-sheet/SelectMaterialBottomSheet';
import { IMaterial, MaterialGroupType } from '@/features/material/types/material.types';
import { SpecificType } from '@/features/material/types/warehouse.types';
import { RequiredDot } from '@/shared/components/forms/Input';
import { InputFilters } from '@/shared/regex';
import { useFilteredWarehouseMaterials } from '@/features/farm/hooks/useFilteredWarehouseMaterials';
import { useMaterialGroups } from '@/features/material/hooks/useMaterialGroups';
import { useDebounce } from '@/shared/hooks/useDebounce';
import DeleteIcon from '@/assets/Icon/Delete.svg';

export interface SelectedMaterialItem {
    material: IMaterial;
    quantity: number;
    unit: string;
}

interface MaterialSelectionBoxProps {
    selectedMaterials: SelectedMaterialItem[];
    onMaterialsChange: (materials: SelectedMaterialItem[]) => void;
    groupTypes?: MaterialGroupType[];
    specificType?: SpecificType;
    isRequired?: boolean;
}

export const MaterialSelectionBox: React.FC<MaterialSelectionBoxProps> = ({
    selectedMaterials,
    onMaterialsChange,
    groupTypes,
    specificType,
    isRequired = true,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const [isModalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = useDebounce(searchText, 500);

    const { data: materialGroups = [] } = useMaterialGroups();

    const materialGroupIds = useMemo(() => {
        if (!groupTypes?.length || !materialGroups.length) return undefined;
        return materialGroups
            .filter(g => {
                if (!g.name) return false;
                const groupName = g.name.toLowerCase();
                return groupTypes.some(gt => groupName.includes(gt.toLowerCase()));
            })
            .map(g => String(g.id));
    }, [groupTypes, materialGroups]);

    const {
        materials: allMaterials,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useFilteredWarehouseMaterials({
        materialGroupIds,
        searchText: debouncedSearchText,
        specificType,
    });

    const availableMaterials = useMemo(() => {
        return allMaterials.filter(
            (m: IMaterial) => !selectedMaterials.some(sm => sm.material.id === m.id)
        );
    }, [allMaterials, selectedMaterials]);

    const handleAddMaterial = (data: SelectedMaterialItem) => {
        onMaterialsChange([...selectedMaterials, data]);
        setModalVisible(false);
        setSearchText('');
    };

    const handleClose = useCallback(() => {
        setModalVisible(false);
        setSearchText('');
    }, []);

    const [displayQuantities, setDisplayQuantities] = useState<Record<string, string>>({});

    const materialIds = useMemo(
        () => selectedMaterials.map(m => m.material.id).join(','),
        [selectedMaterials]
    );

    const handleRemoveMaterial = (index: number) => {
        const removedItem = selectedMaterials[index];
        if (removedItem) {
            setDisplayQuantities(prev => {
                const next = { ...prev };
                delete next[removedItem.material.id];
                return next;
            });
        }
        onMaterialsChange(selectedMaterials.filter((_, i) => i !== index));
    };

    useEffect(() => {
        setDisplayQuantities(prev => {
            const next = { ...prev };
            selectedMaterials.forEach(item => {
                const key = item.material.id;
                if (next[key] === undefined) {
                    next[key] = String(item.quantity);
                }
            });
            return next;
        });
        // materialIds is a stable proxy for selectedMaterials identity
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [materialIds]);

    const handleQuantityChange = useCallback(
        (index: number, text: string, materialId: string) => {
            const sanitized = InputFilters.decimal(text, 5, 15);

            setDisplayQuantities(prev => ({ ...prev, [materialId]: sanitized }));

            const parsed = parseFloat(sanitized);
            const quantityToSave = isNaN(parsed) ? 0 : parsed;

            const updated = selectedMaterials.map((item, i) =>
                i === index ? { ...item, quantity: quantityToSave } : item
            );
            onMaterialsChange(updated);
        },
        [selectedMaterials, onMaterialsChange]
    );

    const handleQuantityBlur = useCallback(
        (index: number, materialId: string) => {
            const item = selectedMaterials[index];
            if (item) {
                setDisplayQuantities(prev => ({ ...prev, [materialId]: String(item.quantity) }));
            }
        },
        [selectedMaterials]
    );

    return (
        <>
            <SelectionInfoBox
                title={
                    <View style={styles.titleRow}>
                        <Text style={styles.titleText}>Chọn vật tư</Text>
                        {isRequired && <RequiredDot />}
                    </View>
                }
            >
                {selectedMaterials.length > 0 && (
                    <View style={styles.materialCardsContainer}>
                        {selectedMaterials.map((item, index) => {
                            const key = item.material.id;
                            return (
                                <View key={key} style={styles.materialCard}>
                                    <Text style={styles.materialName} numberOfLines={1}>
                                        {item.material.name}
                                    </Text>
                                    <View style={styles.materialActions}>
                                        <View style={styles.quantityBox}>
                                            <TextInput
                                                style={styles.quantityInput}
                                                value={
                                                    displayQuantities[key] ?? String(item.quantity)
                                                }
                                                onChangeText={text =>
                                                    handleQuantityChange(
                                                        index,
                                                        text,
                                                        item.material.id
                                                    )
                                                }
                                                onBlur={() =>
                                                    handleQuantityBlur(index, item.material.id)
                                                }
                                                selectTextOnFocus
                                            />
                                            <Text style={styles.unitText} numberOfLines={1}>
                                                {item.unit}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => handleRemoveMaterial(index)}
                                            style={styles.deleteButton}
                                        >
                                            <DeleteIcon width={18} height={18} color={theme.text} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                <Button
                    title="Thêm vật tư​"
                    variant="outline"
                    onPress={() => setModalVisible(true)}
                    renderLeftIcon={<Ionicons name="add" size={20} color={theme.text} />}
                    fullWidth
                    style={styles.addButton}
                    textStyle={styles.addButtonText}
                />
            </SelectionInfoBox>

            <SelectMaterialBottomSheet
                visible={isModalVisible}
                onClose={handleClose}
                onSave={handleAddMaterial}
                materials={availableMaterials}
                isLoading={isLoading}
                onLoadMore={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                searchText={searchText}
                onSearchChange={setSearchText}
            />
        </>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        materialCard: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 12,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            backgroundColor: theme.background,
        },
        materialCardsContainer: {
            gap: 8,
        },
        materialName: {
            fontSize: 15,
            color: theme.text,
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
            borderColor: theme.border,
            borderRadius: 12,
            paddingHorizontal: spacing.sm,
            height: 40,
            width: 110,
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.background,
        },
        quantityInput: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
            flex: 1,
            padding: 0,
            textAlign: 'center',
        },
        unitText: {
            fontSize: 14,
            color: theme.textSecondary,
        },
        deleteButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: borderRadius.full,
            backgroundColor: theme.background,
        },
        addButton: {
            borderColor: theme.border,
            backgroundColor: theme.background,
        },
        addButtonText: {
            color: theme.text,
        },
        titleText: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
        },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
    });
