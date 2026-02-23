import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { AddMaterial } from '@/features/material/components/material/AddMaterial';
import { ButtonBarMaterial } from '@/features/material/components/ButtonBarMaterial';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { Loading } from '@/shared/components/ui/Loading';
import { colors, spacing } from '@/styles';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { validateMaterialFormWithToast } from '@/features/material/utils/materialValidation';
import {
    useCreateMaterial,
    useMaterialGroups,
    useUnits,
    useMaterialTypesByGroup,
} from '@/features/material/hooks';
import { DropdownOption } from '@/features/material/components/material/DropdownMaterialGroup';

interface AddMaterialScreenProps {}

export const AddMaterialScreen: React.FC<AddMaterialScreenProps> = () => {
    const route = useRoute<RouteProp<AppStackParamList, 'AddMaterial'>>();
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const { mutate: createMaterial, isPending: isCreatingMaterial } = useCreateMaterial();

    const { setTabBarVisible } = useTabBarVisibility();
    const scrollViewRef = useRef<ScrollView>(null);

    // React Query hooks
    const { data: materialGroups = [], isLoading: isLoadingMaterialGroups } = useMaterialGroups();
    const { data: units = [] } = useUnits();

    // Basic Info State
    const [name, setName] = useState('');
    const [group, setGroup] = useState('');
    const [type, setType] = useState('');
    const [unit, setUnit] = useState<string>('');

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
        if (!validateMaterialFormWithToast({ name, group, type, unit, usage, manufacturer })) {
            return;
        }

        createMaterial(
            {
                name: name.trim() || '',
                materialTypeId: type,
                description: usage || '',
                unitId: unit,
                manufacturer: manufacturer?.trim() || '',
                isActive: isActive || false,
            },
            {
                onSuccess: (response: any) => {
                    if (response?.data && route.params?.onSave) {
                        route.params.onSave(response.data);
                    }
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
        paddingVertical: spacing.sm,
        paddingBottom: 100,
    },
});
