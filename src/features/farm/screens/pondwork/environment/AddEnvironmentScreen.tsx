import React, { useEffect, useRef, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
import { useFarmStore } from '@/features/farm/store/farmStore';
import { EnvSkeleton } from '@/features/farm/components/skeleton/EnvSkeleton';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'AddEnvironmentScreen'>;

import {
    useEnvironmentInit,
    useZoneResolution,
    useParameterConfiguration,
} from '@/features/farm/hooks/pondwork/envhooks/useEnvironmentLogic';
import { useAddEnvironment } from '@/features/farm/hooks/pondwork/envhooks/useAddEnvironment';
import { documentApi } from '@/features/material/api/documentApi';

// ... (keep imports)

export const AddEnvironmentScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond, itemToEdit } = route.params || {};
    const insets = useSafeAreaInsets();
    const { setTabBarVisible } = useTabBarVisibility();

    // Decomposed useFarm() selectors
    const environmentSettings = useFarmStore(state => state.environmentSettings);
    const parameterSettings = useFarmStore(state => state.parameterSettings);
    const generalInfoBoxRef = useRef<any>(null);

    // State for images when editing
    const [imageUris, setImageUris] = useState<string[]>([]);
    const [initialImageUris, setInitialImageUris] = useState<string[]>([]);
    const [documentIds, setDocumentIds] = useState<string[]>([]);

    // 1. Resolve Zone
    const zones = useFarmStore(state => state.zones); // Needed for resolution
    const currentZone = useZoneResolution(pond, zones);

    // 2. Initialize Data (Fetch types, zones, settings)
    const { isLoading, metricTypes } = useEnvironmentInit(
        currentZone ? String(currentZone.id) : undefined
    );

    // 3. Compute Configuration (Limits, Visible IDs)
    const { parameterLimits } = useParameterConfiguration(
        currentZone ? String(currentZone.id) : undefined,
        metricTypes,
        parameterSettings
    );

    // Convert parameterLimits from UUID keys to code keys
    const limitsWithCodes = useMemo(() => {
        const limits: Record<string, string> = {};
        Object.entries(parameterLimits).forEach(([uuid, limitStr]) => {
            const metric = metricTypes.find(m => String(m.id) === uuid);
            if (metric) {
                limits[metric.code] = limitStr;
            }
        });

        return limits;
    }, [parameterLimits, metricTypes]);

    // 4. Use Add Environment Logic Hook
    const {
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
        isButtonDisabled,
        handleSave,
        handleDelete,
        handleSaveAdvancedParams,
        isSubmitting,
        detail, // Get detail for accessing documentIds
    } = useAddEnvironment({
        pond,
        itemToEdit,
        currentZone,
        metricTypes,
        parameterSettings,
        environmentSettings,
    });

    // Fetch image URLs from documentIds when editing
    useEffect(() => {
        const fetchImageUrls = async () => {
            if (itemToEdit && detail?.documentIds && detail.documentIds.length > 0) {
                try {
                    const urls = await documentApi.getUrls(detail.documentIds);
                    setImageUris(urls);
                    setInitialImageUris(urls);
                    setDocumentIds(detail.documentIds);
                } catch (error) {
                    console.error('[AddEnvironmentScreen] Failed to fetch image URLs:', error);
                }
            }
        };
        fetchImageUrls();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemToEdit, detail]);

    const hasImagesChanged = useMemo(() => {
        if (!itemToEdit) return false;
        if (imageUris.length !== initialImageUris.length) return true;
        for (let i = 0; i < imageUris.length; i++) {
            if (imageUris[i] !== initialImageUris[i]) return true;
        }
        return false;
    }, [imageUris, initialImageUris, itemToEdit]);

    // Hide tab bar when this screen is mounted
    useEffect(() => {
        setTabBarVisible(false);
    }, [setTabBarVisible]);

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    const handleDeletePress = () => {
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        handleDelete();
    };

    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
    };

    const handleSavePress = () => {
        const documentIds = generalInfoBoxRef.current?.getUploadedIds?.() || [];
        const markAsSaved = () => generalInfoBoxRef.current?.markAsSaved?.();
        handleSave(documentIds, markAsSaved);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đo thông số môi trường</Text>
                {itemToEdit ? (
                    <DeleteButton onPress={handleDeletePress} />
                ) : (
                    <View style={styles.headerSpacer} />
                )}
            </View>

            {/* Content */}
            {isLoading ? (
                <EnvSkeleton />
            ) : (
                <>
                    <SafeInputLayout
                        contentContainerStyle={styles.scrollContent}
                        extraScrollHeight={100}
                    >
                        <GeneralInfoBox
                            ref={generalInfoBoxRef}
                            type="withImage"
                            date={selectedDate}
                            onDateChange={setSelectedDate}
                            disabledDate={true}
                            imageUris={itemToEdit ? imageUris : undefined}
                            onImagesChange={setImageUris}
                            documentIds={itemToEdit ? documentIds : undefined}
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
                            limits={limitsWithCodes}
                        />

                        <SelectionNotesBox notes={notes} onNotesChange={setNotes} />
                    </SafeInputLayout>

                    {/* Footer Buttons */}
                    <View style={styles.footer}>
                        <ButtonBarFarm
                            primaryTitle={itemToEdit ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                            secondaryTitle="Huỷ"
                            onPrimaryPress={handleSavePress}
                            onSecondaryPress={handleCancel}
                            primaryDisabled={
                                itemToEdit
                                    ? isButtonDisabled && !hasImagesChanged
                                    : false || isSubmitting
                            }
                        />
                    </View>
                </>
            )}

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
    scrollContent: {
        padding: 0,
        paddingBottom: 100,
    },
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
