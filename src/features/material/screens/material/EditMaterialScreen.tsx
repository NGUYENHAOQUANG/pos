import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform, ScrollView } from 'react-native';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '../../components/HeaderMaterial';
import { AddMaterial } from '../../components/material/AddMaterial';
import { ButtonBarMaterial } from '../../components/ButtonBarMaterial';
import { colors, spacing } from '@/styles';
import { IMaterial } from '../../types/material.types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '../../navigation/MaterialNavigator';

interface EditMaterialScreenProps {}

export const EditMaterialScreen: React.FC<EditMaterialScreenProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute<RouteProp<MaterialStackParamList, 'EditMaterial'>>();
    const { setTabBarVisible } = useTabBarVisibility();

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    const params = route.params as
        | { material: IMaterial; onSave?: (data: IMaterial) => void }
        | undefined;
    const initialData = params?.material;
    const onSave = params?.onSave;
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
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <View style={styles.container}>
                <HeaderMeterial
                    title="Sửa Thông Tin Vật Tư"
                    onBackPress={() => navigation.goBack()}
                    rightComponent={null} // Hide the right button
                />

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <AddMaterial
                        name={name}
                        onNameChange={setName}
                        group={group}
                        onGroupChange={setGroup}
                        type={type}
                        onTypeChange={setType}
                        unit={unit}
                        onUnitChange={setUnit}
                        unitOptions={['Kg', 'Lít', 'ml', 'g', 'mg']}
                        usage={usage}
                        onUsageChange={setUsage}
                        unitOfUse={unitOfUse}
                        onUnitOfUseChange={setUnitOfUse}
                        dosage={dosage}
                        onDosageChange={setDosage}
                        manufacturer={manufacturer}
                        onManufacturerChange={setManufacturer}
                    />
                </ScrollView>

                <View style={styles.footer}>
                    <ButtonBarMaterial
                        mode="double"
                        primaryTitle="Lưu thông tin"
                        secondaryTitle="Huỷ"
                        onPrimaryPress={() => {
                            if (!name.trim()) {
                                console.warn('Tên vật tư là bắt buộc');
                                return;
                            }
                            if (!group) {
                                console.warn('Nhóm vật tư là bắt buộc');
                                return;
                            }
                            if (!unit) {
                                console.warn('Đơn vị tính là bắt buộc');
                                return;
                            }

                            if (!initialData) return;

                            onSave?.({
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
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
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
    footer: {
        padding: spacing.md,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    },
});
