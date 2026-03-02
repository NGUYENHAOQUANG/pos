import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import Toast from 'react-native-toast-message';
import { ToastMessages } from '@/features/menu/utils/toastMessages';

import { colors } from '@/styles';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { EditEnvironmentCard } from '@/features/menu/components/environment/EditEnvironmentCard';
import { ButtonBarMaterial } from '@/features/material/components/ButtonBarMaterial';
import { useEnvironmentSettings } from '@/features/farm/hooks/pondwork/envhooks/useSettingEnvironment';
import { useFarmStore } from '@/features/farm/store/farmStore';
import {
    CreateEnvironmentSettingRequest,
    UpdateEnvironmentSettingRequest,
} from '@/features/farm/types/environmentSettings.types';
import { useEnvironmentSettingStore } from '@/features/farm/store/environmentSettingStore';

export const EditEnvironmentScreens: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();

    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const zoneId = selectedZoneId ? String(selectedZoneId) : '';

    const parameter = route.params?.parameter;

    const { data: settingsPage } = useEnvironmentSettings(zoneId);

    const pendingChange = useEnvironmentSettingStore(state => state.getChange(parameter?.id));

    const getInitialMin = () => {
        if (pendingChange) return String(pendingChange.data.minValue);
        return parameter?.min || parameter?.limit?.split(' - ')[0] || '';
    };

    const getInitialMax = () => {
        if (pendingChange) return String(pendingChange.data.maxValue);
        return parameter?.max || parameter?.limit?.split(' - ')[1] || '';
    };

    const getInitialAlertEnabled = () => {
        if (pendingChange) return pendingChange.data.isActive;
        return parameter?.alertEnabled ?? true;
    };

    const [name, setName] = useState(parameter?.name || '');
    const [lowerLimit, setLowerLimit] = useState(getInitialMin());
    const [upperLimit, setUpperLimit] = useState(getInitialMax());
    const [isAlertEnabled, setIsAlertEnabled] = useState(getInitialAlertEnabled());

    const addChange = useEnvironmentSettingStore(state => state.addChange);

    const handleSave = () => {
        const items = settingsPage?.items || [];
        const existingSetting = items.find(s => s.metricId === parameter.id);

        const minValue = parseFloat(lowerLimit || '0');
        const maxValue = parseFloat(upperLimit || '0');

        const settingId = existingSetting?.id || pendingChange?.settingId;

        if (settingId) {
            const payload: UpdateEnvironmentSettingRequest = {
                metricId: parameter.id,
                minValue,
                maxValue,
                isActive: isAlertEnabled,
            };
            addChange(parameter.id, {
                metricId: parameter.id,
                settingId: settingId,
                data: payload,
                type: 'update',
            });
        } else {
            const payload: CreateEnvironmentSettingRequest = {
                metricId: parameter.id,
                minValue,
                maxValue,
                isActive: isAlertEnabled,
            };
            addChange(parameter.id, {
                metricId: parameter.id,
                data: payload,
                type: 'create',
            });
        }

        Toast.show(ToastMessages.Environment.UPDATE_SUCCESS);
        navigation.goBack();
    };

    const handleReset = () => {
        if (parameter) {
            setName(parameter.name);
            const limits = parameter.limit?.split(' - ');
            setLowerLimit(limits[0] || '');
            setUpperLimit(limits[1] || '');
            setIsAlertEnabled(parameter.alertEnabled ?? true);
        }
    };

    return (
        <View style={styles.container}>
            <HeaderMenu
                title={parameter?.name || 'Chỉnh sửa thông số'}
                onBack={() => navigation.goBack()}
            />

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <EditEnvironmentCard
                    name={name}
                    lowerLimit={lowerLimit}
                    upperLimit={upperLimit}
                    // isAlertEnabled={isAlertEnabled}
                    onNameChange={setName}
                    onLowerLimitChange={text => setLowerLimit(text.replace(/,/g, ''))}
                    onUpperLimitChange={text => setUpperLimit(text.replace(/,/g, ''))}
                    // onAlertToggle={setIsAlertEnabled}
                />
            </ScrollView>

            <View style={styles.footer}>
                <ButtonBarMaterial
                    mode="double"
                    primaryTitle="Lưu thông tin"
                    secondaryTitle="Thiết lập lại"
                    onPrimaryPress={handleSave}
                    onSecondaryPress={handleReset}
                    primaryButtonDisabled={false}
                    secondaryButtonStyle={styles.resetButton}
                    secondaryButtonTextStyle={styles.resetButtonText}
                />
            </View>
        </View>
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
    scrollContent: {
        paddingTop: 8,
        paddingHorizontal: 0,
        paddingBottom: 16,
    },
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    resetButton: {
        borderColor: colors.primary,
    },
    resetButtonText: {
        color: colors.primary,
    },
});
