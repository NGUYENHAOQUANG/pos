import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';

import { colors } from '@/styles';
import { FarmLocation } from '@/features/control/components/HeaderCamLocation';
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
import { DropDownButtonBasic, DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';

type NavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<AppStackParamList>,
    NativeStackNavigationProp<MenuStackParamList>
>;

export const SettingEnvironmentScreens: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const zones = useFarmStore(state => state.zones);

    const [overrideLocation, setOverrideLocation] = useState<FarmLocation | null>(null);

    // Calculate Active Location
    const activeLocation = useMemo(() => {
        if (overrideLocation) return overrideLocation;
        if (zones && zones.length > 0) {
            let storeZone = selectedZoneId
                ? zones.find(z => String(z.id) === String(selectedZoneId))
                : null;
            const target = storeZone || zones[0];
            return { id: String(target.id), name: target.name };
        }
        return null;
    }, [zones, selectedZoneId, overrideLocation]);

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

    const handleSelectLocation = (item: DropDownItem) => {
        setOverrideLocation({ id: String(item.id), name: item.label });
    };

    const handleEdit = (parameter: EnvironmentParameter) => {
        navigation.navigate('EditEnvironment', {
            parameter,
        });
    };

    const showSkeleton = isLoading;

    const locationData: DropDownItem[] = useMemo(() => {
        return (zones || []).map(z => ({
            id: String(z.id),
            label: z.name,
        }));
    }, [zones]);

    const activeDropdownItem: DropDownItem | undefined = activeLocation
        ? { id: activeLocation.id, label: activeLocation.name }
        : undefined;

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
                    {/* Location Dropdown */}
                    <View style={styles.dropdownContainer}>
                        <Text style={styles.label}>Ao nuôi / Khu nuôi</Text>
                        <DropDownButtonBasic
                            data={locationData}
                            value={activeDropdownItem}
                            onSelect={handleSelectLocation}
                            placeholder="Chọn khu nuôi"
                            showIcon={false}
                            disabled={true}
                        />
                    </View>

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
                primaryTitle="Lưu"
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
    dropdownContainer: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: colors.white,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    label: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 8,
        fontWeight: '500',
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
