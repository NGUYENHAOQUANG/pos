import { useState, useEffect, useMemo } from 'react';
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
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';

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

    const [initialState, setInitialState] = useState<{
        shrimpSize: string;
        remainingWeight: string;
        averageShrimpSize: string;
        notes: string;
        images: string[];
    } | null>(null);

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

            // Capture initial state for unsaved changes detection
            setInitialState(prev => {
                if (prev) return prev; // Only set once
                let initShrimpSize = '';
                let initRemainingWeight = '';
                let initAverageShrimpSize = '';
                let initNotes = '';
                let initImages: string[] = [];

                if (itemToEdit) {
                    const meta = itemToEdit.meta as any;
                    if (meta) {
                        if (meta.shrimpSize) initShrimpSize = meta.shrimpSize.toString();
                        if (meta.remainingWeight)
                            initRemainingWeight = meta.remainingWeight.toString();
                        if (meta.averageShrimpSize)
                            initAverageShrimpSize = meta.averageShrimpSize.toString();
                        if (meta.notes) initNotes = meta.notes;
                        if (meta.documents && Array.isArray(meta.documents)) {
                            initImages = meta.documents
                                .map((d: any) => d.publicUrl)
                                .filter(Boolean);
                        } else if (meta.images) {
                            initImages = meta.images;
                        } else if (itemToEdit.images) {
                            initImages = itemToEdit.images;
                        }
                    }
                } else if (detail) {
                    const sizeDetail = detail.sizeMeasurementDetail ?? detail.sizeMeasurement;
                    if (sizeDetail) {
                        if (sizeDetail.shrimpSizePcsPerKg != null)
                            initShrimpSize = sizeDetail.shrimpSizePcsPerKg.toString();
                        if (sizeDetail.estimatedRemainingStockKg != null)
                            initRemainingWeight = sizeDetail.estimatedRemainingStockKg.toString();
                        if (sizeDetail.averageShrimpSize != null)
                            initAverageShrimpSize = sizeDetail.averageShrimpSize.toString();
                        if (sizeDetail.notes) initNotes = sizeDetail.notes;
                    }
                }
                return {
                    shrimpSize: initShrimpSize,
                    remainingWeight: initRemainingWeight,
                    averageShrimpSize: initAverageShrimpSize,
                    notes: initNotes,
                    images: initImages,
                };
            });
        };

        populateData();
    }, [detail, itemToEdit]);

    const hasChanges = useMemo(() => {
        if (!itemToEdit) {
            return !!(
                shrimpSize ||
                remainingWeight ||
                averageShrimpSize ||
                notes ||
                images.length > 0
            );
        }
        if (!initialState) return false;

        return (
            shrimpSize !== initialState.shrimpSize ||
            remainingWeight !== initialState.remainingWeight ||
            averageShrimpSize !== initialState.averageShrimpSize ||
            notes !== initialState.notes ||
            JSON.stringify(images) !== JSON.stringify(initialState.images)
        );
    }, [itemToEdit, initialState, shrimpSize, remainingWeight, averageShrimpSize, notes, images]);

    const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(hasChanges);

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
        const isSizeValid = numericStringSchema.safeParse(shrimpSize).success;
        const isWeightValid = numericStringSchema.safeParse(remainingWeight).success;

        if (!isSizeValid || !isWeightValid || !shrimpSize || !remainingWeight) {
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
                        allowNavigation();
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
                        allowNavigation();
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
                    allowNavigation();
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
        setImages,
        initialDocumentIds,
        isDeleteModalVisible,
        setIsDeleteModalVisible,
        handleSave,
        handleDelete,
        UnsavedChangesModal,
        hasChanges,
        isSubmitting:
            createSizeMeasurement.isPending ||
            updateSizeMeasurement.isPending ||
            deleteSizeMeasurement.isPending,
    };
};
