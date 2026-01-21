import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, borderRadius, shadows } from '@/styles';
// import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmLocation } from '@/features/control/components/HeaderCamLocation';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { MenuStackParamList } from '@/features/menu/navigation/MenuNavigator';
import { CompositeNavigationProp } from '@react-navigation/native';
import {
    EnvironmentParameterSection,
    EnvironmentParameter,
} from '@/features/farm/components/pondwork/environment/EnvironmentParameterSection';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import Toast from 'react-native-toast-message';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { ParameterSetting } from '@/features/farm/api/environmentApi';

type NavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<FarmStackParamList>,
    NativeStackNavigationProp<MenuStackParamList>
>;
type SettingEnvironmentRouteProp = RouteProp<FarmStackParamList, 'SettingEnvironment'>;

export const SettingEnvironmentScreens: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<SettingEnvironmentRouteProp>();
    const { data: _data } = route.params || {};
    const insets = useSafeAreaInsets();

    // Use individual selectors instead of useFarm() to prevent unnecessary re-renders
    const metricTypes = useFarmStore(state => state.metricTypes);
    const fetchMetricTypes = useFarmStore(state => state.fetchMetricTypes);
    const parameterSettings = useFarmStore(state => state.parameterSettings);
    const fetchParameterSettings = useFarmStore(state => state.fetchParameterSettings);
    const zones = useFarmStore(state => state.zones);
    const fetchZones = useFarmStore(state => state.fetchZones);

    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    // Default to first available zone or a placeholder
    const [selectedLocation, setSelectedLocation] = useState<FarmLocation | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const dropdownButtonRef = useRef<View>(null);
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    // Initial state setup
    const [parameters, setParameters] = useState<EnvironmentParameter[]>([]);
    const [advancedParameters, setAdvancedParameters] = useState<EnvironmentParameter[]>([]);

    // Fetch Base Data
    useEffect(() => {
        const initData = async () => {
            console.log('Fetching Metric Types and Zones...');
            await fetchMetricTypes();
            await fetchZones(); // Ensure zones are loaded
        };
        initData();
    }, [fetchMetricTypes, fetchZones]);

    // Set initial location when zones are loaded
    useEffect(() => {
        if (zones && zones.length > 0 && !selectedLocation) {
            // Priority: selectedZoneId from store -> First Zone
            const current = selectedZoneId ? zones.find(z => z.id === selectedZoneId) : zones[0];
            const target = current || zones[0];

            setSelectedLocation({ id: String(target.id), name: target.name });
        }
    }, [zones, selectedLocation, selectedZoneId]);

    // Fetch Settings when location changes
    useEffect(() => {
        if (selectedLocation) {
            fetchParameterSettings(selectedLocation.id);
        }
    }, [selectedLocation, fetchParameterSettings]);

    // Sync Data: Combine MetricTypes with ParameterSettings
    // Extract current settings to a constant for stable application
    const currentZoneSettings = selectedLocation
        ? parameterSettings[selectedLocation.id]
        : undefined;

    // Sync Data: Combine MetricTypes with ParameterSettings
    const syncData = useCallback(() => {
        if (metricTypes.length > 0 && selectedLocation) {
            const currentSettings = currentZoneSettings || [];

            // Map settings by code for easy lookup
            const settingsMap = new Map<string, ParameterSetting>();
            if (Array.isArray(currentSettings)) {
                currentSettings.forEach(s => {
                    if (s.parameterCode) settingsMap.set(s.parameterCode, s);
                });
            }

            const newParams: EnvironmentParameter[] = [];
            const newAdvancedParams: EnvironmentParameter[] = [];

            metricTypes.forEach(metric => {
                const setting = settingsMap.get(metric.metricCode);

                // Updated Default Group: pH (1), Salinity (2), Alkalinity (3), Temp (4), DO (10), Transparency (15)
                const isDefault = [1, 2, 3, 4, 10, 15].includes(metric.id);

                const minValue = setting?.minValue?.toString() ?? '';
                const maxValue = setting?.maxValue?.toString() ?? '';
                const limitStr = minValue && maxValue ? `${minValue} - ${maxValue}` : '';

                const param: EnvironmentParameter = {
                    id: String(metric.id),
                    name: metric.metricName,
                    min: minValue,
                    max: maxValue,
                    limit: limitStr,
                    isChecked: !!setting,
                    unit: metric.unitName,
                };

                // If setting has `enabled`, use it
                if (setting && setting.enabled !== undefined) {
                    param.isChecked = setting.enabled;
                }

                if (isDefault) {
                    newParams.push(param);
                } else {
                    newAdvancedParams.push(param);
                }
            });

            setParameters(newParams);
            setAdvancedParameters(newAdvancedParams);
        }
    }, [metricTypes, selectedLocation, currentZoneSettings]);

    useEffect(() => {
        syncData();
    }, [syncData]);

    // Calculate dirty state
    const isDirty = useMemo(() => {
        // Simplified check: just check if any value changed from current state vs stored state
        // For now, always enable save if there are parameters
        return parameters.length > 0 || advancedParameters.length > 0;
    }, [parameters, advancedParameters]);

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleDropdownPress = () => {
        if (dropdownButtonRef.current) {
            dropdownButtonRef.current.measureInWindow((x, y, width, height) => {
                setDropdownPosition({
                    top: y + height + 4,
                    left: x,
                    width: width,
                });
                setIsDropdownVisible(true);
            });
        }
    };

    const handleSelectLocation = (location: FarmLocation) => {
        setSelectedLocation(location);
        setIsDropdownVisible(false);
    };

    const handleToggleParameter = (id: string | number) => {
        setParameters(prev =>
            prev.map(param => (param.id === id ? { ...param, isChecked: !param.isChecked } : param))
        );
    };

    const handleToggleAdvancedParameter = (id: string | number) => {
        setAdvancedParameters(prev =>
            prev.map(param => (param.id === id ? { ...param, isChecked: !param.isChecked } : param))
        );
    };

    const handleUpdateParameter = (updatedParam: EnvironmentParameter) => {
        // Validate limit format: "min - max"
        if (updatedParam.min && updatedParam.max) {
            const lower = parseFloat(updatedParam.min);
            const upper = parseFloat(updatedParam.max);

            if (!isNaN(lower) && !isNaN(upper) && lower > upper) {
                Toast.show({
                    type: 'error',
                    text1: 'Giới hạn dưới không được lớn hơn giới hạn trên',
                });
                return; // Stop update
            }
            // Update limit string for display
            updatedParam.limit = `${updatedParam.min} - ${updatedParam.max}`;
        }
        setParameters(prev => prev.map(p => (p.id === updatedParam.id ? updatedParam : p)));
        setAdvancedParameters(prev => prev.map(p => (p.id === updatedParam.id ? updatedParam : p)));
    };

    const handleEdit = (parameter: EnvironmentParameter) => {
        (navigation as any).navigate('EditEnvironment', {
            parameter,
            onSave: handleUpdateParameter,
        });
    };

    // Save Handler with Create/Update/Delete logic
    const handleSave = async () => {
        if (!selectedLocation) return;

        try {
            const currentSettings = parameterSettings[selectedLocation.id] || [];
            const allUIParams = [...parameters, ...advancedParameters];

            // List of promises to execute
            const promises: Promise<void>[] = [];
            const zoneId = selectedLocation.id;
            // Use store actions directly
            const { createParameterSetting, updateParameterSetting, deleteParameterSetting } =
                useFarmStore.getState();

            console.log('handleSave starting...', {
                zoneId,
                zoneName: selectedLocation.name,
                paramsCount: allUIParams.length,
                metricTypesCount: metricTypes.length,
                currentSettingsCount: Array.isArray(currentSettings)
                    ? currentSettings.length
                    : 'Not Array',
            });

            for (const p of allUIParams) {
                const metricId = Number(p.id); // Convert back to number for matching
                const isChecked = p.isChecked;
                const minVal = p.min ? parseFloat(p.min) : undefined;
                const maxVal = p.max ? parseFloat(p.max) : undefined;

                // Find existing setting by CODE.
                // We need the code first.
                const metric = metricTypes.find(m => m.id === metricId);
                const existingSetting = metric
                    ? currentSettings.find(s => s.parameterCode === metric.metricCode)
                    : undefined;

                if (!metric) continue;

                if (isChecked) {
                    // Create or Update
                    const parameterCode = metric.metricCode;

                    // Only send if we have valid values or if it's a create
                    // Ideally we should validate min < max before this loop (handled in handleUpdateParameter)
                    // If values are missing/invalid, what to do? Skip or send 0?
                    // Sending 0 might be dangerous. Let's default to 0 if undefined for now to satisfy type,
                    // or skip if both are missing?
                    // Assuming required.

                    const payload = {
                        parameterCode,
                        minValue: minVal ?? 0,
                        maxValue: maxVal ?? 0,
                        enabled: true,
                        alert: existingSetting?.alert, // Preserve existing alert message logic
                    };

                    if (existingSetting) {
                        // UPDATE if changed
                        if (
                            existingSetting.minValue !== minVal ||
                            existingSetting.maxValue !== maxVal
                        ) {
                            console.log('Pushing Update Promise', {
                                id: existingSetting.id,
                                payload,
                            });
                            promises.push(
                                updateParameterSetting(zoneId, existingSetting.id, payload)
                            );
                        } else {
                            console.log('Skipping Update (No Change)', { id: existingSetting.id });
                        }
                    } else {
                        // CREATE
                        console.log('Pushing Create Promise', { zoneId, payload });
                        promises.push(createParameterSetting(zoneId, payload));
                    }
                } else {
                    // DELETE if it exists (or Disable?)
                    if (existingSetting) {
                        promises.push(deleteParameterSetting(zoneId, existingSetting.id));
                    }
                }
            }

            await Promise.all(promises);

            Toast.show({
                type: 'success',
                text1: 'Đã lưu thiết lập thành công',
                position: 'top',
                visibilityTime: 3000,
            });
            navigation.goBack();
        } catch (error) {
            console.error('Save failed:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi khi lưu thiết lập',
                text2: 'Vui lòng thử lại sau',
            });
        }
    };

    const handleReset = () => {
        // Reset to initial values (re-sync with store/API)
        syncData();
    };

    const renderDropdownItem = ({ item }: { item: FarmLocation }) => {
        const isSelected = selectedLocation ? item.id === selectedLocation.id : false;
        return (
            <TouchableOpacity
                style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                onPress={() => handleSelectLocation(item)}
                activeOpacity={0.7}
            >
                <Text
                    style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}
                >
                    {item.name}
                </Text>
                {isSelected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerSection}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thiết lập thông số môi trường</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Divider between header and dropdown */}
                <View style={styles.headerDivider} />

                {/* Dropdown Button */}
                <View style={styles.dropdownWrapper}>
                    <View ref={dropdownButtonRef} collapsable={false}>
                        <TouchableOpacity
                            style={[
                                styles.dropdownButton,
                                { opacity: 1, backgroundColor: colors.white },
                            ]}
                            onPress={handleDropdownPress}
                            disabled={true}
                            activeOpacity={1}
                        >
                            <Text style={[styles.dropdownButtonText, { color: colors.text }]}>
                                {selectedLocation?.name || 'Chọn trại'}
                            </Text>
                            {/* Hide Chevron or show lock? User said 'disable'. I will hide chevron to indicate no interaction or keep it but static? 
                                User requests 'disable luôn' => No interaction. 
                                I'll remove the chevron to make it look like a static header. 
                             */}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Section - Nhóm mặc định */}
                <EnvironmentParameterSection
                    title="Nhóm mặc định"
                    subtitle="Bộ thông số chuẩn khi đo môi trường."
                    parameters={parameters}
                    onToggleParameter={handleToggleParameter}
                    onEdit={handleEdit}
                />

                {/* Section - Nhóm nâng cao */}
                <EnvironmentParameterSection
                    title="Nhóm nâng cao"
                    subtitle="Bộ thông số mở rộng để theo dõi."
                    parameters={advancedParameters}
                    onToggleParameter={handleToggleAdvancedParameter}
                    onEdit={handleEdit}
                />
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footerContainer}>
                <ButtonBarFarm
                    primaryTitle="Lưu thông tin"
                    secondaryTitle="Thiết lập lại"
                    onPrimaryPress={handleSave}
                    onSecondaryPress={handleReset}
                    primaryDisabled={!isDirty}
                    secondaryType="primary"
                />
            </View>

            {/* Dropdown Modal */}
            <Modal
                visible={isDropdownVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsDropdownVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsDropdownVisible(false)}
                >
                    <View
                        style={[
                            styles.dropdownModal,
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
                                renderItem={renderDropdownItem}
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
