import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { AddMaterial } from '@/features/material/components/material/AddMaterial';
import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import { colors, spacing } from '@/styles';
import { IMaterial } from '@/features/material/types/material.types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { showValidationError } from '@/features/material/utils/validationToast';
import { useMaterialStore } from '@/features/material/store/materialStore';
import { unitApi } from '@/features/material/api/unitApi';

interface EditMaterialScreenProps {}

export const EditMaterialScreen: React.FC<EditMaterialScreenProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute<RouteProp<MaterialStackParamList, 'EditMaterial'>>();
    const { setTabBarVisible } = useTabBarVisibility();
    const scrollViewRef = useRef<ScrollView>(null);
    const updateMaterial = useMaterialStore(state => state.updateMaterial);

    // Get material groups from store
    const { fetchMaterialGroups, getMaterialGroupOptions, isLoadingMaterialGroups } =
        useMaterialStore();

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    // Fetch material groups on mount
    useEffect(() => {
        fetchMaterialGroups();
    }, [fetchMaterialGroups]);

    // Get dropdown options from store
    const materialGroupOptions = getMaterialGroupOptions();

    const params = route.params as { material: IMaterial } | undefined;
    const initialData = params?.material;
    // Basic Info State
    const [name, setName] = useState('');
    const [group, setGroup] = useState('');
    const [type, setType] = useState('');
    const [unit, setUnit] = useState('');
    const [unitOptions, setUnitOptions] = useState<string[]>([]);

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const data = await unitApi.getUnits();
                if (data && data.length > 0) {
                    setUnitOptions(data);
                }
            } catch (error) {
                console.error('Failed to fetch units:', error);
            }
        };
        fetchUnits();
    }, []);

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

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <View style={styles.container}>
                <HeaderMeterial
                    title="Sửa Thông Tin Vật Tư"
                    onBackPress={() => navigation.goBack()}
                    rightComponent={null} // Hide the right button
                />

                <ScrollView
                    ref={scrollViewRef}
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
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

                <ButtonBar
                    mode="double"
                    primaryTitle="Lưu thông tin"
                    secondaryTitle="Huỷ"
                    onPrimaryPress={() => {
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

                        if (!initialData) return;

                        updateMaterial({
                            ...initialData,
                            name,
                            group,
                            type,
                            unit,
                            usage,
                            unitOfUse,
                            dosage,
                            manufacturer,
                        });
                        navigation.goBack();
                    }}
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
    },
});
