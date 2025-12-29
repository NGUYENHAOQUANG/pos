import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { EnvironmentParametersBox } from '@/features/farm/components/pondwork/environment/EnvironmentParametersBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { useFarm } from '@/features/farm/context/FarmContext';
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
    const { getPondJobItems, updatePondJob } = useFarm();

    const meta = useMemo(
        () => (itemToEdit?.meta as EnvironmentMeta) || ({} as EnvironmentMeta),
        [itemToEdit?.meta]
    );
    const [selectedDate, setSelectedDate] = useState(
        itemToEdit?.date ? parseDate(itemToEdit.date) : new Date()
    );

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

    // Store initial data for comparison when editing
    const initialData = useMemo(() => {
        if (!itemToEdit) return null;
        return {
            date: itemToEdit.date ? parseDate(itemToEdit.date) : new Date(),
            pH: meta.pH || '',
            do: meta.do || '',
            temperature: meta.temperature || '',
            salinity: meta.salinity || '',
            alkalinity: meta.alkalinity || '',
            transparency: meta.transparency || '',
            notes: itemToEdit?.note || '',
        };
    }, [itemToEdit, meta]);

    // Hide tab bar when this screen is mounted
    useEffect(() => {
        setTabBarVisible(false);
    }, [setTabBarVisible]);

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleSave = () => {
        // Validate: at least one parameter must be filled
        if (!hasAtLeastOneParameter) {
            setShowParameterError(true);
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
                    pHWarning: true,
                    do: dissolvedOxygen.trim() || undefined,
                    temperature: temperature.trim() || undefined,
                    salinity: salinity.trim() || undefined,
                    alkalinity: alkalinity.trim() || undefined,
                    transparency: transparency.trim() || undefined,
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
            transparency.trim().length > 0
        );
    }, [pH, dissolvedOxygen, temperature, salinity, alkalinity, transparency]);

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
                <Text style={styles.headerTitle}>Đo chỉ số môi trường</Text>
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
                        navigation.navigate('SettingEnvironment');
                    }}
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
