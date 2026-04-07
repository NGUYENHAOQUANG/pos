import React, { useState, useMemo, useCallback } from 'react';
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
    /** Show required dot (*) next to title. Default: true */
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

    // Fetch material groups to resolve groupTypes → UUIDs
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

    // Fetch materials with API-level filtering + search
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

    // Exclude already selected materials
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

    const handleRemoveMaterial = (index: number) => {
        onMaterialsChange(selectedMaterials.filter((_, i) => i !== index));
    };

    // Handle inline quantity change on material card
    const handleQuantityChange = (index: number, text: string) => {
        let sanitized = text.replace(/[^0-9.]/g, '');
        const parts = sanitized.split('.');
        if (parts.length > 2) {
            sanitized = parts[0] + '.' + parts.slice(1).join('');
        }
        if (sanitized.length > 7) {
            sanitized = sanitized.substring(0, 7);
        }

        // If user typed just a dot, treat it as 0
        if (sanitized === '.') {
            sanitized = '0';
        }

        let numericValue = sanitized === '' ? 0 : Number(sanitized);
        if (Number.isNaN(numericValue)) {
            numericValue = 0;
        }

        const updated = selectedMaterials.map((item, i) =>
            i === index ? { ...item, quantity: numericValue } : item
        );
        onMaterialsChange(updated);
    };

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
                                        <TextInput
                                            style={styles.quantityInput}
                                            value={String(item.quantity)}
                                            onChangeText={text => handleQuantityChange(index, text)}
                                            keyboardType="decimal-pad"
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
                                        <DeleteIcon width={18} height={18} color={theme.error} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
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
            backgroundColor: theme.backgroundSecondary,
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
