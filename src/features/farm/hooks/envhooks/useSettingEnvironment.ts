import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { EnvironmentParameter } from '@/features/farm/components/pondwork/environment/EnvironmentParameterSection';
import { EnvMetricType, ParameterSetting } from '@/features/farm/api/environmentApi';

interface UseSettingEnvironmentProps {
    selectedLocation: { id: string; name: string } | null;
    metricTypes: EnvMetricType[];
    parameterSettings: Record<string, ParameterSetting[]>;
    uiParameters: {
        parameters: EnvironmentParameter[];
        advancedParameters: EnvironmentParameter[];
    };
}

export const useSettingEnvironment = ({
    selectedLocation,
    metricTypes,
    parameterSettings,
    uiParameters,
}: UseSettingEnvironmentProps) => {
    const navigation = useNavigation();

    // Filter/Params State
    const [parameters, setParameters] = useState<EnvironmentParameter[]>([]);
    const [advancedParameters, setAdvancedParameters] = useState<EnvironmentParameter[]>([]);

    // Sync local state when UI parameters change (only if location changed or initial load)
    const prevLocationIdRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        const isNewLocation = selectedLocation?.id !== prevLocationIdRef.current;
        const isEmpty = parameters.length === 0 && advancedParameters.length === 0;

        // Sync if it's a new location OR if we haven't initialized yet
        if (isNewLocation || isEmpty) {
            if (uiParameters.parameters.length > 0 || uiParameters.advancedParameters.length > 0) {
                setParameters(uiParameters.parameters);
                setAdvancedParameters(uiParameters.advancedParameters);
                prevLocationIdRef.current = selectedLocation?.id;
            }
        }
    }, [uiParameters, selectedLocation?.id, parameters.length, advancedParameters.length]);

    // Force re-sync when uiParameters content changes (e.g., when parameterSettings is fetched)
    // This ensures limits are updated even if location hasn't changed
    const uiParametersHash = useMemo(() => {
        // Create a hash of the first parameter's limit to detect changes
        const firstParam = uiParameters.parameters[0];
        return firstParam ? `${firstParam.id}-${firstParam.limit}` : '';
    }, [uiParameters]);

    const prevHashRef = useRef<string>('');

    useEffect(() => {
        if (uiParametersHash && uiParametersHash !== prevHashRef.current && parameters.length > 0) {
            setParameters(uiParameters.parameters);
            setAdvancedParameters(uiParameters.advancedParameters);
            prevHashRef.current = uiParametersHash;
        }
    }, [uiParametersHash, uiParameters, parameters.length]);

    // Calculate dirty state
    const isDirty = useMemo(() => {
        return parameters.length > 0 || advancedParameters.length > 0;
    }, [parameters, advancedParameters]);

    const handleToggleParameter = (id: string) => {
        setParameters(prev =>
            prev.map(param => (param.id === id ? { ...param, isChecked: !param.isChecked } : param))
        );
    };

    const handleToggleAdvancedParameter = (id: string) => {
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

    const handleReset = () => {
        // Reset to derived UI parameters
        setParameters(uiParameters.parameters);
        setAdvancedParameters(uiParameters.advancedParameters);
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
            const { createParameterSetting, updateParameterSetting } = useFarmStore.getState();

            for (const p of allUIParams) {
                const metricId = p.id; // UUID String
                const isChecked = p.isChecked;
                const minVal = p.min ? parseFloat(p.min) : undefined;
                const maxVal = p.max ? parseFloat(p.max) : undefined;

                // Find existing setting by metricId (UUID)
                let existingSetting = currentSettings.find(
                    s => String(s.metricId) === String(metricId)
                );

                if (!existingSetting) {
                    // If not found by metricId, try to find by parameterCode (backward compatibility)
                    const metric = metricTypes.find(m => String(m.id) === metricId);
                    if (metric) {
                        const settingByCode = currentSettings.find(
                            s => s.parameterCode === metric.code
                        );
                        if (settingByCode) {
                            // Use this setting
                            existingSetting = settingByCode;
                        }
                    }
                }

                const metric = metricTypes.find(m => String(m.id) === metricId);
                if (!metric) continue;

                if (isChecked) {
                    // Create or Update
                    const payload = {
                        metricId: metricId, // Send UUID directly
                        minValue: minVal ?? 0,
                        maxValue: maxVal ?? 0,
                        enabled: true,
                        isActive: true, // Ensure backend sees it as active
                        alert: p.alertEnabled ?? true, // Send boolean (default true)
                    };

                    if (existingSetting) {
                        // UPDATE if changed
                        // Check alert change handling both string and boolean from existing
                        const existingAlert =
                            existingSetting.alert === 'true' || existingSetting.alert === true;
                        const alertChanged = existingAlert !== (p.alertEnabled ?? true);

                        // Check both enabled and isActive for changes
                        const currentEnabled =
                            existingSetting.enabled !== undefined
                                ? existingSetting.enabled
                                : existingSetting.isActive !== undefined
                                ? existingSetting.isActive
                                : true;

                        const enabledChanged = currentEnabled !== true;
                        const minChanged = existingSetting.minValue !== minVal;
                        const maxChanged = existingSetting.maxValue !== maxVal;

                        if (minChanged || maxChanged || enabledChanged || alertChanged) {
                            promises.push(
                                updateParameterSetting(zoneId, existingSetting.id, payload)
                            );
                        }
                    } else {
                        // CREATE
                        promises.push(createParameterSetting(zoneId, payload));
                    }
                } else {
                    // Disable (Update enabled=false) instead of DELETE
                    // Backend prevents deletion for active farms, so we just disable it
                    if (existingSetting) {
                        // Only update if currently enabled (or undefined which implies enabled)
                        const currentEnabled =
                            existingSetting.enabled !== undefined
                                ? existingSetting.enabled
                                : existingSetting.isActive !== undefined
                                ? existingSetting.isActive
                                : true;

                        if (currentEnabled !== false) {
                            const payload = {
                                metricId: metricId,
                                minValue: existingSetting.minValue,
                                maxValue: existingSetting.maxValue,
                                enabled: false,
                                isActive: false, // Ensure backend sees it as inactive
                                alert: existingSetting.alert,
                            };

                            promises.push(
                                updateParameterSetting(zoneId, existingSetting.id, payload)
                            );
                        }
                    }
                }
            }

            await Promise.all(promises);

            // Refetch settings ONCE after all updates are complete
            await useFarmStore.getState().fetchParameterSettings(zoneId);

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

    return {
        parameters,
        advancedParameters,
        isDirty,
        handleToggleParameter,
        handleToggleAdvancedParameter,
        handleUpdateParameter,
        handleReset,
        handleSave,
    };
};
