import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import Toast from 'react-native-toast-message';

import { colors, spacing } from '@/styles';
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
    const [lowerLimit, setLowerLimit] = useState(parameter?.limit?.split(' - ')[0] || '');
    const [upperLimit, setUpperLimit] = useState(parameter?.limit?.split(' - ')[1] || '');
    const [isAlertEnabled, setIsAlertEnabled] = useState(true);

    // No explicit tab bar handling needed

    const handleSave = () => {
        // Construct updated parameter object
        const updatedParameter = {
            ...parameter,
            name,
            limit: `${lowerLimit} - ${upperLimit}`,
            // We might want to save alert state too if supported by EnvironmentParameter type
            // For now, assuming EnvironmentParameter interface has these fields or extending functionality later
        };

        // Call the callback to update state in parent screen
        if (route.params?.onSave) {
            route.params.onSave(updatedParameter);
        }

        Toast.show({
            type: 'success',
            text1: 'Đã cập nhật thông số',
        });
        navigation.goBack();
    };

    const handleReset = () => {
        if (parameter) {
            setName(parameter.name);
            const limits = parameter.limit?.split(' - ');
            setLowerLimit(limits[0] || '');
            setUpperLimit(limits[1] || '');
            setIsAlertEnabled(true);
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
        padding: spacing.md,
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
