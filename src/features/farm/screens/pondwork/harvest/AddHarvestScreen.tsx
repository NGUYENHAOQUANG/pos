import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';

import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { HarvestDataBox } from '@/features/farm/components/pondwork/harvest/HarvestDataBox';
import { ConfirmationModal } from '@/shared/components/modal/ConfirmationModal';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { HarvestMeta } from '@/features/farm/types/farm.types';
import {
    getHarvestSuccessMessage,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import Toast from 'react-native-toast-message';
import { parseDate } from '@/features/farm/utils/dateUtils';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import {
    HarvestFormData,
    getHarvestTypeDisplay,
    getHarvestTypeFromDisplay,
    mapFormToApiRequest,
} from '@/features/farm/schemas/harvestFormSchema';
import {
    useCreateHarvestRecord,
    useUpdateHarvestRecord,
    useDeleteHarvestRecord,
} from '@/features/farm/hooks/useHarvestRecord';
import { HarvestType } from '@/features/farm/types/harvestRecord.types';
import { JobType } from '@/features/farm/components/pondwork/JobItem';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'AddHarvestScreen'>;

export const AddHarvestScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond, itemToEdit } = route.params || {};
    const insets = useSafeAreaInsets();
    const { setTabBarVisible } = useTabBarVisibility();

    const createHarvestMutation = useCreateHarvestRecord();
    const updateHarvestMutation = useUpdateHarvestRecord();
    const deleteHarvestMutation = useDeleteHarvestRecord();

    const meta = useMemo(() => (itemToEdit?.meta as HarvestMeta) || {}, [itemToEdit?.meta]);

    const getInitialDate = () => {
        if (!itemToEdit?.date) return new Date();
        const date = parseDate(itemToEdit.date);
        if (itemToEdit.time) {
            const [hours, minutes] = itemToEdit.time.split(':').map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
                date.setHours(hours, minutes);
            }
        }
        return date;
    };

    const getInitialHarvestType = (): HarvestType => {
        const typeMap: Record<string, HarvestType> = {
            'Thu hết': 'FullHarvest',
            'Thu tỉa': 'PartialHarvest',
        };
        return typeMap[meta.harvestType || 'Thu hết'] || 'PartialHarvest';
    };

    const { handleSubmit, watch, setValue } = useForm<HarvestFormData>({
        defaultValues: {
            harvestType: getInitialHarvestType(),
            totalWeightKg: meta.yieldAmount || '',
            shrimpSize: meta.shrimpSize || '',
            referencePrice: meta.referencePrice || '',
            notes: itemToEdit?.note || '',
        },
    });

    const watchedHarvestType = watch('harvestType');
    const harvestType = getHarvestTypeDisplay(watchedHarvestType);
    const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate());
    const harvestTypeOptions = ['Thu hết', 'Thu tỉa'];

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

    const handleConfirmDelete = async () => {
        if (!pond?.id || !itemToEdit?.id) return;

        await deleteHarvestMutation.mutateAsync({
            pondId: pond.id,
            id: itemToEdit.id,
        });

        Toast.show({
            type: 'success',
            text1: 'Đã xóa thông tin thu hoạch',
            position: 'top',
            visibilityTime: 3000,
        });

        setDeleteModalVisible(false);
        navigation.goBack();
    };

    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
    };

    const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
    const [confirmationModalType, setConfirmationModalType] = useState<
        | 'harvest_full'
        // 'harvest_close_cycle' |
        | null
    >(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const handleSavePress = () => {
        if (harvestType === 'Thu hết' && !itemToEdit) {
            setConfirmationModalType('harvest_full');
            setIsConfirmationModalVisible(true);
            // } else if (harvestType === 'Đóng chu kỳ' && !itemToEdit) {
            //     setConfirmationModalType('harvest_close_cycle');
            //     setIsConfirmationModalVisible(true);
        } else {
            handleSubmit(onSubmit)();
        }
    };

    const handleConfirmSave = () => {
        setIsConfirmationModalVisible(false);
        setConfirmationModalType(null);

        handleSubmit(onSubmit)();
    };

    const handleCancelConfirmation = () => {
        setIsConfirmationModalVisible(false);
        setConfirmationModalType(null);
    };

    const onSubmit = async (data: HarvestFormData) => {
        const apiRequest = mapFormToApiRequest(data);

        if (itemToEdit?.id) {
            await updateHarvestMutation.mutateAsync({
                pondId: pond.id,
                id: itemToEdit.id,
                data: apiRequest,
            });

            showEditJobSuccessToast('HARVEST' as JobType);
        } else {
            await createHarvestMutation.mutateAsync({
                pondId: pond.id,
                data: apiRequest,
            });

            Toast.show({
                type: 'success',
                text1: getHarvestSuccessMessage(getHarvestTypeDisplay(data.harvestType)),
                position: 'top',
                visibilityTime: 5000,
            });
        }

        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thu hoạch</Text>
                {itemToEdit ? (
                    <DeleteButton onPress={handleDeletePress} />
                ) : (
                    <View style={styles.headerSpacer} />
                )}
            </View>

            {/* Content */}
            <SafeInputLayout contentContainerStyle={styles.scrollContent} extraScrollHeight={150}>
                <GeneralInfoBox
                    type="harvest"
                    date={selectedDate}
                    onDateChange={setSelectedDate}
                    activityLabel="Chọn loại thu hoạch"
                    activityOptions={harvestTypeOptions}
                    selectedActivity={harvestType}
                    onSelectActivity={value => {
                        const apiType = getHarvestTypeFromDisplay(value);
                        setValue('harvestType', apiType);
                    }}
                    disabledDate={true}
                />

                {/* Chỉ hiển thị số liệu thu hoạch khi không phải "Đóng chu kỳ" */}
                {/* {harvestType !== 'Đóng chu kỳ' && ( */}
                <HarvestDataBox
                    yieldAmount={watch('totalWeightKg') || ''}
                    onYieldAmountChange={value => setValue('totalWeightKg', value)}
                    shrimpSize={watch('shrimpSize') || ''}
                    onShrimpSizeChange={value => setValue('shrimpSize', value)}
                    referencePrice={watch('referencePrice') || ''}
                    onReferencePriceChange={value => setValue('referencePrice', value)}
                />
                {/* )} */}

                <SelectionNotesBox
                    notes={watch('notes') || ''}
                    onNotesChange={value => setValue('notes', value)}
                />
            </SafeInputLayout>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <ButtonBarFarm
                    primaryTitle={itemToEdit ? 'Cập nhật thông tin' : 'Thu hoạch hết'}
                    secondaryTitle="Huỷ"
                    onPrimaryPress={handleSavePress}
                    onSecondaryPress={handleCancel}
                />
            </View>

            {/* Confirmation Modal for "Thu hết" and "Đóng chu kỳ" */}
            {confirmationModalType && (
                <ConfirmationModal
                    visible={isConfirmationModalVisible}
                    onConfirm={handleConfirmSave}
                    onCancel={handleCancelConfirmation}
                    type={confirmationModalType}
                />
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
