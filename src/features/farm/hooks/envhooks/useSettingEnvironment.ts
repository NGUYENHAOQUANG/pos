import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { EnvironmentParameter } from '@/features/farm/components/pondwork/environment/EnvironmentParameterSection';
import { EnvMetricType, ParameterSetting } from '@/features/farm/api/environmentApi';

interface UseSettingEnvironmentProps {
    selectedLocation: { id: string | number; name: string } | null;
    metricTypes: EnvMetricType[];
    parameterSettings: Record<string | number, ParameterSetting[]>;
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
    const prevLocationIdRef = useRef<string | number | undefined>(undefined);

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

    // Calculate dirty state
    const isDirty = useMemo(() => {
        return parameters.length > 0 || advancedParameters.length > 0;
    }, [parameters, advancedParameters]);

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
            const { createParameterSetting, updateParameterSetting, deleteParameterSetting } =
                useFarmStore.getState();

            for (const p of allUIParams) {
                const metricId = Number(p.id); // Convert back to number for matching
                const isChecked = p.isChecked;
                const minVal = p.min ? parseFloat(p.min) : undefined;
                const maxVal = p.max ? parseFloat(p.max) : undefined;

                // Find existing setting by CODE.
                const metric = metricTypes.find(m => m.id === metricId);
                const existingSetting = metric
                    ? currentSettings.find(s => s.parameterCode === metric.metricCode)
                    : undefined;

                if (!metric) continue;

                if (isChecked) {
                    // Create or Update
                    const parameterCode = metric.metricCode;
                    const payload = {
                        parameterCode,
                        minValue: minVal ?? 0,
                        maxValue: maxVal ?? 0,
                        enabled: true,
                        alert: p.alertEnabled ? 'true' : 'false', // Save alert warning state
                    };

                    if (existingSetting) {
                        // UPDATE if changed
                        if (
                            existingSetting.minValue !== minVal ||
                            existingSetting.maxValue !== maxVal
                        ) {
                            promises.push(
                                updateParameterSetting(zoneId, existingSetting.id, payload)
                            );
                        }
                    } else {
                        // CREATE
                        promises.push(createParameterSetting(zoneId, payload));
                    }
                } else {
                    // DELETE if it exists
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
