import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '../../components/HeaderMaterial';
import { AddMaterial } from '../../components/material/AddMaterial';
import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { colors, spacing } from '@/styles';
import { IMaterial } from '../../types/material.types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '../../navigation/MaterialNavigator';
import { showValidationError } from '../../utils/validationToast';
import { useMaterialStore } from '../../store/materialStore';

interface EditMaterialScreenProps {}

export const EditMaterialScreen: React.FC<EditMaterialScreenProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute<RouteProp<MaterialStackParamList, 'EditMaterial'>>();
    const { setTabBarVisible } = useTabBarVisibility();
    const scrollViewRef = useRef<ScrollView>(null);
    const updateMaterial = useMaterialStore(state => state.updateMaterial);

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    const params = route.params as { material: IMaterial } | undefined;
    const initialData = params?.material;
    // Basic Info State
    const [name, setName] = useState('');
    const [group, setGroup] = useState('');
    const [type, setType] = useState('');
    const [unit, setUnit] = useState('');

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
                            unitOptions={[
                                'Kg',
                                'ml',
                                'Lít',
                                'Gram',
                                'mét',
                                'Cuộn',
                                'Cái',
                                'Con',
                                'Tấm',
                                'Chai',
                                'Miếng',
                                'm3',
                            ]}
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
        paddingBottom: 100,
    },
});
