import { useState, useMemo, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {
    EnvironmentMeta,
    ENVIRONMENT_METRIC_IDS,
    PondData,
    Zone,
    JobExecution,
} from '@/features/farm/types/farm.types';
import { formatDate, parseDate } from '@/features/farm/utils/dateUtils';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import { EnvMetricType, ParameterSetting } from '@/features/farm/api/environmentApi';
import { JobType } from '@/features/farm/components/pondwork/JobItem';

interface UseAddEnvironmentProps {
    pond: PondData;
    itemToEdit?: JobExecution;
    currentZone?: Zone | null;
    metricTypes: EnvMetricType[];
    parameterSettings: Record<string | number, ParameterSetting[]>;
    environmentSettings: {
        advancedParameters: Array<{ id: string; name: string; isChecked: boolean }>;
    };
    updatePondJob: (pondId: string, jobType: JobType, data: JobExecution[]) => void;
    getPondJobItems: (pondId: string, jobType: JobType) => JobExecution[];
    parameterLimits: Record<string, string>;
}

export const useAddEnvironment = ({
    pond,
    itemToEdit,
    currentZone,
    metricTypes,
    parameterSettings,
    environmentSettings,
    updatePondJob,
    getPondJobItems,
    parameterLimits,
}: UseAddEnvironmentProps) => {
    const navigation = useNavigation();

    // Helper: Check Limit
    const checkLimit = (value: string, paramId: string): boolean => {
        if (!value || !value.trim()) return false;
        const limit = parameterLimits[paramId];
        if (!limit) return false;

        const parts = limit.split('-');
        if (parts.length !== 2) return false;

        const min = parseFloat(parts[0].trim());
        const max = parseFloat(parts[1].trim());
        const val = parseFloat(value.trim());

        if (isNaN(min) || isNaN(max) || isNaN(val)) return false;
        return val < min || val > max;
    };

    const meta = useMemo(
        () => (itemToEdit?.meta as EnvironmentMeta) || ({} as EnvironmentMeta),
        [itemToEdit?.meta]
    );

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [notes, setNotes] = useState(itemToEdit?.note || '');
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    // Parameters State
    const [pH, setPH] = useState(meta.pH || '');
    const [dissolvedOxygen, setDissolvedOxygen] = useState(meta.do || '');
    const [temperature, setTemperature] = useState(meta.temperature || '');
    const [salinity, setSalinity] = useState(meta.salinity || '');
    const [alkalinity, setAlkalinity] = useState(meta.alkalinity || '');
    const [transparency, setTransparency] = useState(meta.transparency || '');
    const [showParameterError, setShowParameterError] = useState(false);

    // Advanced Parameters State
    const [kali, setKali] = useState(meta.kali || '');
    const [tan, setTan] = useState(meta.tan || '');
    const [magie, setMagie] = useState(meta.magie || '');
    const [no3, setNo3] = useState(meta.no3 || '');

    // Advanced Params Initialization
    const initialAdvancedParams = useMemo(() => {
        if (itemToEdit && meta) {
            const advancedParams: Array<{ id: string; name: string }> = [];
            if (meta.kali !== undefined)
                advancedParams.push({ id: ENVIRONMENT_METRIC_IDS.KALI, name: 'Kali (mg/L)' });
            if (meta.tan !== undefined)
                advancedParams.push({ id: ENVIRONMENT_METRIC_IDS.TAN, name: 'TAN (mg/L)' });
            if (meta.magie !== undefined)
                advancedParams.push({ id: ENVIRONMENT_METRIC_IDS.MAGIE, name: 'Magie (mg/L)' });
            if (meta.no3 !== undefined)
                advancedParams.push({ id: ENVIRONMENT_METRIC_IDS.NO3, name: 'NO3 (mg/L)' });
            return advancedParams;
        } else {
            if (currentZone && parameterSettings[currentZone.id]) {
                const settings = parameterSettings[currentZone.id];
                const validAdvanced: Array<{ id: string; name: string }> = [];

                if (Array.isArray(settings) && metricTypes.length > 0) {
                    // Get UUIDs for advanced parameters
                    const advancedCodes = [
                        ENVIRONMENT_METRIC_IDS.KALI,
                        ENVIRONMENT_METRIC_IDS.TAN,
                        ENVIRONMENT_METRIC_IDS.MAGIE,
                        ENVIRONMENT_METRIC_IDS.NO3,
                    ];
                    const advancedIds = metricTypes
                        .filter(m => (advancedCodes as readonly string[]).includes(m.code))
                        .map(m => String(m.id));

                    settings.forEach((setting: ParameterSetting) => {
                        let metric: EnvMetricType | undefined;

                        // Find metric by metricId (UUID) first
                        if (setting.metricId) {
                            metric = metricTypes.find(
                                (m: EnvMetricType) => String(m.id) === setting.metricId
                            );
                        }
                        // Fallback to parameterCode for backward compatibility
                        if (!metric && setting.parameterCode) {
                            metric = metricTypes.find(
                                (m: EnvMetricType) => m.code === setting.parameterCode
                            );
                        }

                        if (metric && setting.enabled) {
                            const id = String(metric.id);
                            if ((advancedIds as readonly string[]).includes(id)) {
                                validAdvanced.push({ id, name: metric.name });
                            }
                        }
                    });
                    validAdvanced.sort((a, b) => Number(a.id) - Number(b.id));
                    return validAdvanced;
                }
            }
            return environmentSettings.advancedParameters
                .filter(p => p.isChecked)
                .map(p => ({ id: p.id, name: p.name }));
        }
    }, [
        itemToEdit,
        meta,
        environmentSettings.advancedParameters,
        currentZone,
        parameterSettings,
        metricTypes,
    ]);

    const [advancedParameters, setAdvancedParameters] =
        useState<Array<{ id: string; name: string }>>(initialAdvancedParams);

    // Effect to update advanced params on prop change
    // Effect to update advanced params on prop change
    useEffect(() => {
        if (itemToEdit && meta) {
            const advancedParams: Array<{ id: string; name: string }> = [];
            if (meta.kali !== undefined)
                advancedParams.push({ id: ENVIRONMENT_METRIC_IDS.KALI, name: 'Kali (mg/L)' });
            if (meta.tan !== undefined)
                advancedParams.push({ id: ENVIRONMENT_METRIC_IDS.TAN, name: 'TAN (mg/L)' });
            if (meta.magie !== undefined)
                advancedParams.push({ id: ENVIRONMENT_METRIC_IDS.MAGIE, name: 'Magie (mg/L)' });
            if (meta.no3 !== undefined)
                advancedParams.push({ id: ENVIRONMENT_METRIC_IDS.NO3, name: 'NO3 (mg/L)' });
            setAdvancedParameters(advancedParams);
        } else if (currentZone && parameterSettings[currentZone.id]) {
            const settings = parameterSettings[currentZone.id];
            const validAdvanced: Array<{ id: string; name: string }> = [];
            if (Array.isArray(settings) && metricTypes.length > 0) {
                // Get UUIDs for advanced parameters
                const advancedCodes = [
                    ENVIRONMENT_METRIC_IDS.KALI,
                    ENVIRONMENT_METRIC_IDS.TAN,
                    ENVIRONMENT_METRIC_IDS.MAGIE,
                    ENVIRONMENT_METRIC_IDS.NO3,
                ];
                const advancedIds = metricTypes
                    .filter(m => (advancedCodes as readonly string[]).includes(m.code))
                    .map(m => String(m.id));

                settings.forEach((setting: ParameterSetting) => {
                    let metric: EnvMetricType | undefined;

                    // Find metric by metricId (UUID) first
                    if (setting.metricId) {
                        metric = metricTypes.find(
                            (m: EnvMetricType) => String(m.id) === setting.metricId
                        );
                    }
                    // Fallback to parameterCode for backward compatibility
                    if (!metric && setting.parameterCode) {
                        metric = metricTypes.find(
                            (m: EnvMetricType) => m.code === setting.parameterCode
                        );
                    }

                    if (metric) {
                        const isEnabled =
                            setting.enabled !== undefined
                                ? setting.enabled
                                : setting.isActive !== undefined
                                ? setting.isActive
                                : true;

                        if (isEnabled !== false) {
                            const id = String(metric.id);
                            // Only add if it's in the advanced list (filtered by UUID)
                            if ((advancedIds as readonly string[]).includes(id)) {
                                // The UI component EnvironmentParametersBox expects IDs to match ENVIRONMENT_METRIC_IDS (codes)
                                // So we must use metric.code as the ID for the UI item, NOT the UUID
                                validAdvanced.push({ id: metric.code, name: metric.name });
                            }
                        }
                    } else {
                        // Metric not found
                    }
                });

                setAdvancedParameters(validAdvanced);
            }
        } else {
            const checkedParams = environmentSettings.advancedParameters
                .filter(p => p.isChecked)
                .map(p => ({ id: p.id, name: p.name }));
            setAdvancedParameters(checkedParams);
        }
    }, [
        itemToEdit,
        meta,
        environmentSettings.advancedParameters,
        currentZone,
        parameterSettings,
        metricTypes,
    ]);

    const hasAtLeastOneParameter = useMemo(() => {
        return (
            pH.trim().length > 0 ||
            dissolvedOxygen.trim().length > 0 ||
            temperature.trim().length > 0 ||
            salinity.trim().length > 0 ||
            alkalinity.trim().length > 0 ||
            transparency.trim().length > 0 ||
            kali.trim().length > 0 ||
            tan.trim().length > 0 ||
            magie.trim().length > 0 ||
            no3.trim().length > 0
        );
    }, [
        pH,
        dissolvedOxygen,
        temperature,
        salinity,
        alkalinity,
        transparency,
        kali,
        tan,
        magie,
        no3,
    ]);

    const initialData = useMemo(() => {
        if (!itemToEdit) return null;
        let date = itemToEdit.date ? parseDate(itemToEdit.date) : new Date();
        if (itemToEdit.date && itemToEdit.time) {
            const [hours, minutes] = itemToEdit.time.split(':').map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) date.setHours(hours, minutes);
        }
        return {
            date: date,
            pH: meta.pH || '',
            do: meta.do || '',
            temperature: meta.temperature || '',
            salinity: meta.salinity || '',
            alkalinity: meta.alkalinity || '',
            transparency: meta.transparency || '',
            notes: itemToEdit?.note || '',
            kali: meta.kali || '',
            tan: meta.tan || '',
            magie: meta.magie || '',
            no3: meta.no3 || '',
        };
    }, [itemToEdit, meta]);

    const hasChanges = useMemo(() => {
        if (!itemToEdit || !initialData) return true;
        const currentDateStr = selectedDate.toDateString();
        const initialDateStr = initialData.date.toDateString();
        if (currentDateStr !== initialDateStr) return true;
        if (pH !== initialData.pH) return true;
        if (dissolvedOxygen !== initialData.do) return true;
        if (temperature !== initialData.temperature) return true;
        if (salinity !== initialData.salinity) return true;
        if (alkalinity !== initialData.alkalinity) return true;
        if (transparency !== initialData.transparency) return true;
        if (notes !== initialData.notes) return true;
        if (kali !== initialData.kali) return true;
        if (tan !== initialData.tan) return true;
        if (magie !== initialData.magie) return true;
        if (no3 !== initialData.no3) return true;
        return false;
    }, [
        itemToEdit,
        initialData,
        selectedDate,
        pH,
        dissolvedOxygen,
        temperature,
        salinity,
        alkalinity,
        transparency,
        notes,
        kali,
        tan,
        magie,
        no3,
    ]);

    const handleSaveAdvancedParams = (data: {
        advancedParameters: Array<{ id: string; name: string }>;
    }) => {
        const newParamIds = new Set(data.advancedParameters.map(p => p.id));
        const oldParamIds = new Set(advancedParameters.map(p => p.id));
        const uncheckedIds = Array.from(oldParamIds).filter(id => !newParamIds.has(id));

        if (uncheckedIds.length > 0) {
            uncheckedIds.forEach(id => {
                if (id === ENVIRONMENT_METRIC_IDS.KALI) setKali('');
                if (id === ENVIRONMENT_METRIC_IDS.TAN) setTan('');
                if (id === ENVIRONMENT_METRIC_IDS.MAGIE) setMagie('');
                if (id === ENVIRONMENT_METRIC_IDS.NO3) setNo3('');
            });
        }
        setAdvancedParameters(data.advancedParameters);
    };

    const handleSave = () => {
        if (!hasAtLeastOneParameter) {
            setShowParameterError(true);
            Toast.show({
                type: 'error',
                text1: 'Vui lòng nhập ít nhất một chỉ số',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }
        setShowParameterError(false);

        if (pond?.id) {
            const currentItems = getPondJobItems(pond.id, 'ENVIRONMENT');
            const timeString = selectedDate.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
            });

            const itemData: Partial<JobExecution> = {
                label: itemToEdit?.label || `Lần ${currentItems.length + 1}`,
                time: timeString,
                date: formatDate(selectedDate),
                note: notes.trim() || undefined,
                meta: {
                    pH: pH.trim() || undefined,
                    pHWarning: checkLimit(pH, ENVIRONMENT_METRIC_IDS.PH),
                    do: dissolvedOxygen.trim() || undefined,
                    doWarning: checkLimit(dissolvedOxygen, ENVIRONMENT_METRIC_IDS.DO),
                    temperature: temperature.trim() || undefined,
                    temperatureWarning: checkLimit(temperature, ENVIRONMENT_METRIC_IDS.TEMPERATURE),
                    salinity: salinity.trim() || undefined,
                    salinityWarning: checkLimit(salinity, ENVIRONMENT_METRIC_IDS.SALINITY),
                    alkalinity: alkalinity.trim() || undefined,
                    alkalinityWarning: checkLimit(alkalinity, ENVIRONMENT_METRIC_IDS.ALKALINITY),
                    transparency: transparency.trim() || undefined,
                    transparencyWarning: checkLimit(
                        transparency,
                        ENVIRONMENT_METRIC_IDS.TRANSPARENCY
                    ),
                    kali: advancedParameters.some(p => p.id === ENVIRONMENT_METRIC_IDS.KALI)
                        ? kali.trim()
                        : undefined,
                    kaliWarning:
                        advancedParameters.some(p => p.id === ENVIRONMENT_METRIC_IDS.KALI) &&
                        kali.trim()
                            ? checkLimit(kali, ENVIRONMENT_METRIC_IDS.KALI)
                            : undefined,
                    tan: advancedParameters.some(p => p.id === ENVIRONMENT_METRIC_IDS.TAN)
                        ? tan.trim()
                        : undefined,
                    tanWarning:
                        advancedParameters.some(p => p.id === ENVIRONMENT_METRIC_IDS.TAN) &&
                        tan.trim()
                            ? checkLimit(tan, ENVIRONMENT_METRIC_IDS.TAN)
                            : undefined,
                    magie: advancedParameters.some(p => p.id === ENVIRONMENT_METRIC_IDS.MAGIE)
                        ? magie.trim()
                        : undefined,
                    magieWarning:
                        advancedParameters.some(p => p.id === ENVIRONMENT_METRIC_IDS.MAGIE) &&
                        magie.trim()
                            ? checkLimit(magie, ENVIRONMENT_METRIC_IDS.MAGIE)
                            : undefined,
                    no3: advancedParameters.some(p => p.id === ENVIRONMENT_METRIC_IDS.NO3)
                        ? no3.trim()
                        : undefined,
                    no3Warning:
                        advancedParameters.some(p => p.id === ENVIRONMENT_METRIC_IDS.NO3) &&
                        no3.trim()
                            ? checkLimit(no3, ENVIRONMENT_METRIC_IDS.NO3)
                            : undefined,
                },
            };

            if (itemToEdit) {
                const updatedItems = currentItems.map((item: JobExecution) =>
                    item.id === itemToEdit.id ? { ...item, ...itemData } : item
                );
                updatePondJob(pond.id, 'ENVIRONMENT', updatedItems);
                showEditJobSuccessToast('ENVIRONMENT');
            } else {
                let maxIndex = 0;
                currentItems.forEach((item: JobExecution) => {
                    const match = item.label.match(/Lần (\d+)/);
                    if (match) {
                        const index = parseInt(match[1], 10);
                        if (index > maxIndex) maxIndex = index;
                    }
                });
                const nextIndex = maxIndex + 1;
                const newItem: JobExecution = {
                    id: Date.now().toString(),
                    ...itemData,
                    label: `Lần ${nextIndex}`,
                    pondId: pond.id,
                } as JobExecution;
                updatePondJob(pond.id, 'ENVIRONMENT', [...currentItems, newItem]);
                showAddJobSuccessToast('ENVIRONMENT');
            }
        }
        navigation.goBack();
    };

    const handleDelete = () => {
        if (pond?.id && itemToEdit) {
            const currentItems = getPondJobItems(pond.id, 'ENVIRONMENT');
            const updatedItems = currentItems.filter(
                (item: JobExecution) => item.id !== itemToEdit!.id
            );
            updatePondJob(pond.id, 'ENVIRONMENT', updatedItems);
            setDeleteModalVisible(false);
            navigation.goBack();
        }
    };

    return {
        selectedDate,
        setSelectedDate,
        notes,
        setNotes,
        deleteModalVisible,
        setDeleteModalVisible,
        pH,
        setPH,
        dissolvedOxygen,
        setDissolvedOxygen,
        temperature,
        setTemperature,
        salinity,
        setSalinity,
        alkalinity,
        setAlkalinity,
        transparency,
        setTransparency,
        showParameterError,
        setShowParameterError,
        kali,
        setKali,
        tan,
        setTan,
        magie,
        setMagie,
        no3,
        setNo3,
        advancedParameters,
        hasChanges,
        isButtonDisabled: !hasAtLeastOneParameter || (!!itemToEdit && !hasChanges),
        handleSave,
        handleDelete,
        handleSaveAdvancedParams,
    };
};
