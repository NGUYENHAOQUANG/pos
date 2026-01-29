import React, { useEffect, useState, useMemo, useRef } from 'react';
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
import {
    GeneralInfoBox,
    GeneralInfoBoxRef,
} from '@/features/farm/components/pondwork/GeneralInfoBox';
import { ShrimpInspectionFoodCheckBox } from '@/features/farm/components/pondwork/shrimp-inspection/ShrimpInspectionFoodCheckBox';
import { ShrimpInspectionObservationBox } from '@/features/farm/components/pondwork/shrimp-inspection/ShrimpInspectionObservationBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import { ShrimpInspectionMeta } from '@/features/farm/types/farm.types';
import { parseDate } from '@/features/farm/utils/dateUtils';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { mapToApiPayload } from '@/features/farm/utils/shrimpHealthCheckMapper';
import {
    useCreateShrimpHealthCheck,
    useUpdateShrimpHealthCheck,
    useDeleteShrimpHealthCheck,
} from '@/features/farm/hooks/useShrimpHealthCheckData';
import { Loading } from '@/shared/components/ui/Loading';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'ShrimpInspectionScreen'>;

export const ShrimpInspectionScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond, itemToEdit } = route.params || {};
    const insets = useSafeAreaInsets();
    const { setTabBarVisible } = useTabBarVisibility();
    const scrollViewRef = useRef<ScrollView>(null);
    const generalInfoBoxRef = useRef<GeneralInfoBoxRef>(null);

    // Use individual selectors instead of useFarm() to prevent unnecessary re-renders
    const meta = useMemo(
        () => (itemToEdit?.meta as ShrimpInspectionMeta) || ({} as ShrimpInspectionMeta),
        [itemToEdit?.meta]
    );
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [foodAmount, setFoodAmount] = useState(meta.foodAmount || '');
    const [leftoverFood, setLeftoverFood] = useState(meta.leftoverFood || 'Hết');
    const [intestine, setIntestine] = useState(meta.intestine || 'Đầy');
    const [intestineColor, setIntestineColor] = useState(meta.intestineColor || 'Màu thức ăn');
    const [stoolColor, setStoolColor] = useState(meta.stoolColor || 'Màu thức ăn');
    const [liver, setLiver] = useState(meta.liver || 'Bình thường');
    const [notes, setNotes] = useState(itemToEdit?.note || '');
    const [imageUris, setImageUris] = useState<string[]>(meta.images || []);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    // React Query mutations
    const createMutation = useCreateShrimpHealthCheck();
    const updateMutation = useUpdateShrimpHealthCheck();
    const deleteMutation = useDeleteShrimpHealthCheck();

    const isSaving =
        createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    // Store initial data for comparison when editing
    const initialData = useMemo(() => {
        if (!itemToEdit) return null;
        const dateObj = (() => {
            const d = itemToEdit.date ? parseDate(itemToEdit.date) : new Date();
            if (itemToEdit.date && itemToEdit.time) {
                const [hours, minutes] = itemToEdit.time.split(':').map(Number);
                if (!isNaN(hours) && !isNaN(minutes)) {
                    d.setHours(hours, minutes);
                }
            }
            return d;
        })();
        return {
            date: dateObj,
            foodAmount: meta.foodAmount || '',
            leftoverFood: meta.leftoverFood || 'Hết',
            intestine: meta.intestine || 'Đầy',
            intestineColor: meta.intestineColor || 'Màu thức ăn',
            stoolColor: meta.stoolColor || 'Màu thức ăn',
            liver: meta.liver || 'Bình thường',
            notes: itemToEdit?.note || '',
            images: meta.images || [],
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

    const handleSave = async () => {
        if (!itemToEdit && foodAmount.trim().length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng nhập lượng thức ăn giảm',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        if (!pond?.id) {
            Toast.show({
                type: 'error',
                text1: 'Không tìm thấy thông tin ao',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        // Get uploaded document IDs from GeneralInfoBox
        const documentIds = generalInfoBoxRef.current?.getUploadedIds() || [];

        // Map UI state to API payload
        const payload = mapToApiPayload({
            foodAmount,
            leftoverFood,
            intestine,
            intestineColor,
            stoolColor,
            liver,
            notes,
            documentIds,
        });

        if (itemToEdit) {
            // Update existing item using React Query mutation
            updateMutation.mutate(
                {
                    pondId: pond.id,
                    id: itemToEdit.id,
                    payload,
                },
                {
                    onSuccess: () => {
                        // Mark as saved to prevent auto-cleanup
                        generalInfoBoxRef.current?.markAsSaved();

                        showEditJobSuccessToast('SHRIMP_INSPECTION');
                        navigation.goBack();
                    },
                    onError: (error: any) => {
                        console.error('[ShrimpInspectionScreen] Update failed:', error);

                        Toast.show({
                            type: 'error',
                            text1: 'Không thể cập nhật kiểm tra tôm',
                            text2:
                                error?.response?.data?.message ||
                                error?.message ||
                                'Vui lòng thử lại',
                            position: 'top',
                            visibilityTime: 3000,
                        });
                    },
                }
            );
        } else {
            // Create new item using React Query mutation
            createMutation.mutate(
                {
                    pondId: pond.id,
                    payload,
                },
                {
                    onSuccess: () => {
                        // Mark as saved to prevent auto-cleanup
                        generalInfoBoxRef.current?.markAsSaved();

                        showAddJobSuccessToast('SHRIMP_INSPECTION');
                        navigation.goBack();
                    },
                    onError: (error: any) => {
                        console.error('[ShrimpInspectionScreen] Create failed:', error);

                        Toast.show({
                            type: 'error',
                            text1: 'Không thể tạo kiểm tra tôm',
                            text2:
                                error?.response?.data?.message ||
                                error?.message ||
                                'Vui lòng thử lại',
                            position: 'top',
                            visibilityTime: 3000,
                        });
                    },
                }
            );
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    const handleDeletePress = () => {
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        if (!pond?.id || !itemToEdit) return;

        const pondId = pond.id;

        deleteMutation.mutate(
            { pondId, id: itemToEdit.id },
            {
                onSuccess: () => {
                    setDeleteModalVisible(false);
                    navigation.goBack();

                    Toast.show({
                        type: 'success',
                        text1: 'Đã xoá kiểm tra tôm',
                        position: 'top',
                        visibilityTime: 3000,
                    });
                },
                onError: (error: any) => {
                    console.error('[ShrimpInspectionScreen] Delete failed:', error);

                    Toast.show({
                        type: 'error',
                        text1: 'Không thể xoá kiểm tra tôm',
                        text2:
                            error?.response?.data?.message || error?.message || 'Vui lòng thử lại',
                        position: 'top',
                        visibilityTime: 3000,
                    });
                },
            }
        );
    };

    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
    };

    // Check if form is filled completely (foodAmount is required only when creating new)
    const isFormComplete = itemToEdit ? true : foodAmount.trim().length > 0;

    // Check if data has changed from initial (when editing)
    const hasChanges = useMemo(() => {
        if (!itemToEdit || !initialData) return true; // New item always has "changes"

        // Compare dates (only date part, not time)
        const currentDateStr = selectedDate.toDateString();
        const initialDateStr = initialData.date.toDateString();
        if (currentDateStr !== initialDateStr) return true;

        // Compare other fields
        if (foodAmount !== initialData.foodAmount) return true;
        if (leftoverFood !== initialData.leftoverFood) return true;
        if (intestine !== initialData.intestine) return true;
        if (intestineColor !== initialData.intestineColor) return true;
        if (stoolColor !== initialData.stoolColor) return true;
        if (liver !== initialData.liver) return true;
        if (notes !== initialData.notes) return true;

        // Compare images array
        if (imageUris.length !== initialData.images.length) return true;
        const imagesChanged = imageUris.some((uri, index) => uri !== initialData.images[index]);
        if (imagesChanged) return true;

        return false;
    }, [
        itemToEdit,
        initialData,
        selectedDate,
        foodAmount,
        leftoverFood,
        intestine,
        intestineColor,
        stoolColor,
        liver,
        notes,
        imageUris,
    ]);

    const isButtonDisabled = !isFormComplete || (itemToEdit && !hasChanges);

    return (
        <Loading isLoading={isSaving}>
            <View style={styles.container}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Kiểm tra tôm</Text>
                    {itemToEdit ? (
                        <DeleteButton onPress={handleDeletePress} />
                    ) : (
                        <View style={styles.headerSpacer} />
                    )}
                </View>

                {/* Content */}
                <SafeInputLayout>
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        contentContainerStyle={[styles.scrollContent]}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Thông tin chung Box */}
                        <GeneralInfoBox
                            ref={generalInfoBoxRef}
                            date={selectedDate}
                            onDateChange={setSelectedDate}
                            type="withImage"
                            imageUris={imageUris}
                            onImagesChange={setImageUris}
                            documentIds={meta.documentIds}
                            disabledDate={true}
                        />

                        {/* Kiểm tra thức ăn Box */}
                        <ShrimpInspectionFoodCheckBox
                            foodAmount={foodAmount}
                            onFoodAmountChange={setFoodAmount}
                            leftoverFood={leftoverFood}
                            onLeftoverFoodChange={setLeftoverFood}
                        />

                        {/* Quan sát mẫu Box */}
                        <ShrimpInspectionObservationBox
                            intestine={intestine}
                            onIntestineChange={setIntestine}
                            intestineColor={intestineColor}
                            onIntestineColorChange={setIntestineColor}
                            stoolColor={stoolColor}
                            onStoolColorChange={setStoolColor}
                            liver={liver}
                            onLiverChange={setLiver}
                        />

                        {/* Ghi chú Box */}
                        <SelectionNotesBox
                            notes={notes}
                            onNotesChange={setNotes}
                            scrollViewRef={scrollViewRef}
                        />
                    </ScrollView>
                </SafeInputLayout>

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
                    successMessage="Đã xoá kiểm tra tôm"
                    showSuccessToast={false}
                />
            </View>
        </Loading>
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
    scrollView: {
        flex: 1,
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
