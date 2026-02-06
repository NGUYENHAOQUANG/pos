import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeNavigationProp } from '@react-navigation/native';

import { colors, spacing, borderRadius } from '@/styles';
import { FarmLocation } from '@/features/control/components/HeaderCamLocation';
import { MenuStackParamList } from '@/features/menu/navigation/MenuNavigator';
import { AppStackParamList } from '@/app/navigation/AppStack';

import {
    EnvironmentParameterSection,
    EnvironmentParameter,
} from '@/features/farm/components/pondwork/environment/EnvironmentParameterSection';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { SettingEnvSkeleton } from '@/features/farm/components/skeleton/SettingEnvSkeleton';
import { useEnvironmentSettingLogic } from '@/features/farm/hooks/envhooks/useEnvironmentSettingLogic';
import { DropDownButtonBasic, DropDownItem } from '@/features/farm/components/DropDownButtonBasic';

type NavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<AppStackParamList>,
    NativeStackNavigationProp<MenuStackParamList>
>;

export const SettingEnvironmentScreens: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const insets = useSafeAreaInsets();

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

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thiết lập thông số môi trường</Text>
                <View style={[styles.backButton, { opacity: 0 }]} />
            </View>

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
                            title="Nhóm cơ bản"
                            subtitle="Bộ thông số phổ biến để theo dõi."
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
            <ButtonBarFarm
                primaryTitle="Lưu"
                secondaryTitle="Thiết lập lại"
                onPrimaryPress={handleSave}
                onSecondaryPress={handleReset}
                primaryDisabled={!isDirty}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 12,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    dropdownContainer: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        backgroundColor: colors.white,
        paddingBottom: spacing.sm,
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
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
    },
});
