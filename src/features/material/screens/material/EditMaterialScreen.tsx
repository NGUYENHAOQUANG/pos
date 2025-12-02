import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Platform,
    ScrollView,
} from 'react-native';
import { HeaderMeterial } from '../../components/material/HeaderMeterial';
import { AddMaterial } from '../../components/material/AddMaterial';
import { Button } from '@/shared/components/buttons/Button';
import { colors, spacing } from '@/styles';

interface EditMaterialScreenProps {
    initialData: any;
    onBack?: () => void;
    onSave?: (data: any) => void;
}

export const EditMaterialScreen: React.FC<EditMaterialScreenProps> = ({
    initialData,
    onBack,
    onSave,
}) => {
    // Basic Info State
    const [name, setName] = useState('');
    const [group, setGroup] = useState('');
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
                    onBackPress={onBack}
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
                        unit={unit}
                        onUnitChange={setUnit}
                        unitOptions={['Kg', 'G', 'Lít', 'Ml', 'Bao', 'Gói']}
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
                    <Button
                        title="Huỷ"
                        onPress={() => onBack?.()}
                        variant="outline"
                        style={styles.cancelButton}
                    />
                    <View style={styles.spacer} />
                    <Button
                        title="Lưu thông tin"
                        onPress={() => {
                            onSave?.({
                                ...initialData, // Keep existing ID and other fields
                                name,
                                group,
                                unit,
                                usage,
                                unitOfUse,
                                dosage,
                                manufacturer,
                            });
                        }}
                        variant="primary"
                        style={styles.saveButton}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F0F5FF',
    },
    container: {
        flex: 1,
        backgroundColor: '#F0F5FF',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.md,
    },
    footer: {
        flexDirection: 'row',
        padding: spacing.md,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    },
    cancelButton: {
        width: 100,
    },
    saveButton: {
        flex: 1,
    },
    spacer: {
        width: spacing.md,
    },
});
