import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '@/styles';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';
import {
    GeneralInformation,
    GeneralInformationData,
} from '../../components/devices/GeneralInformation';
import {
    MaintenancePeriod,
    MaintenancePeriodData,
} from '../../components/devices/MaintenancePeriod';
import Toast from 'react-native-toast-message';
import { useMenuContext } from '@/features/menu/context/MenuContext';
import { DeviceData } from '@/features/menu/types/menu.types';

export const AddDeviceScreens = () => {
    const navigation = useNavigation();
    const [generalInfo, setGeneralInfo] = useState<GeneralInformationData | null>(null);
    const [maintenanceInfo, setMaintenanceInfo] = useState<MaintenancePeriodData | null>(null);
    const [triggerValidation, setTriggerValidation] = useState(false);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleGeneralInfoChange = useCallback((data: GeneralInformationData) => {
        setGeneralInfo(data);
    }, []);

    const handleMaintenanceInfoChange = useCallback((data: MaintenancePeriodData) => {
        setMaintenanceInfo(data);
    }, []);

    const { addDevice } = useMenuContext();

    const handleSubmit = () => {
        setTriggerValidation(true);

        // Reset trigger after a short delay
        setTimeout(() => setTriggerValidation(false), 500);

        const isGeneralValid = generalInfo?.isValid;
        const isMaintenanceValid = maintenanceInfo?.isValid;

        if (isGeneralValid && isMaintenanceValid && generalInfo && maintenanceInfo) {
            const newDevice: Omit<DeviceData, 'id'> = {
                name: generalInfo.deviceName,
                type: generalInfo.deviceType?.label || '',
                status: generalInfo.condition === 'new' ? 'warehouse' : 'installed', // Default logic: New -> Warehouse, Used -> Installed (assumption)
                importDate: generalInfo.importDate
                    ? generalInfo.importDate.toLocaleDateString('vi-VN')
                    : '',
                totalRunTime: '0 giờ',
                maintenance: {
                    operatingTime: {
                        current: 0,
                        limit: parseInt(maintenanceInfo.operatingTime) || 0,
                    },
                    usageTime: {
                        current: 0,
                        limit: parseInt(maintenanceInfo.usageTime) || 0,
                    },
                },
            };

            addDevice(newDevice);

            Toast.show({
                type: 'success',
                text1: 'Thêm thiết bị thành công',
            });
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <HeaderMenu title="Thêm thiết bị" onBack={handleBack} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <GeneralInformation
                    onDataChange={handleGeneralInfoChange}
                    triggerValidation={triggerValidation}
                />

                <MaintenancePeriod
                    onDataChange={handleMaintenanceInfoChange}
                    triggerValidation={triggerValidation}
                />
            </ScrollView>

            <ButtonBarMenu
                primaryTitle="Thêm thiết bị"
                secondaryTitle="Huỷ"
                onPrimaryPress={handleSubmit}
                onSecondaryPress={handleBack}
                secondaryType="default"
                style={styles.footer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary, // Light blue background from colors.ts
    },
    scrollContent: {
        paddingTop: spacing.sm, // Spacing between header and first card
    },
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
});
