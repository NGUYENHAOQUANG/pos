import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '../../components/HeaderMaterial';
import { AddMaterial } from '../../components/material/AddMaterial';
import { ButtonBarMaterial } from '../../components/ButtonBarMaterial';
import { colors, spacing } from '@/styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '../../navigation/MaterialNavigator';
import { showValidationError } from '../../utils/validationToast';
import { useMaterialStore } from '../../store/materialStore';

interface AddMaterialScreenProps {}

export const AddMaterialScreen: React.FC<AddMaterialScreenProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const addMaterial = useMaterialStore(state => state.addMaterial);

    const { setTabBarVisible } = useTabBarVisibility();
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

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
                        unitOptions={['Kg', 'Lít', 'ml', 'g', 'mg']}
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
                    onPrimaryPress={() => {
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

                        addMaterial({
                            name,
                            group,
                            type,
                            unit,
                            usage,
                            unitOfUse,
                            dosage,
                            manufacturer,
                            remaining: 0,
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
        backgroundColor: '#F0F5FF',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingVertical: spacing.md,
    },
});
