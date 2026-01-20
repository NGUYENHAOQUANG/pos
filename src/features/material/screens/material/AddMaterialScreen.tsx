import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { AddMaterial } from '@/features/material/components/material/AddMaterial';
import { ButtonBarMaterial } from '@/features/material/components/ButtonBarMaterial';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { Loading } from '@/shared/components/ui/Loading';
import { colors, spacing } from '@/styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import {
    validateMaterialFormWithToast,
    validateMaterialType,
    validateAndConvertUnit,
} from '@/features/material/utils/materialValidation';
import {
    useCreateMaterial,
    useMaterialGroups,
    useMaterialTypes,
    useUnits,
    useMaterialTypesByGroup,
} from '@/features/material/hooks';
import { showValidationError } from '@/features/material/utils/validationToast';
import { DropdownOption } from '@/features/material/components/material/DropdownMaterialGroup';

interface AddMaterialScreenProps {}

export const AddMaterialScreen: React.FC<AddMaterialScreenProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const { mutate: createMaterial, isPending: isCreatingMaterial } = useCreateMaterial();

    const { setTabBarVisible } = useTabBarVisibility();
    const scrollViewRef = useRef<ScrollView>(null);

    // React Query hooks
    const { data: materialGroups = [], isLoading: isLoadingMaterialGroups } = useMaterialGroups();
    const { data: materialTypes = [] } = useMaterialTypes();
    const { data: units = [] } = useUnits();

    // Basic Info State
    const [name, setName] = useState('');
    const [group, setGroup] = useState('');
    const [type, setType] = useState('');
    const [unit, setUnit] = useState<string | number>('');

    // Advanced Info State
    const [usage, setUsage] = useState('');
    const [manufacturer, setManufacturer] = useState('');

    // Status State
    const [isActive, setIsActive] = useState<boolean>(true);

    // Fetch material types when group changes
    const { data: typesByGroup = [] } = useMaterialTypesByGroup(group);

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    // Get dropdown options
    const materialGroupOptions = [
        'Tất cả nhóm vật tư',
        ...materialGroups.map(g => g.name || '').filter(n => n),
    ];
    const unitOptions: DropdownOption[] = units.map(u => ({ label: u.name, value: u.id }));

    const handleSave = async () => {
        // Validate form data
        if (!validateMaterialFormWithToast({ name, group, type, unit, usage, manufacturer })) {
            return;
        }

        // Validate material type
        const typeValidation = validateMaterialType(type, materialTypes, typesByGroup);
        if (!typeValidation.isValid || !typeValidation.type) {
            showValidationError('Loại vật tư không hợp lệ');
            return;
        }

        // Validate and convert unit
        const unitValidation = validateAndConvertUnit(unit);
        if (!unitValidation.isValid || !unitValidation.unitId) {
            showValidationError(unitValidation.error || 'Đơn vị tính không hợp lệ');
            return;
        }

        // Create material via API
        createMaterial(
            {
                name: name.trim(),
                materialTypeId: typeValidation.type.id,
                description: usage || '',
                unitId: unitValidation.unitId,
                manufacturer: manufacturer?.trim() || null,
                isActive: isActive,
            },
            {
                onSuccess: () => {
                    navigation.goBack();
                },
            }
        );
    };

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <Loading isLoading={isCreatingMaterial}>
                <View style={styles.container}>
                    <HeaderMeterial
                        title="Tạo Vật Tư"
                        onBackPress={() => navigation.goBack()}
                        rightComponent={null} // Hide the right button
                    />

                    <SafeInputLayout>
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
                                typesByGroup={typesByGroup}
                                usage={usage}
                                onUsageChange={setUsage}
                                manufacturer={manufacturer}
                                onManufacturerChange={setManufacturer}
                                isActive={isActive}
                                onIsActiveChange={setIsActive}
                                onUnitDropdownOpen={() => {
                                    setTimeout(() => {
                                        scrollViewRef.current?.scrollToEnd({ animated: true });
                                    }, 100);
                                }}
                            />
                        </ScrollView>
                    </SafeInputLayout>

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
                        primaryButtonDisabled={isCreatingMaterial}
                    />
                </View>
            </Loading>
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
        paddingBottom: 100,
    },
});
