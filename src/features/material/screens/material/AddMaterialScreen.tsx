import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { AddMaterial } from '@/features/material/components/material/AddMaterial';
import { ButtonBarMaterial } from '@/features/material/components/ButtonBarMaterial';
import { colors, spacing } from '@/styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { showValidationError } from '@/features/material/utils/validationToast';
import { useMaterialStore } from '@/features/material/store';
import { IMaterialType } from '@/features/material/types/material.types';

interface AddMaterialScreenProps {}

export const AddMaterialScreen: React.FC<AddMaterialScreenProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const createMaterial = useMaterialStore(state => state.createMaterial);

    const { setTabBarVisible } = useTabBarVisibility();
    const scrollViewRef = useRef<ScrollView>(null);

    // Get material groups and units from store
    const {
        fetchMaterialGroups,
        getMaterialGroupOptions,
        isLoadingMaterialGroups,
        materialGroups,
        materialTypes,
        fetchMaterialTypes,
        fetchUnits,
        getUnitOptions,
    } = useMaterialStore();

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    // Fetch material groups, types, and units on mount
    useEffect(() => {
        fetchMaterialGroups();
        fetchMaterialTypes();
        fetchUnits();
    }, [fetchMaterialGroups, fetchMaterialTypes, fetchUnits]);

    // Get dropdown options from store
    const materialGroupOptions = getMaterialGroupOptions();
    const unitOptions = getUnitOptions();

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

    const handleSave = async () => {
        // Validation
        if (!name.trim()) {
            showValidationError('Vui lòng nhập tên vật tư');
            return;
        }
        if (!group) {
            showValidationError('Vui lòng chọn nhóm vật tư');
            return;
        }
        if (!type) {
            showValidationError('Vui lòng chọn loại vật tư');
            return;
        }
        if (!unit) {
            showValidationError('Vui lòng chọn đơn vị tính');
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

            // Create material via API
            await createMaterial({
                name: name.trim(),
                materialTypeId: selectedType.id,
                description: usage || '', // Map usage to description
                unitId: unitId,
                manufacturer: manufacturer?.trim() || null,
                isActive: true,
            });

            navigation.goBack();
        } catch (error) {
            // Error is already handled in createMaterial with toast
            console.error('[AddMaterialScreen] Failed to create material:', error);
        }
    };

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <View style={styles.container}>
                <HeaderMeterial
                    title="Thêm Vật Tư"
                    onBackPress={() => navigation.goBack()}
                    rightComponent={null} // Hide the right button
                />

                <ScrollView
                    ref={scrollViewRef}
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
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
                        groupOptions={materialGroupOptions}
                        materialGroupsData={materialGroups}
                        groupDisabled={isLoadingMaterialGroups}
                        unitOptions={unitOptions}
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

                <ButtonBarMaterial
                    mode="double"
                    primaryTitle="Lưu thông tin"
                    secondaryTitle="Huỷ"
                    containerStyle={{
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                    }}
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
        backgroundColor: '#F0F5FF',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingVertical: spacing.md,
    },
});
