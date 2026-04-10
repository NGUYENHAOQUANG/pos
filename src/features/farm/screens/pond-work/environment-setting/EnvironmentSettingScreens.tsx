import React, { useMemo, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { EnvironmentParameter } from '@/features/farm/components/pondwork/environment/EnvironmentParameterSection';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useZones } from '@/features/farm/hooks/useZones';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import {
    CreateEnvironmentSettingRequest,
    UpdateEnvironmentSettingRequest,
} from '@/features/farm/types/environmentSettings.types';
import {
    useEnvironmentSettings,
    useSaveEnvironmentSettings,
} from '@/features/farm/hooks/pondwork/envhooks/useSettingEnvironment';
import { useMetrics } from '@/features/farm/hooks/metric/useMetric';
import { ENVIRONMENT_METRIC_IDS } from '@/features/farm/types/farm.types';
import { useEnvironmentSettingStore } from '@/features/farm/store/environmentSettingStore';
import { environmentSettingService } from '@/features/farm/services/environment-setting.service';

import { SettingEnvironmentForm } from '@/features/farm/screens/pond-work/environment-setting/EnvironmentSettingForm';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const BASIC_METRIC_CODES: string[] = [
    ENVIRONMENT_METRIC_IDS.PH,
    ENVIRONMENT_METRIC_IDS.DO,
    ENVIRONMENT_METRIC_IDS.TEMPERATURE,
    ENVIRONMENT_METRIC_IDS.TRANSPARENCY,
    ENVIRONMENT_METRIC_IDS.SALINITY,
    ENVIRONMENT_METRIC_IDS.ALKALINITY,
];

export const SettingEnvironmentScreens: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    const { data: zonesData } = useZones();
    const zones = useMemo(() => zonesData || [], [zonesData]);

    const pendingChanges = useEnvironmentSettingStore(state => state.pendingChanges);
    const addChange = useEnvironmentSettingStore(state => state.addChange);
    const removeChange = useEnvironmentSettingStore(state => state.removeChange);
    const clearChanges = useEnvironmentSettingStore(state => state.clearChanges);

    // --- Derived State ---
    const activeLocation = useMemo(() => {
        if (zones && zones.length > 0) {
            const storeZone = selectedZoneId ? zones.find(z => z.id === selectedZoneId) : null;
            const target = storeZone || zones[0];
            return { id: String(target.id), name: target.name };
        }
        return null;
    }, [zones, selectedZoneId]);

    const zoneId = activeLocation?.id || '';

    // --- Server State (TanStack Query) ---
    const { data: metricResponse, isLoading: isLoadingMetrics } = useMetrics();
    const metricTypes = useMemo(() => metricResponse?.data || [], [metricResponse]);

    const { data: settingsPage, isLoading: isLoadingSettings } = useEnvironmentSettings(zoneId);
    const parameterSettings = useMemo(() => settingsPage?.items || [], [settingsPage]);

    const { save, isSaving } = useSaveEnvironmentSettings(zoneId);

    const isLoading = isLoadingMetrics || isLoadingSettings || !zoneId;

    // --- Data Mapping (Service) ---
    const parameters = useMemo<EnvironmentParameter[]>(() => {
        if (!metricTypes.length || !activeLocation) return [];
        const basicMetrics = metricTypes.filter(m => BASIC_METRIC_CODES.includes(m.code));
        return basicMetrics.map(m =>
            environmentSettingService.mapMetricToUI(m, parameterSettings, pendingChanges)
        );
    }, [metricTypes, activeLocation, parameterSettings, pendingChanges]);

    const advancedParameters = useMemo<EnvironmentParameter[]>(() => {
        if (!metricTypes.length || !activeLocation) return [];
        const advancedMetrics = metricTypes.filter(m => !BASIC_METRIC_CODES.includes(m.code));
        return advancedMetrics.map(m =>
            environmentSettingService.mapMetricToUI(m, parameterSettings, pendingChanges)
        );
    }, [metricTypes, activeLocation, parameterSettings, pendingChanges]);

    const isDirty = useMemo(() => Object.keys(pendingChanges).length > 0, [pendingChanges]);

    // --- Effects ---
    useEffect(() => {
        return () => {
            useEnvironmentSettingStore.getState().clearChanges();
        };
    }, [zoneId]);

    // --- Handlers ---
    const handleToggle = useCallback(
        (id: string, list: EnvironmentParameter[]) => {
            const param = list.find(p => p.id === id);
            if (!param) return;

            const existingSetting = parameterSettings.find(s => s.metricId === id);
            const newIsActive = !param.isChecked;
            const originalIsActive = existingSetting?.isActive ?? false;

            if (newIsActive === originalIsActive) {
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
                addChange(id, { metricId: id, settingId, data: payload, type: 'update' });
            } else {
                const payload: CreateEnvironmentSettingRequest = {
                    metricId: id,
                    minValue: currentMin,
                    maxValue: currentMax,
                    isActive: newIsActive,
                };
                addChange(id, { metricId: id, data: payload, type: 'create' });
            }
        },
        [parameterSettings, addChange, removeChange]
    );

    const handleToggleParameter = useCallback(
        (id: string) => handleToggle(id, parameters),
        [handleToggle, parameters]
    );

    const handleToggleAdvancedParameter = useCallback(
        (id: string) => handleToggle(id, advancedParameters),
        [handleToggle, advancedParameters]
    );

    const handleReset = useCallback(() => {
        clearChanges();
    }, [clearChanges]);

    const handleSave = useCallback(async () => {
        if (!activeLocation) return;
        const success = await save();
        if (success) {
            navigation.goBack();
        }
    }, [activeLocation, save, navigation]);

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleEdit = useCallback(
        (parameter: EnvironmentParameter) => {
            navigation.navigate('EditEnvironment', { parameter });
        },
        [navigation]
    );

    // --- Unsaved Changes ---
    const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(isDirty);

    const handleSaveWithBypass = useCallback(async () => {
        allowNavigation();
        await handleSave();
    }, [allowNavigation, handleSave]);

    // --- Render Presenter ---
    return (
        <SettingEnvironmentForm
            isLoading={isLoading}
            isDirty={isDirty}
            isSaving={isSaving}
            parameters={parameters}
            advancedParameters={advancedParameters}
            onBack={handleBack}
            onToggleParameter={handleToggleParameter}
            onToggleAdvancedParameter={handleToggleAdvancedParameter}
            onEdit={handleEdit}
            onSave={handleSaveWithBypass}
            onReset={handleReset}
            UnsavedChangesModal={UnsavedChangesModal}
        />
    );
};
