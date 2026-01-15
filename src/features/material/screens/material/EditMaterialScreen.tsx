import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { AddMaterial } from '@/features/material/components/material/AddMaterial';
import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { colors, spacing, borderRadius } from '@/styles';
import { IMaterial } from '@/features/material/types/material.types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import {
    validateMaterialFormWithToast,
    validateMaterialType,
    validateAndConvertUnit,
} from '@/features/material/utils/materialValidation';
import { showValidationError } from '@/features/material/utils/validationToast';
import {
    useUpdateMaterial,
    useDeleteMaterial,
    useMaterialGroups,
    useMaterialTypes,
    useUnits,
    useMaterialTypesByGroup,
} from '@/features/material/hooks/useMaterials';
import { DropdownOption } from '@/features/material/components/material/DropdownMaterialGroup';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { IconTrashOutlined } from '@/assets/icons';

interface EditMaterialScreenProps {}

export const EditMaterialScreen: React.FC<EditMaterialScreenProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute<RouteProp<MaterialStackParamList, 'EditMaterial'>>();
    const { setTabBarVisible } = useTabBarVisibility();
    const scrollViewRef = useRef<ScrollView>(null);
    const { mutate: updateMaterial } = useUpdateMaterial();
    const { mutate: deleteMaterial } = useDeleteMaterial();
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    // React Query hooks
    const { data: materialGroups = [], isLoading: isLoadingMaterialGroups } = useMaterialGroups();
    const { data: materialTypes = [] } = useMaterialTypes();
    const { data: units = [] } = useUnits();

    const params = route.params as { material: IMaterial } | undefined;
    const initialData = params?.material;

    // Basic Info State
    const [name, setName] = useState('');
    const [group, setGroup] = useState('');
    const [type, setType] = useState('');
    const [unit, setUnit] = useState<string | number>('');

    // Advanced Info State
    const [usage, setUsage] = useState('');
    const [manufacturer, setManufacturer] = useState('');

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

    // Set basic fields when initialData is available
    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setGroup(initialData.group || '');
            setType(initialData.type || '');
            setUsage(initialData.usage || '');
            setManufacturer(initialData.manufacturer || '');
        }
    }, [initialData]);

    // Set unit when units are loaded and initialData is available
    useEffect(() => {
        if (initialData && units.length > 0) {
            // Convert unit to number to match unitOptions value format
            const unitId =
                typeof initialData.unit === 'number'
                    ? initialData.unit
                    : typeof initialData.unit === 'string' && initialData.unit !== ''
                    ? Number(initialData.unit)
                    : null;

            // Only set unit if it's a valid number and exists in units
            if (unitId !== null && !isNaN(unitId) && units.some(u => u.id === unitId)) {
                setUnit(unitId);
            } else {
                // If unitId doesn't match, try to find by unitName
                if (initialData.unitName) {
                    const unitByName = units.find(u => u.name === initialData.unitName);
                    if (unitByName) {
                        setUnit(unitByName.id);
                    } else {
                        setUnit('');
                    }
                } else {
                    setUnit('');
                }
            }
        }
    }, [initialData, units]);

    const handleSave = async () => {
        if (!initialData) {
            showValidationError('Không tìm thấy thông tin vật tư');
            return;
        }

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

        // Get material id (convert string to number)
        const materialId = Number(initialData.id);
        if (isNaN(materialId)) {
            showValidationError('ID vật tư không hợp lệ');
            return;
        }

        // Update material via API
        updateMaterial(
            {
                id: materialId,
                request: {
                    name: name.trim(),
                    materialTypeId: typeValidation.type.id,
                    description: usage || '', // Map usage to description
                    unitId: unitValidation.unitId,
                    manufacturer: manufacturer?.trim() || null,
                    isActive: true,
                },
            },
            {
                onSuccess: () => {
                    navigation.goBack();
                },
            }
        );
    };

    const handleDeletePress = () => {
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        if (!initialData) {
            showValidationError('Không tìm thấy thông tin vật tư');
            return;
        }

        const materialId = Number(initialData.id);
        if (isNaN(materialId)) {
            showValidationError('ID vật tư không hợp lệ');
            return;
        }

        deleteMaterial(materialId, {
            onSuccess: () => {
                setDeleteModalVisible(false);
                navigation.goBack();
            },
        });
    };

    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
    };

    // Delete button component
    const deleteButton = (
        <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeletePress}
            activeOpacity={0.7}
        >
            <IconTrashOutlined width={20} height={20} />
        </TouchableOpacity>
    );

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <View style={styles.container}>
                <HeaderMeterial
                    title="Sửa Thông Tin Vật Tư"
                    onBackPress={() => navigation.goBack()}
                    rightComponent={deleteButton}
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
                            typesByGroup={typesByGroup}
                            usage={usage}
                            onUsageChange={setUsage}
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

                {/* Delete Confirmation Modal */}
                <ConfirmationDeleteModal
                    visible={deleteModalVisible}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    title="Xóa vật tư"
                    message="Bạn có chắc chắn muốn xóa vật tư này không?"
                    successMessage="Đã xóa vật tư thành công"
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
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.error,
    },
});
