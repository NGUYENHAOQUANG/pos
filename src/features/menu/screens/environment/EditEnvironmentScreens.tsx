import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import Toast from 'react-native-toast-message';
import { ToastMessages } from '@/features/menu/utils/toastMessages';

import { colors } from '@/styles';
// import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { EditEnvironmentCard } from '@/features/menu/components/environment/EditEnvironmentCard';
import { ButtonBarMaterial } from '@/features/material/components/ButtonBarMaterial';

export const EditEnvironmentScreens: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    // const { setTabBarVisible } = useTabBarVisibility();

    const parameter = route.params?.parameter;

    const [name, setName] = useState(parameter?.name || '');
    const [lowerLimit, setLowerLimit] = useState(
        parameter?.min || parameter?.limit?.split(' - ')[0] || ''
    );
    const [upperLimit, setUpperLimit] = useState(
        parameter?.max || parameter?.limit?.split(' - ')[1] || ''
    );
    // Initialize from alertEnabled, default to true if undefined
    const [isAlertEnabled, setIsAlertEnabled] = useState(parameter?.alertEnabled ?? true);

    // No explicit tab bar handling needed

    const handleSave = () => {
        // Validate limits
        if (lowerLimit && upperLimit) {
            const lower = parseFloat(lowerLimit);
            const upper = parseFloat(upperLimit);

            if (!isNaN(lower) && !isNaN(upper) && lower > upper) {
                Toast.show({
                    type: 'error',
                    text1: 'Giới hạn dưới không được lớn hơn giới hạn trên',
                });
                return;
            }
        }

        // Construct updated parameter object
        const updatedParameter = {
            ...parameter,
            name,
            min: lowerLimit,
            max: upperLimit,
            limit: lowerLimit && upperLimit ? `${lowerLimit} - ${upperLimit}` : '',
            // Don't update isChecked here, as that controls visibility.
            // isChecked is passed through from original parameter.
            // We update alertEnabled.
            alertEnabled: isAlertEnabled,
        };

        // Call the callback to update state in parent screen
        if (route.params?.onSave) {
            route.params.onSave(updatedParameter);
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
                    isAlertEnabled={isAlertEnabled}
                    onNameChange={setName}
                    onLowerLimitChange={setLowerLimit}
                    onUpperLimitChange={setUpperLimit}
                    onAlertToggle={setIsAlertEnabled}
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
