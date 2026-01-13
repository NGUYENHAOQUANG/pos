import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { AddMaterial } from '@/features/material/components/material/AddMaterial';
import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { colors, spacing } from '@/styles';
import { IMaterial } from '@/features/material/types/material.types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { showValidationError } from '@/features/material/utils/validationToast';
import { useMaterialStore } from '@/features/material/store';
import { IMaterialType } from '@/features/material/types/material.types';

interface EditMaterialScreenProps {}

export const EditMaterialScreen: React.FC<EditMaterialScreenProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute<RouteProp<MaterialStackParamList, 'EditMaterial'>>();
    const { setTabBarVisible } = useTabBarVisibility();
    const scrollViewRef = useRef<ScrollView>(null);
    const updateMaterial = useMaterialStore(state => state.updateMaterial);
    const { fetchUnits, getUnitOptions } = useMaterialStore();

    // Get material groups, types from store
    const {
        fetchMaterialGroups,
        getMaterialGroupOptions,
        isLoadingMaterialGroups,
        materialGroups,
        materialTypes,
        fetchMaterialTypes,
    } = useMaterialStore();

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    // Fetch material groups, types, and units on mount
    useEffect(() => {
        fetchMaterialGroups();
        fetchMaterialTypes();
    }, [fetchMaterialGroups, fetchMaterialTypes]);

    // Get dropdown options from store
    const materialGroupOptions = getMaterialGroupOptions();
    const unitOptions = getUnitOptions();

    // Fetch units on mount
    useEffect(() => {
        fetchUnits();
    }, [fetchUnits]);

    const params = route.params as { material: IMaterial } | undefined;
    const initialData = params?.material;
    // Basic Info State
    const [name, setName] = useState('');
    const [group, setGroup] = useState('');
    const [type, setType] = useState('');
    const [unit, setUnit] = useState<string | number>('');

    // Advanced Info State
    const [usage, setUsage] = useState('');
    const [unitOfUse, setUnitOfUse] = useState('');
    const [dosage, setDosage] = useState('');
    const [manufacturer, setManufacturer] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setGroup(initialData.group || '');
            setType(initialData.type || '');
            setUnit(initialData.unit || '');
            setUsage(initialData.usage || '');
            setUnitOfUse(initialData.unitOfUse || '');
            setDosage(initialData.dosage || '');
            setManufacturer(initialData.manufacturer || '');
        }
    }, [initialData]);

    const handleSave = async () => {
        // Validation
        if (!name.trim()) {
            showValidationError('Tên vật tư là bắt buộc');
            return;
        }
        if (!group) {
            showValidationError('Nhóm vật tư là bắt buộc');
            return;
        }
        if (!type) {
            showValidationError('Loại vật tư là bắt buộc');
            return;
        }
        if (!unit) {
            showValidationError('Đơn vị tính là bắt buộc');
            return;
        }

        if (!initialData) {
            showValidationError('Không tìm thấy thông tin vật tư');
            return;
        }

        try {
            // Map type name to materialTypeId
            const selectedType = materialTypes.find((t: IMaterialType) => t.name === type);
            if (!selectedType) {
                showValidationError('Loại vật tư không hợp lệ');
                return;
            }

            // Map unit to unitId (unit is already the id from dropdown)
            const unitId = typeof unit === 'number' ? unit : Number(unit);
            if (isNaN(unitId)) {
                showValidationError('Đơn vị tính không hợp lệ');
                return;
            }

            // Get material id (convert string to number)
            const materialId = Number(initialData.id);
            if (isNaN(materialId)) {
                showValidationError('ID vật tư không hợp lệ');
                return;
            }

            // Update material via API
            await updateMaterial(materialId, {
                name: name.trim(),
                materialTypeId: selectedType.id,
                description: usage || '', // Map usage to description
                unitId: unitId,
                manufacturer: manufacturer?.trim() || null,
                isActive: true,
            });

            navigation.goBack();
        } catch (error) {
            // Error is already handled in updateMaterial with toast
            console.error('[EditMaterialScreen] Failed to update material:', error);
        }
    };

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <View style={styles.container}>
                <HeaderMeterial
                    title="Sửa Thông Tin Vật Tư"
                    onBackPress={() => navigation.goBack()}
                    rightComponent={null} // Hide the right button
                />

                <SafeInputLayout>
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.content}
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <AddMaterial
                            name={name}
                            onNameChange={setName}
                            group={group}
                            onGroupChange={val => {
                                setGroup(val);
                                setType('');
                            }}
                            type={type}
                            onTypeChange={setType}
                            unit={unit}
                            onUnitChange={setUnit}
                            unitOptions={unitOptions}
                            groupOptions={materialGroupOptions}
                            materialGroupsData={materialGroups}
                            groupDisabled={isLoadingMaterialGroups}
                            usage={usage}
                            onUsageChange={setUsage}
                            unitOfUse={unitOfUse}
                            onUnitOfUseChange={setUnitOfUse}
                            dosage={dosage}
                            onDosageChange={setDosage}
                            manufacturer={manufacturer}
                            onManufacturerChange={setManufacturer}
                            onUnitDropdownOpen={() => {
                                setTimeout(() => {
                                    scrollViewRef.current?.scrollToEnd({ animated: true });
                                }, 100);
                            }}
                        />
                    </ScrollView>
                </SafeInputLayout>

                <ButtonBar
                    mode="double"
                    primaryTitle="Lưu thông tin"
                    secondaryTitle="Huỷ"
                    onPrimaryPress={handleSave}
                    onSecondaryPress={() => navigation.goBack()}
                />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingVertical: spacing.md,
        paddingBottom: 100,
    },
});
