import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { documentApi } from '@/features/material/api/documentApi';
import {
    useSizeMeasurement,
    useCreateSizeMeasurement,
    useUpdateSizeMeasurement,
    useDeleteSizeMeasurement,
} from '@/features/farm/hooks/useSizeMeasurement';
import { JobExecution } from '@/features/farm/types/farm.types';
import { NormalizedError } from '@/core/api/errorHandler';
import { numericStringSchema } from '@/shared/utils/validation';
import {
    showShrimpSizeRequiredToast,
    showRemainingWeightRequiredToast,
} from '@/features/farm/utils/toastMessages';

interface UseMeasureShrimpSizeFormProps {
    pondId?: string;
    itemToEdit?: JobExecution;
    onSaveSuccess?: () => void;
}

export const useMeasureShrimpSizeForm = ({
    pondId,
    itemToEdit,
    onSaveSuccess,
}: UseMeasureShrimpSizeFormProps) => {
    const navigation = useNavigation();

    // API Hooks
    // If itemToEdit is provided, we use it directly as per requirement (Router data usage)
    // We disable fetching detail by ID when itemToEdit is present
    const { data: apiData } = useSizeMeasurement(pondId || '', '');
    const detail = apiData?.data;

    const createSizeMeasurement = useCreateSizeMeasurement();
    const updateSizeMeasurement = useUpdateSizeMeasurement();
    const deleteSizeMeasurement = useDeleteSizeMeasurement();

    // State
    const [time, setTime] = useState(new Date());
    const [shrimpSize, setShrimpSize] = useState('');
    const [remainingWeight, setRemainingWeight] = useState('');
    const [averageShrimpSize, setAverageShrimpSize] = useState('');
    const [notes, setNotes] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [initialDocumentIds, setInitialDocumentIds] = useState<string[]>([]);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    // Populate state
    useEffect(() => {
        const populateData = async () => {
            if (itemToEdit) {
                // Handling JobExecution from Router/List
                const meta = itemToEdit.meta as any;

                const createdAt = itemToEdit.createdAt || meta?.date;
                if (createdAt) setTime(new Date(createdAt));

                if (meta) {
                    if (meta.shrimpSize) setShrimpSize(meta.shrimpSize.toString());
                    if (meta.remainingWeight) setRemainingWeight(meta.remainingWeight.toString());
                    if (meta.averageShrimpSize)
                        setAverageShrimpSize(meta.averageShrimpSize.toString());
                    if (meta.notes) setNotes(meta.notes);

                    if (meta.documents && Array.isArray(meta.documents)) {
                        const docUrls = meta.documents.map((d: any) => d.publicUrl).filter(Boolean);
                        setImages(docUrls);
                        setInitialDocumentIds(meta.documents.map((d: any) => d.id));
                    } else if (meta.images) {
                        setImages(meta.images);
                        setInitialDocumentIds(meta.documentIds || []);
                    } else if (itemToEdit.images) {
                        // Fallback to top level images if meta images missing
                        setImages(itemToEdit.images);
                        setInitialDocumentIds(itemToEdit.documentIds || []);
                    }
                }
            } else if (detail) {
                // Handling API Detail response
                if (detail.createdAt) setTime(new Date(detail.createdAt));

                const sizeDetail = detail.sizeMeasurementDetail ?? detail.sizeMeasurement;

                if (sizeDetail) {
                    const {
                        shrimpSizePcsPerKg,
                        estimatedRemainingStockKg,
                        averageShrimpSize: avgSize,
                        notes: noteValue,
                    } = sizeDetail;

                    if (shrimpSizePcsPerKg != null) setShrimpSize(shrimpSizePcsPerKg.toString());
                    if (estimatedRemainingStockKg != null)
                        setRemainingWeight(estimatedRemainingStockKg.toString());
                    if (avgSize != null) setAverageShrimpSize(avgSize.toString());
                    if (noteValue) setNotes(noteValue);
                }

                if (detail.documentIds && detail.documentIds.length > 0) {
                    const urls = await documentApi.getUrls(detail.documentIds);
                    setInitialDocumentIds(detail.documentIds);
                    setImages(urls);
                }
            }
        };

        populateData();
    }, [detail, itemToEdit]);

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

    const handleSave = (documentIds: string[]) => {
        // Validation for required fields
        if (!shrimpSize) {
            showShrimpSizeRequiredToast();
            return;
        }

        if (!remainingWeight) {
            showRemainingWeightRequiredToast();
            return;
        }

        const isSizeValid = numericStringSchema.safeParse(shrimpSize).success;
        const isWeightValid = numericStringSchema.safeParse(remainingWeight).success;

        if (!isSizeValid || !isWeightValid) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng nhập đúng định dạng số cho kích thước và trọng lượng',
            });
            return;
        }

        if (!pondId) {
            Toast.show({ type: 'error', text1: 'Không tìm thấy thông tin ao' });
            return;
        }

        const size = parseFloat(shrimpSize);
        const weight = parseFloat(remainingWeight);

        const commonData = {
            documentIds,
            sizeMeasurementDetail: {
                shrimpSizePcsPerKg: size,
                estimatedRemainingStockKg: weight,
                averageShrimpSize: averageShrimpSize ? parseFloat(averageShrimpSize) : undefined,
                notes,
            },
        };

        if (itemToEdit) {
            updateSizeMeasurement.mutate(
                {
                    pondId,
                    id: itemToEdit.id,
                    data: commonData,
                },
                {
                    onSuccess: () => {
                        onSaveSuccess?.();
                        Toast.show({ type: 'success', text1: 'Đã cập nhật thành công' });
                        navigation.goBack();
                    },
                    onError: handleError,
                }
            );
        } else {
            createSizeMeasurement.mutate(
                {
                    pondId,
                    data: commonData,
                },
                {
                    onSuccess: () => {
                        onSaveSuccess?.();
                        Toast.show({
                            type: 'success',
                            text1: 'Đã đo kích thước tôm thành công',
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

        deleteSizeMeasurement.mutate(
            { pondId, id: itemToEdit.id },
            {
                onSuccess: () => {
                    setIsDeleteModalVisible(false);
                    Toast.show({ type: 'success', text1: 'Tác vụ đã được xóa' });
                    navigation.goBack();
                },
                onError: handleError,
            }
        );
    };

    return {
        time,
        setTime,
        shrimpSize,
        setShrimpSize,
        remainingWeight,
        setRemainingWeight,
        averageShrimpSize,
        setAverageShrimpSize,
        notes,
        setNotes,
        images,
        initialDocumentIds,
        isDeleteModalVisible,
        setIsDeleteModalVisible,
        handleSave,
        handleDelete,
        isSubmitting:
            createSizeMeasurement.isPending ||
            updateSizeMeasurement.isPending ||
            deleteSizeMeasurement.isPending,
    };
};
