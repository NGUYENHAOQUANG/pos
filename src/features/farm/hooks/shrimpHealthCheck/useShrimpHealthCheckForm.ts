import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { NormalizedError } from '@/core/api/errorHandler';

import {
    useCreateShrimpHealthCheck,
    useUpdateShrimpHealthCheck,
    useDeleteShrimpHealthCheck,
} from '@/features/farm/hooks/useShrimpHealthCheckData';
import { JobExecution, ShrimpInspectionMeta } from '@/features/farm/types/farm.types';
import { mapToApiPayload, mapFromApiResponse } from '@/features/farm/utils/shrimpHealthCheckMapper';
import { parseDate } from '@/features/farm/utils/dateUtils';

interface UseShrimpHealthCheckFormProps {
    pondId?: string;
    itemToEdit?: JobExecution;
    meta?: ShrimpInspectionMeta;
}

export const useShrimpHealthCheckForm = ({
    pondId,
    itemToEdit,
    meta,
}: UseShrimpHealthCheckFormProps) => {
    const navigation = useNavigation();

    const createMutation = useCreateShrimpHealthCheck();
    const updateMutation = useUpdateShrimpHealthCheck();
    const deleteMutation = useDeleteShrimpHealthCheck();

    // State
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [foodAmount, setFoodAmount] = useState(meta?.foodAmount || '');
    const [leftoverFood, setLeftoverFood] = useState(meta?.leftoverFood || 'Hết');
    const [intestine, setIntestine] = useState(meta?.intestine || 'Đầy');
    const [intestineColor, setIntestineColor] = useState(meta?.intestineColor || 'Màu thức ăn');
    const [stoolColor, setStoolColor] = useState(meta?.stoolColor || 'Màu thức ăn');
    const [liver, setLiver] = useState(meta?.liver || 'Bình thường');
    const [notes, setNotes] = useState(itemToEdit?.note || '');
    const [imageUris, setImageUris] = useState<string[]>(meta?.images || []);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    // Initial data for change detection
    const [initialData, setInitialData] = useState<{
        date: Date;
        foodAmount: string;
        leftoverFood: string;
        intestine: string;
        intestineColor: string;
        stoolColor: string;
        liver: string;
        notes: string;
        images: string[];
    } | null>(null);

    useEffect(() => {
        if (!itemToEdit) {
            setInitialData(null);
            return;
        }

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

        // RE-WRITING LOGIC:

        let initialFormState = {
            date: dateObj,
            foodAmount: meta?.foodAmount || '',
            leftoverFood: meta?.leftoverFood || 'Hết',
            intestine: meta?.intestine || 'Đầy',
            intestineColor: meta?.intestineColor || 'Màu thức ăn',
            stoolColor: meta?.stoolColor || 'Màu thức ăn',
            liver: meta?.liver || 'Bình thường',
            notes: itemToEdit?.note || '',
            images: meta?.images || [],
        };

        // If meta contains raw keys (e.g. from WorkLog), map it!
        if (meta && (meta as any).feedInTrapG !== undefined) {
            const fromApi = mapFromApiResponse({
                value: (meta as any).feedInTrapG,
                healthCheck: meta as any,
                images: (meta as any).documents?.map((d: any) => d.publicUrl) || meta.images || [],
            });
            initialFormState = {
                ...initialFormState,
                foodAmount: fromApi.foodAmount,
                leftoverFood: fromApi.leftoverFood,
                intestine: fromApi.intestine,
                intestineColor: fromApi.intestineColor,
                stoolColor: fromApi.stoolColor,
                liver: fromApi.liver,
                notes: fromApi.notes || itemToEdit?.note || '',
            };
        }

        setSelectedDate(dateObj);
        setInitialData(initialFormState);

        // Update state hooks
        setFoodAmount(initialFormState.foodAmount);
        setLeftoverFood(initialFormState.leftoverFood);
        setIntestine(initialFormState.intestine);
        setIntestineColor(initialFormState.intestineColor);
        setStoolColor(initialFormState.stoolColor);
        setLiver(initialFormState.liver);
        setNotes(initialFormState.notes);
        setImageUris(initialFormState.images);
    }, [itemToEdit, meta]);

    const isSaving =
        createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    const isFormComplete = itemToEdit ? true : foodAmount.trim().length > 0;

    const hasChanges = (() => {
        if (!itemToEdit || !initialData) return true; // New item always considered "changed"

        const currentDateStr = selectedDate.toDateString();
        const initialDateStr = initialData.date.toDateString();
        if (currentDateStr !== initialDateStr) return true;

        if (foodAmount !== initialData.foodAmount) return true;
        if (leftoverFood !== initialData.leftoverFood) return true;
        if (intestine !== initialData.intestine) return true;
        if (intestineColor !== initialData.intestineColor) return true;
        if (stoolColor !== initialData.stoolColor) return true;
        if (liver !== initialData.liver) return true;
        if (notes !== initialData.notes) return true;

        if (imageUris.length !== initialData.images.length) return true;
        const imagesChanged = imageUris.some((uri, index) => uri !== initialData.images[index]);
        if (imagesChanged) return true;

        return false;
    })();

    const isButtonDisabled = !isFormComplete || (itemToEdit && !hasChanges);

    const handleError = (err: unknown) => {
        const error = err as NormalizedError;

        if (error.type === 'VALIDATION_ERROR') {
            const firstFieldKey = Object.keys(error.fields)[0];
            if (firstFieldKey && error.fields[firstFieldKey]?.length > 0) {
                Toast.show({
                    type: 'error',
                    text1: error.fields[firstFieldKey][0],
                    visibilityTime: 4000,
                });
                return;
            }
        }
        if (error.type === 'NOT_FOUND_ERROR') {
            Toast.show({
                type: 'error',
                text1: error.message,
                visibilityTime: 4000,
            });
            return;
        }
        Toast.show({ type: 'error', text1: error.message || 'Có lỗi xảy ra' });
    };

    const handleSave = (documentIds: string[], onSaved?: () => void) => {
        if (!itemToEdit && foodAmount.trim().length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng nhập lượng thức ăn giảm',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        if (!pondId) {
            Toast.show({
                type: 'error',
                text1: 'Không tìm thấy thông tin ao',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

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
            updateMutation.mutate(
                {
                    pondId,
                    id: itemToEdit.id,
                    payload,
                },
                {
                    onSuccess: () => {
                        onSaved?.();
                        Toast.show({
                            type: 'success',
                            text1: 'Đã cập nhật kiểm tra tôm',
                            position: 'top',
                            visibilityTime: 3000,
                        });
                        navigation.goBack();
                    },
                    onError: handleError,
                }
            );
        } else {
            createMutation.mutate(
                {
                    pondId,
                    payload,
                },
                {
                    onSuccess: () => {
                        onSaved?.();
                        Toast.show({
                            type: 'success',
                            text1: 'Đã tạo kiểm tra tôm',
                            position: 'top',
                            visibilityTime: 3000,
                        });
                        navigation.goBack();
                    },
                    onError: handleError,
                }
            );
        }
    };

    const handleDelete = () => {
        if (!pondId || !itemToEdit?.id) return;

        deleteMutation.mutate(
            { pondId, id: itemToEdit.id },
            {
                onSuccess: () => {
                    setIsDeleteModalVisible(false);
                    Toast.show({
                        type: 'success',
                        text1: 'Đã xoá kiểm tra tôm',
                        position: 'top',
                        visibilityTime: 3000,
                    });
                    navigation.goBack();
                },
                onError: (error: any) => {
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

    return {
        // state
        selectedDate,
        setSelectedDate,
        foodAmount,
        setFoodAmount,
        leftoverFood,
        setLeftoverFood,
        intestine,
        setIntestine,
        intestineColor,
        setIntestineColor,
        stoolColor,
        setStoolColor,
        liver,
        setLiver,
        notes,
        setNotes,
        imageUris,
        setImageUris,
        isDeleteModalVisible,
        setIsDeleteModalVisible,
        // handlers
        handleSave,
        handleDelete,
        // computed
        isSaving,
        isButtonDisabled,
    };
};
