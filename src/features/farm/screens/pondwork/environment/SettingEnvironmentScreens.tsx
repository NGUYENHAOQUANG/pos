import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, borderRadius, shadows } from '@/styles';
import { FarmLocation } from '@/features/control/components/HeaderCamLocation';
// FarmStackParamList removed to use AppStackParamList
import { MenuStackParamList } from '@/features/menu/navigation/MenuNavigator';
import { CompositeNavigationProp } from '@react-navigation/native';
import {
    EnvironmentParameterSection,
    EnvironmentParameter,
} from '@/features/farm/components/pondwork/environment/EnvironmentParameterSection';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { useFarmStore } from '@/features/farm/store/farmStore';
import {
    useEnvironmentInit,
    useParameterConfiguration,
} from '@/features/farm/hooks/envhooks/useEnvironmentLogic';
import { useSettingEnvironment } from '@/features/farm/hooks/envhooks/useSettingEnvironment';
import { SettingEnvSkeleton } from '@/features/farm/components/skeleton/SettingEnvSkeleton';

import { AppStackParamList } from '@/app/navigation/AppStack';

type NavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<AppStackParamList>,
    NativeStackNavigationProp<MenuStackParamList>
>;

export const SettingEnvironmentScreens: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    // Unused param _data removed
    const insets = useSafeAreaInsets();

    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const parameterSettings = useFarmStore(state => state.parameterSettings);
    // Access zones directly to calculate activeLocation before passing to hook
    const zones = useFarmStore(state => state.zones);

    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    // Use overrideLocation only when user manually selects
    const [overrideLocation, setOverrideLocation] = useState<FarmLocation | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const dropdownButtonRef = useRef<View>(null);

    // Calculate Active Location (Derived State)
    const activeLocation = React.useMemo(() => {
        if (overrideLocation) {
            return overrideLocation;
        }

        if (zones && zones.length > 0) {
            let storeZone = null;

            if (selectedZoneId) {
                // Try to find zone by ID (as string)
                storeZone = zones.find(z => String(z.id) === String(selectedZoneId));
            }

            // Fallback: use first zone
            const target = storeZone || zones[0];

            const result = {
                id: String(target.id),
                name: target.name,
            };

            return result;
        }

        return null;
    }, [zones, selectedZoneId, overrideLocation]);

    // 1. Init Data (Fetch settings for the calculated active location)
    // We already accessed zones from store, but the hook handles fetching if empty
    const { isLoading, metricTypes } = useEnvironmentInit(activeLocation?.id);

    // 2. Removed sync useEffect - no longer needed with derived state

    // 3. Compute UI Parameters
    const { uiParameters } = useParameterConfiguration(
        activeLocation?.id,
        metricTypes,
        parameterSettings
    );

    // 4. Use Setting Environment Logic Hook
    const {
        parameters,
        advancedParameters,
        isDirty,
        handleToggleParameter,
        handleToggleAdvancedParameter,
        handleUpdateParameter,
        handleReset,
        handleSave,
    } = useSettingEnvironment({
        selectedLocation: activeLocation,
        metricTypes,
        parameterSettings,
        uiParameters,
    });

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleDropdownPress = () => {
        if (dropdownButtonRef.current) {
            dropdownButtonRef.current.measure((fx, fy, width, height, px, py) => {
                setDropdownPosition({ top: py + height, left: px, width: width });
                setIsDropdownVisible(true);
            });
        }
    };

    const handleSelectLocation = (location: FarmLocation) => {
        setOverrideLocation(location);
        setIsDropdownVisible(false);
    };

    const handleEdit = (parameter: EnvironmentParameter) => {
        navigation.navigate('EditEnvironment', {
            parameter: {
                id: parameter.id,
                name: parameter.name,
                limit: parameter.limit,
                isChecked: parameter.isChecked,
            },
            onSave: handleUpdateParameter,
        });
    };

    // Show skeleton while:
    // 1. Still loading (fetching metricTypes, zones, parameterSettings), OR
    // 2. ParameterSettings haven't been fetched yet for current zone
    // Once parameterSettings is fetched (even if empty), hide skeleton and show the form
    const hasParameterSettings = activeLocation?.id
        ? parameterSettings[activeLocation.id] !== undefined
        : true; // If no activeLocation, don't block on parameterSettings

    const showSkeleton = isLoading || !hasParameterSettings;

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
                        <TouchableOpacity
                            ref={dropdownButtonRef}
                            style={styles.dropdownButton}
                            onPress={handleDropdownPress}
                            disabled={true}
                        >
                            <Text style={styles.dropdownText}>
                                {activeLocation ? activeLocation.name : 'Chọn khu nuôi'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={colors.gray[600]} />
                        </TouchableOpacity>
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

            {/* Location Dropdown Modal */}
            <Modal visible={isDropdownVisible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setIsDropdownVisible(false)}
                >
                    <View
                        style={[
                            styles.dropdownMenu,
                            {
                                top: dropdownPosition.top,
                                left: dropdownPosition.left,
                                width: dropdownPosition.width,
                            },
                        ]}
                    >
                        {zones && zones.length > 0 ? (
                            <FlatList
                                data={zones.map(z => ({ id: String(z.id), name: z.name }))}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => {
                                    const isSelected = activeLocation
                                        ? item.id === activeLocation.id
                                        : false;
                                    return (
                                        <TouchableOpacity
                                            style={[
                                                styles.dropdownItem,
                                                isSelected && styles.dropdownItemSelected,
                                            ]}
                                            onPress={() => handleSelectLocation(item)}
                                            activeOpacity={0.7}
                                        >
                                            <Text
                                                style={[
                                                    styles.dropdownItemText,
                                                    isSelected && styles.dropdownItemTextSelected,
                                                ]}
                                            >
                                                {item.name}
                                            </Text>
                                            {isSelected && (
                                                <Ionicons
                                                    name="checkmark"
                                                    size={18}
                                                    color={colors.primary}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    );
                                }}
                                scrollEnabled={false}
                                contentContainerStyle={styles.dropdownScrollContent}
                            />
                        ) : (
                            <View style={{ padding: 12 }}>
                                <Text style={{ color: colors.gray[500] }}>
                                    Chưa có trang trại nào
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    headerSection: {
        backgroundColor: colors.white,
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
    headerSpacer: {
        width: 40,
    },
    headerDivider: {
        height: 1,
        backgroundColor: colors.borderLight,
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
    dropdownWrapper: {
        marginHorizontal: spacing.md,
        marginVertical: spacing.sm,
        height: 40,
    },
    dropdownButton: {
        paddingHorizontal: 12,
        height: 40,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.borderLight,
        backgroundColor: colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownButtonText: {
        fontWeight: '400',
        fontStyle: 'normal',
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0,
        color: colors.text,
    },
    dropdownText: {
        fontSize: 14,
        color: colors.text,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
    },
    footerContainer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    modalOverlay: {
        flex: 1,
    },
    dropdownMenu: {
        position: 'absolute',
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.gray[200],
        ...shadows.md,
        marginTop: 4,
    },
    dropdownModal: {
        position: 'absolute',
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.gray[200],
        ...shadows.md,
    },
    dropdownScrollContent: {
        paddingVertical: spacing.xs,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
        marginHorizontal: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    dropdownItemSelected: {
        backgroundColor: colors.gray[100],
    },
    dropdownItemText: {
        fontSize: 14,
        color: colors.text,
    },
    dropdownItemTextSelected: {
        fontWeight: '500',
        color: colors.text,
    },
});
