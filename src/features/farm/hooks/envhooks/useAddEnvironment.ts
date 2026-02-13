import { useState, useMemo, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useActiveCycle, useCyclesByPond } from '@/features/farm/hooks/useCycle';
import {
    ENVIRONMENT_METRIC_IDS,
    PondData,
    Zone,
    JobExecution,
} from '@/features/farm/types/farm.types';
import { EnvMetricType, ParameterSetting } from '@/features/farm/api/environmentApi';
import {
    useCreateEnvMeasurement,
    useUpdateEnvMeasurement,
    useDeleteEnvMeasurement,
    useEnvMeasurement,
} from '@/features/farm/hooks/useEnvMeasurement';
import { IEnvMeasurementDetail } from '@/features/farm/types/envMeasurement.types';

interface UseAddEnvironmentProps {
    pond: PondData;
    itemToEdit?: JobExecution;
    currentZone?: Zone | null;
    metricTypes: EnvMetricType[];
    parameterSettings: Record<string, ParameterSetting[]>;
    environmentSettings: {
        advancedParameters: Array<{ id: string; name: string; isChecked: boolean }>;
    };
}

export const useAddEnvironment = ({
    pond,
    itemToEdit,
    currentZone,
    metricTypes,
    parameterSettings,
}: UseAddEnvironmentProps) => {
    const navigation = useNavigation();

    // API Hooks
    const { data: apiData } = useEnvMeasurement(pond?.id || '', itemToEdit?.id || '');
    const detail = apiData?.data;

    const createEnvMeasurement = useCreateEnvMeasurement();
    const updateEnvMeasurement = useUpdateEnvMeasurement();
    const deleteEnvMeasurement = useDeleteEnvMeasurement();

    // Get active cycle for operationId (Store only - Safe)
    // Get active cycle for operationId
    const activeCycle = useActiveCycle(pond?.id || '');
    const { data: cycles } = useCyclesByPond(pond?.id || '');

    const currentCycle = useMemo(() => {
        if (!pond?.id) return null;
        // Priority 1: Active cycle
        if (activeCycle) return activeCycle;

        // Priority 2: History (find open or first)
        const pondCycles = cycles || [];
        const found = pondCycles.find(c => c.status !== 'Hoàn thành') || pondCycles[0];

        return found;
    }, [pond?.id, activeCycle, cycles]);

    // Helper: Get metric value from measurements array
    const getMetricValue = (metricCode: string): string => {
        if (!detail?.envMeasurementDetails) return '';
        const metric = metricTypes.find(m => m.code === metricCode);
        if (!metric) return '';
        const measurement = detail.envMeasurementDetails.find(m => m.metricId === metric.id);
        return measurement ? measurement.value.toString() : '';
    };

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [notes, setNotes] = useState('');
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    // Parameters State
    const [pH, setPH] = useState('');
    const [dissolvedOxygen, setDissolvedOxygen] = useState('');
    const [temperature, setTemperature] = useState('');
    const [salinity, setSalinity] = useState('');
    const [alkalinity, setAlkalinity] = useState('');
    const [transparency, setTransparency] = useState('');
    const [showParameterError, setShowParameterError] = useState(false);

    // Advanced Parameters State
    const [kali, setKali] = useState('');
    const [tan, setTan] = useState('');
    const [magie, setMagie] = useState('');
    const [no3, setNo3] = useState('');

    // Populate state from API data when editing
    useEffect(() => {
        if (detail) {
            if (detail.createdAt) {
                setSelectedDate(new Date(detail.createdAt));
            }

            // Extract values from measurements array
            setPH(getMetricValue(ENVIRONMENT_METRIC_IDS.PH));
            setDissolvedOxygen(getMetricValue(ENVIRONMENT_METRIC_IDS.DO));
            setTemperature(getMetricValue(ENVIRONMENT_METRIC_IDS.TEMPERATURE));
            setSalinity(getMetricValue(ENVIRONMENT_METRIC_IDS.SALINITY));
            setAlkalinity(getMetricValue(ENVIRONMENT_METRIC_IDS.ALKALINITY));
            setTransparency(getMetricValue(ENVIRONMENT_METRIC_IDS.TRANSPARENCY));
            setKali(getMetricValue(ENVIRONMENT_METRIC_IDS.KALI));
            setTan(getMetricValue(ENVIRONMENT_METRIC_IDS.TAN));
            setMagie(getMetricValue(ENVIRONMENT_METRIC_IDS.MAGIE));
            setNo3(getMetricValue(ENVIRONMENT_METRIC_IDS.NO3));
        } else if (itemToEdit && itemToEdit.meta) {
            const meta = itemToEdit.meta as any;

            // Helper for case-insensitive access
            const getVal = (...keys: string[]) => {
                for (const k of keys) {
                    if (meta[k] != null && meta[k] !== '') return meta[k].toString();
                }
                return '';
            };

            if (meta.date) setSelectedDate(new Date(meta.date));
            if (meta.createdAt) setSelectedDate(new Date(meta.createdAt)); // Fallback

            setPH(getVal('pH', 'PH', 'Ph'));
            setDissolvedOxygen(getVal('dissolvedOxygen', 'DissolvedOxygen', 'DO', 'Do', 'do'));
            setTemperature(getVal('temperature', 'Temperature', 'Temp'));
            setSalinity(getVal('salinity', 'Salinity'));
            setAlkalinity(getVal('alkalinity', 'Alkalinity'));
            setTransparency(getVal('transparency', 'Transparency'));
            setKali(getVal('kali', 'Kali', 'K'));
            setTan(getVal('tan', 'Tan', 'TAN'));
            setMagie(getVal('magie', 'Magie', 'Mg'));
            setNo3(getVal('no3', 'NO3', 'No3'));

            // Notes
            const noteVal = getVal('notes', 'Notes', 'Note', 'note');
            if (noteVal) setNotes(noteVal);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [detail, metricTypes]);

    // Advanced Params Initialization
    // Always use parameterSettings to determine which advanced parameters to show
    // This ensures consistency between Add and Edit modes
    const initialAdvancedParams = useMemo(() => {
        const zoneId = currentZone?.id ? String(currentZone.id) : '';
        const settings = parameterSettings[zoneId];

        if (settings && Array.isArray(settings) && metricTypes.length > 0) {
            const validAdvanced: Array<{ id: string; name: string }> = [];

            // Order matching user's expected display (based on Create screen)
            const advancedCodesSequence = [
                ENVIRONMENT_METRIC_IDS.NO3,
                ENVIRONMENT_METRIC_IDS.MAGIE,
                ENVIRONMENT_METRIC_IDS.KALI,
                ENVIRONMENT_METRIC_IDS.TAN,
            ];

            advancedCodesSequence.forEach(code => {
                const metric = metricTypes.find(m => m.code === code);
                if (!metric) return;

                // Find setting for this metric
                const setting = settings.find(
                    s => String(s.metricId) === String(metric.id) || s.parameterCode === code
                );

                if (setting) {
                    const isEnabled =
                        setting.enabled !== undefined
                            ? setting.enabled
                            : setting.isActive !== undefined
                            ? setting.isActive
                            : false;

                    if (isEnabled) {
                        validAdvanced.push({ id: metric.code, name: metric.name });
                    }
                }
            });

            return validAdvanced;
        }

        return [];
    }, [currentZone, parameterSettings, metricTypes]);

    const [advancedParameters, setAdvancedParameters] =
        useState<Array<{ id: string; name: string }>>(initialAdvancedParams);

    // Effect to update advanced params when settings or metric types change
    useEffect(() => {
        // Always sync if we have valid ones, even if they changed from 3 to 2 etc.
        // We only don't sync if initialAdvancedParams is empty but we're in EDIT mode
        // and might have existing data? No, visibility should strictly follow settings.
        if (
            initialAdvancedParams.length > 0 ||
            (currentZone && parameterSettings[String(currentZone.id)])
        ) {
            setAdvancedParameters(initialAdvancedParams);
        }
    }, [initialAdvancedParams, currentZone, parameterSettings]);

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
        if (!itemToEdit || !detail) return null;
        return {
            pH: getMetricValue(ENVIRONMENT_METRIC_IDS.PH),
            do: getMetricValue(ENVIRONMENT_METRIC_IDS.DO),
            temperature: getMetricValue(ENVIRONMENT_METRIC_IDS.TEMPERATURE),
            salinity: getMetricValue(ENVIRONMENT_METRIC_IDS.SALINITY),
            alkalinity: getMetricValue(ENVIRONMENT_METRIC_IDS.ALKALINITY),
            transparency: getMetricValue(ENVIRONMENT_METRIC_IDS.TRANSPARENCY),
            kali: getMetricValue(ENVIRONMENT_METRIC_IDS.KALI),
            tan: getMetricValue(ENVIRONMENT_METRIC_IDS.TAN),
            magie: getMetricValue(ENVIRONMENT_METRIC_IDS.MAGIE),
            no3: getMetricValue(ENVIRONMENT_METRIC_IDS.NO3),
            date: detail.createdAt ? new Date(detail.createdAt).getTime() : 0,
            notes: '', // Notes not currently supported by API detail response
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemToEdit, detail, metricTypes]);

    const hasChanges = useMemo(() => {
        if (!itemToEdit || !initialData) return true;

        // Check Date Change
        if (selectedDate.getTime() !== initialData.date) return true;

        // Check Notes Change
        if (notes !== initialData.notes) return true;

        if (pH !== initialData.pH) return true;
        if (dissolvedOxygen !== initialData.do) return true;
        if (temperature !== initialData.temperature) return true;
        if (salinity !== initialData.salinity) return true;
        if (alkalinity !== initialData.alkalinity) return true;
        if (transparency !== initialData.transparency) return true;
        if (kali !== initialData.kali) return true;
        if (tan !== initialData.tan) return true;
        if (magie !== initialData.magie) return true;
        if (no3 !== initialData.no3) return true;
        return false;
    }, [
        itemToEdit,
        initialData,
        selectedDate,
        notes,
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

    // Helper: Build measurements array from state
    const buildMeasurements = (): IEnvMeasurementDetail[] => {
        const measurements: IEnvMeasurementDetail[] = [];

        const addMeasurement = (code: string, value: string) => {
            if (!value.trim()) return;
            const metric = metricTypes.find(m => m.code === code);

            if (metric) {
                // Reverted to Metric ID (Type ID) as Setting ID caused 404
                measurements.push({
                    metricId: metric.id,
                    value: parseFloat(value),
                });
            }
        };

        addMeasurement(ENVIRONMENT_METRIC_IDS.PH, pH);
        addMeasurement(ENVIRONMENT_METRIC_IDS.DO, dissolvedOxygen);
        addMeasurement(ENVIRONMENT_METRIC_IDS.TEMPERATURE, temperature);
        addMeasurement(ENVIRONMENT_METRIC_IDS.SALINITY, salinity);
        addMeasurement(ENVIRONMENT_METRIC_IDS.ALKALINITY, alkalinity);
        addMeasurement(ENVIRONMENT_METRIC_IDS.TRANSPARENCY, transparency);

        // Advanced parameters
        if (advancedParameters.some(p => p.id === ENVIRONMENT_METRIC_IDS.KALI)) {
            addMeasurement(ENVIRONMENT_METRIC_IDS.KALI, kali);
        }
        if (advancedParameters.some(p => p.id === ENVIRONMENT_METRIC_IDS.TAN)) {
            addMeasurement(ENVIRONMENT_METRIC_IDS.TAN, tan);
        }
        if (advancedParameters.some(p => p.id === ENVIRONMENT_METRIC_IDS.MAGIE)) {
            addMeasurement(ENVIRONMENT_METRIC_IDS.MAGIE, magie);
        }
        if (advancedParameters.some(p => p.id === ENVIRONMENT_METRIC_IDS.NO3)) {
            addMeasurement(ENVIRONMENT_METRIC_IDS.NO3, no3);
        }

        return measurements;
    };

    const handleSave = (documentIds: string[], onSaveSuccess?: () => void) => {
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

        if (!pond?.id) {
            Toast.show({ type: 'error', text1: 'Không tìm thấy thông tin ao' });
            return;
        }

        const measurements = buildMeasurements();
        const commonData = {
            operationId: currentCycle?.id,
            envMeasurementDetails: measurements,
            documentIds,
            createdAt: selectedDate ? selectedDate.toISOString() : new Date().toISOString(),
            recordValue: 1,
        };

        if (itemToEdit) {
            updateEnvMeasurement.mutate(
                {
                    pondId: pond.id,
                    id: itemToEdit.id,
                    data: commonData,
                },
                {
                    onSuccess: () => {
                        onSaveSuccess?.();
                        Toast.show({ type: 'success', text1: 'Đã cập nhật thành công' });
                        navigation.goBack();
                    },
                    onError: (error: any) => {
                        Toast.show({ type: 'error', text1: error?.message || 'Có lỗi xảy ra' });
                    },
                }
            );
        } else {
            createEnvMeasurement.mutate(
                {
                    pondId: pond.id,
                    data: commonData,
                },
                {
                    onSuccess: () => {
                        onSaveSuccess?.();
                        Toast.show({
                            type: 'success',
                            text1: 'Đã đo thông số môi trường thành công',
                        });
                        navigation.goBack();
                    },
                    onError: (error: any) => {
                        Toast.show({ type: 'error', text1: error?.message || 'Có lỗi xảy ra' });
                    },
                }
            );
        }
    };

    const handleDelete = () => {
        if (!pond?.id || !itemToEdit?.id) return;

        deleteEnvMeasurement.mutate(
            { pondId: pond.id, id: itemToEdit.id },
            {
                onSuccess: () => {
                    setDeleteModalVisible(false);
                    Toast.show({ type: 'success', text1: 'Tác vụ đã được xóa' });
                    navigation.goBack();
                },
                onError: (error: any) => {
                    Toast.show({ type: 'error', text1: error?.message || 'Có lỗi xảy ra' });
                },
            }
        );
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
        isSubmitting:
            createEnvMeasurement.isPending ||
            updateEnvMeasurement.isPending ||
            deleteEnvMeasurement.isPending,
        detail, // Export detail for accessing documentIds
    };
};
