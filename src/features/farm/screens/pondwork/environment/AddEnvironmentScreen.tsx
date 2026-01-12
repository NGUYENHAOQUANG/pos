import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { EnvironmentParametersBox } from '@/features/farm/components/pondwork/environment/EnvironmentParametersBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { useFarm } from '@/features/farm/store/farmStore';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { IconTrashOutlined } from '@/assets/icons';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import { EnvironmentMeta } from '@/features/farm/types/farm.types';
import { formatDate, parseDate } from '@/features/farm/utils/dateUtils';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'AddEnvironmentScreen'>;

export const AddEnvironmentScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond, itemToEdit } = route.params || {};
    const insets = useSafeAreaInsets();
    const { setTabBarVisible } = useTabBarVisibility();
    const { getPondJobItems, updatePondJob, environmentSettings } = useFarm();

    const checkLimit = (value: string, paramId: string): boolean => {
        if (!value || !value.trim()) return false;

        // Find parameter in default settings
        let param = environmentSettings.defaultParameters.find(p => p.id === paramId);

        // If not found in default, look in advanced settings
        if (!param) {
            param = environmentSettings.advancedParameters.find(p => p.id === paramId);
        }

        if (!param || !param.limit) return false;

        const parts = param.limit.split('-');
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

    // Environment parameters state
    const [pH, setPH] = useState(meta.pH || '');
    const [dissolvedOxygen, setDissolvedOxygen] = useState(meta.do || '');
    const [temperature, setTemperature] = useState(meta.temperature || '');
    const [salinity, setSalinity] = useState(meta.salinity || '');
    const [alkalinity, setAlkalinity] = useState(meta.alkalinity || '');
    const [transparency, setTransparency] = useState(meta.transparency || '');
    const [notes, setNotes] = useState(itemToEdit?.note || '');
    const [showParameterError, setShowParameterError] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    // Advanced parameters state
    // Initialize from environmentSettings if creating new, or from meta if editing
    const initialAdvancedParams = useMemo(() => {
        if (itemToEdit && meta) {
            // When editing: get from meta
            const advancedParams: Array<{ id: string; name: string }> = [];
            if (meta.kali !== undefined) {
                advancedParams.push({ id: '7', name: 'Kali (mg/L)' });
            }
            if (meta.tan !== undefined) {
                advancedParams.push({ id: '8', name: 'TAN (mg/L)' });
            }
            if (meta.magie !== undefined) {
                advancedParams.push({ id: '9', name: 'Magie (mg/L)' });
            }
            if (meta.no3 !== undefined) {
                advancedParams.push({ id: '10', name: 'NO3 (mg/L)' });
            }
            return advancedParams;
        } else {
            // When creating new: get from environmentSettings (checked ones)
            return environmentSettings.advancedParameters
                .filter(p => p.isChecked)
                .map(p => ({ id: p.id, name: p.name }));
        }
    }, [itemToEdit, meta, environmentSettings.advancedParameters]);

    const [advancedParameters, setAdvancedParameters] =
        useState<Array<{ id: string; name: string }>>(initialAdvancedParams);
    const [kali, setKali] = useState(meta.kali || '');
    const [tan, setTan] = useState(meta.tan || '');
    const [magie, setMagie] = useState(meta.magie || '');
    const [no3, setNo3] = useState(meta.no3 || '');

    // Store initial data for comparison when editing
    const initialData = useMemo(() => {
        if (!itemToEdit) return null;

        let date = itemToEdit.date ? parseDate(itemToEdit.date) : new Date();
        if (itemToEdit.date && itemToEdit.time) {
            const [hours, minutes] = itemToEdit.time.split(':').map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
                date.setHours(hours, minutes);
            }
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

    // Hide tab bar when this screen is mounted
    useEffect(() => {
        setTabBarVisible(false);
    }, [setTabBarVisible]);

    // Update advanced parameters when environmentSettings changes (for create mode)
    // or when meta changes (for edit mode)
    useEffect(() => {
        if (itemToEdit && meta) {
            // When editing: get from meta
            const advancedParams: Array<{ id: string; name: string }> = [];
            if (meta.kali !== undefined) {
                advancedParams.push({ id: '7', name: 'Kali (mg/L)' });
            }
            if (meta.tan !== undefined) {
                advancedParams.push({ id: '8', name: 'TAN (mg/L)' });
            }
            if (meta.magie !== undefined) {
                advancedParams.push({ id: '9', name: 'Magie (mg/L)' });
            }
            if (meta.no3 !== undefined) {
                advancedParams.push({ id: '10', name: 'NO3 (mg/L)' });
            }
            setAdvancedParameters(advancedParams);
        } else {
            // When creating new: get from environmentSettings (checked ones)
            const checkedParams = environmentSettings.advancedParameters
                .filter(p => p.isChecked)
                .map(p => ({ id: p.id, name: p.name }));
            setAdvancedParameters(checkedParams);
        }
    }, [itemToEdit, meta, environmentSettings.advancedParameters]); // eslint-disable-next-line react-hooks/exhaustive-deps

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleSaveAdvancedParams = (data: {
        advancedParameters: Array<{ id: string; name: string }>;
    }) => {
        const newParamIds = new Set(data.advancedParameters.map(p => p.id));
        const oldParamIds = new Set(advancedParameters.map(p => p.id));

        // Find parameters that were unchecked
        const uncheckedIds = Array.from(oldParamIds).filter(id => !newParamIds.has(id));

        // Clear values for unchecked parameters
        // In create mode: clear to prevent saving
        // In edit mode: clear to allow updating (removing the field is an update)
        if (uncheckedIds.length > 0) {
            uncheckedIds.forEach(id => {
                if (id === '7') setKali('');
                if (id === '8') setTan('');
                if (id === '9') setMagie('');
                if (id === '10') setNo3('');
            });
        }

        setAdvancedParameters(data.advancedParameters);
    };

    const handleSave = () => {
        // Validate: at least one parameter must be filled
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

            const itemData = {
                label: itemToEdit?.label || `Lần ${currentItems.length + 1}`,
                time: timeString,
                date: formatDate(selectedDate),
                note: notes.trim() || undefined,
                meta: {
                    pH: pH.trim() || undefined,
                    pHWarning: checkLimit(pH, '1'),
                    do: dissolvedOxygen.trim() || undefined,
                    doWarning: checkLimit(dissolvedOxygen, '2'),
                    temperature: temperature.trim() || undefined,
                    temperatureWarning: checkLimit(temperature, '3'),
                    salinity: salinity.trim() || undefined,
                    salinityWarning: checkLimit(salinity, '5'),
                    alkalinity: alkalinity.trim() || undefined,
                    alkalinityWarning: checkLimit(alkalinity, '6'),
                    transparency: transparency.trim() || undefined,
                    transparencyWarning: checkLimit(transparency, '4'),
                    // Only save advanced parameters if they are checked
                    kali: advancedParameters.some(p => p.id === '7') ? kali.trim() : undefined,
                    kaliWarning:
                        advancedParameters.some(p => p.id === '7') && kali.trim()
                            ? checkLimit(kali, '7')
                            : undefined,
                    tan: advancedParameters.some(p => p.id === '8') ? tan.trim() : undefined,
                    tanWarning:
                        advancedParameters.some(p => p.id === '8') && tan.trim()
                            ? checkLimit(tan, '8')
                            : undefined,
                    magie: advancedParameters.some(p => p.id === '9') ? magie.trim() : undefined,
                    magieWarning:
                        advancedParameters.some(p => p.id === '9') && magie.trim()
                            ? checkLimit(magie, '9')
                            : undefined,
                    no3: advancedParameters.some(p => p.id === '10') ? no3.trim() : undefined,
                    no3Warning:
                        advancedParameters.some(p => p.id === '10') && no3.trim()
                            ? checkLimit(no3, '10')
                            : undefined,
                },
            };

            if (itemToEdit) {
                // Update existing item
                const updatedItems = currentItems.map(item =>
                    item.id === itemToEdit.id ? { ...item, ...itemData } : item
                );
                updatePondJob(pond.id, 'ENVIRONMENT', updatedItems);
                showEditJobSuccessToast('ENVIRONMENT');
            } else {
                // Create new item
                // Calculate next index based on max existing label
                let maxIndex = 0;
                currentItems.forEach(item => {
                    const match = item.label.match(/Lần (\d+)/);
                    if (match) {
                        const index = parseInt(match[1], 10);
                        if (index > maxIndex) maxIndex = index;
                    }
                });
                const nextIndex = maxIndex + 1;

                const newItem = {
                    id: Date.now().toString(),
                    ...itemData,
                    label: `Lần ${nextIndex}`,
                    pondId: pond.id,
                };
                updatePondJob(pond.id, 'ENVIRONMENT', [...currentItems, newItem]);
                showAddJobSuccessToast('ENVIRONMENT');
            }
        }

        navigation.goBack();
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    const handleDeletePress = () => {
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        if (pond?.id && itemToEdit) {
            const currentItems = getPondJobItems(pond.id, 'ENVIRONMENT');
            const updatedItems = currentItems.filter(item => item.id !== itemToEdit.id);
            updatePondJob(pond.id, 'ENVIRONMENT', updatedItems);
            setDeleteModalVisible(false);
            navigation.goBack();
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
    };

    // Check if at least one parameter is filled (for validation)
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

    // Check if data has changed from initial (when editing)
    const hasChanges = useMemo(() => {
        if (!itemToEdit || !initialData) return true; // New item always has "changes"

        // Compare dates (only date part, not time)
        const currentDateStr = selectedDate.toDateString();
        const initialDateStr = initialData.date.toDateString();
        if (currentDateStr !== initialDateStr) return true;

        // Compare other fields
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

    const isFormComplete = hasAtLeastOneParameter;
    const isButtonDisabled = !isFormComplete || (itemToEdit && !hasChanges);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đo thông số môi trường</Text>
                {itemToEdit ? (
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
                        <IconTrashOutlined width={18} height={18} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.headerSpacer} />
                )}
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <GeneralInfoBox
                    type="default"
                    date={selectedDate}
                    onDateChange={setSelectedDate}
                    disabledDate={true}
                />

                <EnvironmentParametersBox
                    pH={pH}
                    onPHChange={value => {
                        setPH(value);
                        setShowParameterError(false);
                    }}
                    do={dissolvedOxygen}
                    onDOChange={value => {
                        setDissolvedOxygen(value);
                        setShowParameterError(false);
                    }}
                    temperature={temperature}
                    onTemperatureChange={value => {
                        setTemperature(value);
                        setShowParameterError(false);
                    }}
                    salinity={salinity}
                    onSalinityChange={value => {
                        setSalinity(value);
                        setShowParameterError(false);
                    }}
                    alkalinity={alkalinity}
                    onAlkalinityChange={value => {
                        setAlkalinity(value);
                        setShowParameterError(false);
                    }}
                    transparency={transparency}
                    onTransparencyChange={value => {
                        setTransparency(value);
                        setShowParameterError(false);
                    }}
                    onSetupPress={() => {
                        navigation.navigate('SettingEnvironment', {
                            data: { advancedParameters },
                            onSave: handleSaveAdvancedParams,
                        });
                    }}
                    advancedParameters={advancedParameters}
                    kali={kali}
                    onKaliChange={setKali}
                    tan={tan}
                    onTanChange={setTan}
                    magie={magie}
                    onMagieChange={setMagie}
                    no3={no3}
                    onNo3Change={setNo3}
                    showError={showParameterError}
                />

                <SelectionNotesBox notes={notes} onNotesChange={setNotes} />
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <ButtonBarFarm
                    primaryTitle={itemToEdit ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                    secondaryTitle="Huỷ"
                    onPrimaryPress={handleSave}
                    onSecondaryPress={handleCancel}
                    primaryDisabled={itemToEdit ? isButtonDisabled : false}
                />
            </View>

            {/* Delete Confirmation Modal */}
            <ConfirmationDeleteModal
                visible={deleteModalVisible}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
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
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.error,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 0,
    },
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
