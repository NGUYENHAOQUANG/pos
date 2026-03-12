import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';

import { colors } from '@/styles';

import { MenuStackParamList } from '@/features/menu/navigation/MenuNavigator';
import { AppStackParamList } from '@/app/navigation/AppStack';

import {
    EnvironmentParameterSection,
    EnvironmentParameter,
} from '@/features/farm/components/pondwork/environment/EnvironmentParameterSection';
import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { SettingEnvSkeleton } from '@/features/farm/components/skeleton/SettingEnvSkeleton';
import { useEnvironmentSettingLogic } from '@/features/farm/hooks/pondwork/envhooks/useEnvironmentSettingLogic';

import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';

type NavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<AppStackParamList>,
    NativeStackNavigationProp<MenuStackParamList>
>;

export const SettingEnvironmentScreens: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const zones = useFarmStore(state => state.zones);

    // Calculate Active Location
    const activeLocation = useMemo(() => {
        if (zones && zones.length > 0) {
            let storeZone = selectedZoneId
                ? zones.find(z => String(z.id) === String(selectedZoneId))
                : null;
            const target = storeZone || zones[0];
            return { id: String(target.id), name: target.name };
        }
        return null;
    }, [zones, selectedZoneId]);

    const {
        parameters,
        advancedParameters,
        isDirty,
        isLoading,
        handleToggleParameter,
        handleToggleAdvancedParameter,
        handleReset,
        handleSave,
    } = useEnvironmentSettingLogic({ selectedLocation: activeLocation });

    const handleBack = () => {
        navigation.goBack();
    };

    const handleEdit = (parameter: EnvironmentParameter) => {
        navigation.navigate('EditEnvironment', {
            parameter,
        });
    };

    const showSkeleton = isLoading;

    const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(isDirty);

    const handleSaveWithBypass = async () => {
        allowNavigation();
        await handleSave();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <HeaderMenu title="Thiết lập thông số môi trường" onBack={handleBack} />

            {/* Content */}
            {showSkeleton ? (
                <SettingEnvSkeleton />
            ) : (
                <View style={styles.content}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <EnvironmentParameterSection
                            title="Nhóm mặc định"
                            subtitle="Bộ thông số chuẩn khi đo môi trường."
                            parameters={parameters}
                            onToggleParameter={handleToggleParameter}
                            onEdit={handleEdit}
                        />

                        <EnvironmentParameterSection
                            title="Nhóm nâng cao"
                            subtitle="Bộ thông số mở rộng để theo dõi."
                            parameters={advancedParameters}
                            onToggleParameter={handleToggleAdvancedParameter}
                            onEdit={handleEdit}
                        />
                    </ScrollView>
                </View>
            )}

            {/* Footer */}
            <ButtonBar
                mode="double"
                primaryTitle="Lưu thông tin"
                secondaryTitle="Thiết lập lại"
                onPrimaryPress={handleSaveWithBypass}
                onSecondaryPress={handleReset}
                primaryButtonDisabled={!isDirty}
                secondaryButtonStyle={{ flex: 1, minWidth: 0 }}
            />
            {UnsavedChangesModal}
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

    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        gap: 8,
        paddingBottom: 20,
    },
});
