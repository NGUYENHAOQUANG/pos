import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { EnvironmentParameter } from '@/features/farm/components/pondwork/environment/EnvironmentParameterSection';
import { ParameterSetting } from '@/features/farm/api/environmentApi';
import { Metric } from '@/features/farm/types/metric.types';
import {
    CreateEnvironmentSettingRequest,
    UpdateEnvironmentSettingRequest,
} from '@/features/farm/types/environmentSettings.types';
import {
    useEnvironmentSettings,
    useCreateEnvironmentSetting,
    useUpdateEnvironmentSetting,
} from '@/features/farm/hooks/pondwork/envhooks/useSettingEnvironment';
import { useMetrics } from '@/features/farm/hooks/metric/useMetric';
import { handleError } from '@/shared/utils/errorHandler';
import { ENVIRONMENT_METRIC_IDS } from '@/features/farm/types/farm.types';
import {
    useEnvironmentSettingStore,
    EnvironmentSettingInfo,
} from '@/features/farm/store/environmentSettingStore';

interface UseEnvironmentSettingLogicProps {
    selectedLocation: { id: string; name: string } | null;
}

const mapMetricToUI = (
    metric: Metric,
    settings: ParameterSetting[],
    pendingChanges: Record<string, EnvironmentSettingInfo>
): EnvironmentParameter => {
    const pending = pendingChanges[metric.id];
    let min: number, max: number, isChecked: boolean;

    if (pending) {
        min = pending.data.minValue;
        max = pending.data.maxValue;
        isChecked = pending.data.isActive;
    } else {
        const setting = settings.find(s => s.metricId === metric.id);
        min = setting?.minValue ?? 0;
        max = setting?.maxValue ?? 0;
        isChecked = setting?.isActive ?? false;
    }

    return {
        id: metric.id,
        name: metric.name,
        unit: metric.unitMetric,
        min: min.toString(),
        max: max.toString(),
        limit: `${min} - ${max}`,
        isChecked,
        alertEnabled: true,
    };
};

export const useEnvironmentSettingLogic = ({
    selectedLocation,
}: UseEnvironmentSettingLogicProps) => {
    const navigation = useNavigation();
    const zoneId = selectedLocation?.id || '';

    const { data: metricResponse } = useMetrics();
    const metricTypes = useMemo(() => metricResponse?.data || [], [metricResponse]);

    const { data: settingsPage, isLoading: isLoadingSettings } = useEnvironmentSettings(zoneId);

    const parameterSettings = useMemo(() => settingsPage?.items || [], [settingsPage]);

    const createSetting = useCreateEnvironmentSetting();
    const updateSetting = useUpdateEnvironmentSetting();

    const pendingChanges = useEnvironmentSettingStore(state => state.pendingChanges);
    const addChange = useEnvironmentSettingStore(state => state.addChange);
    const removeChange = useEnvironmentSettingStore(state => state.removeChange);
    const clearChanges = useEnvironmentSettingStore(state => state.clearChanges);

    const [parameters, setParameters] = useState<EnvironmentParameter[]>([]);
    const [advancedParameters, setAdvancedParameters] = useState<EnvironmentParameter[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const syncData = useCallback(() => {
        if (!metricTypes.length || !selectedLocation) return;

        const sorted = [...metricTypes].sort((a, b) => (a.no || 0) - (b.no || 0));

        const basicMetricCodes: string[] = [
            ENVIRONMENT_METRIC_IDS.PH,
            ENVIRONMENT_METRIC_IDS.DO,
            ENVIRONMENT_METRIC_IDS.TEMPERATURE,
            ENVIRONMENT_METRIC_IDS.TRANSPARENCY,
            ENVIRONMENT_METRIC_IDS.SALINITY,
            ENVIRONMENT_METRIC_IDS.ALKALINITY,
        ];

        const basicMetrics = sorted.filter(m => basicMetricCodes.includes(m.code));
        const advancedMetrics = sorted.filter(m => !basicMetricCodes.includes(m.code));

        setParameters(basicMetrics.map(m => mapMetricToUI(m, parameterSettings, pendingChanges)));
        setAdvancedParameters(
            advancedMetrics.map(m => mapMetricToUI(m, parameterSettings, pendingChanges))
        );
    }, [metricTypes, selectedLocation, parameterSettings, pendingChanges]);

    useEffect(() => {
        syncData();
    }, [syncData]);

    useEffect(() => {
        return () => {
            clearChanges();
        };
    }, [zoneId, clearChanges]);

    const isDirty = useMemo(() => Object.keys(pendingChanges).length > 0, [pendingChanges]);

    const handleToggle = (id: string, list: EnvironmentParameter[]) => {
        const param = list.find(p => p.id === id);
        if (!param) return;

        const existingSetting = parameterSettings.find(s => s.metricId === id);
        const currentIsActive = param.isChecked;
        const newIsActive = !currentIsActive;

        // Check if the new state matches the original state
        const originalIsActive = existingSetting ? existingSetting.isActive : false;

        // Similarly for min/max - though currently toggle only changes isActive
        // In a more robust implementation, we'd check all fields.
        // But for toggle specifically, we check isActive.

        if (newIsActive === originalIsActive) {
            // If we toggled back to original state, remove from pending changes
            removeChange(id);
            return;
        }

        const currentMin = parseFloat(param.min || '0');
        const currentMax = parseFloat(param.max || '0');

        const settingId = existingSetting?.id;

        if (settingId) {
            const payload: UpdateEnvironmentSettingRequest = {
                metricId: id,
                minValue: currentMin,
                maxValue: currentMax,
                isActive: newIsActive,
            };
            addChange(id, {
                metricId: id,
                settingId,
                data: payload,
                type: 'update',
            });
        } else {
            const payload: CreateEnvironmentSettingRequest = {
                metricId: id,
                minValue: currentMin,
                maxValue: currentMax,
                isActive: newIsActive,
            };
            addChange(id, {
                metricId: id,
                data: payload,
                type: 'create',
            });
        }
    };

    const handleToggleParameter = (id: string) => handleToggle(id, parameters);
    const handleToggleAdvancedParameter = (id: string) => handleToggle(id, advancedParameters);

    const handleReset = () => {
        clearChanges();
    };

    const handleSave = async () => {
        if (!selectedLocation) return;
        setIsSaving(true);

        try {
            const changes = Object.values(pendingChanges);
            const promises: Promise<any>[] = [];

            for (const change of changes) {
                if (change.type === 'update' && change.settingId) {
                    promises.push(
                        updateSetting.mutateAsync({
                            zoneId,
                            id: change.settingId,
                            data: change.data as UpdateEnvironmentSettingRequest,
                        })
                    );
                } else if (change.type === 'create') {
                    promises.push(
                        createSetting.mutateAsync({
                            zoneId,
                            data: change.data as CreateEnvironmentSettingRequest,
                        })
                    );
                }
            }

            if (promises.length > 0) {
                await Promise.all(promises);
                Toast.show({ type: 'success', text1: 'Đã lưu thiết lập thành công' });
                clearChanges();
                navigation.goBack();
            } else {
                navigation.goBack();
            }
        } catch (error) {
            handleError(error);
        } finally {
            setIsSaving(false);
        }
    };

    return {
        parameters,
        advancedParameters,
        isDirty,
        isLoading: isLoadingSettings,
        isSaving,
        handleToggleParameter,
        handleToggleAdvancedParameter,
        handleReset,
        handleSave,
    };
};
