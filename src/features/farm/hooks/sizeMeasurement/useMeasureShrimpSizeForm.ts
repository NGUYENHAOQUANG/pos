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
    const { data: apiData } = useSizeMeasurement(pondId || '', itemToEdit?.id || '');
    const detail = apiData?.data;

    const createSizeMeasurement = useCreateSizeMeasurement();
    const updateSizeMeasurement = useUpdateSizeMeasurement();
    const deleteSizeMeasurement = useDeleteSizeMeasurement();

    // State
    const [time, setTime] = useState(new Date());
    const [shrimpSize, setShrimpSize] = useState('');
    const [remainingWeight, setRemainingWeight] = useState('');
    const [notes, setNotes] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [initialDocumentIds, setInitialDocumentIds] = useState<string[]>([]);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    // Populate state
    useEffect(() => {
        const populateData = async () => {
            if (detail) {
                if (detail.createdAt) {
                    setTime(new Date(detail.createdAt));
                }
                if (detail.sizeMeasurement) {
                    const {
                        shrimpSizePcsPerKg,
                        estimatedRemainingStockKg,
                        notes: noteValue,
                    } = detail.sizeMeasurement;

                    setShrimpSize(
                        shrimpSizePcsPerKg !== undefined && shrimpSizePcsPerKg !== null
                            ? shrimpSizePcsPerKg.toString()
                            : ''
                    );
                    setRemainingWeight(
                        estimatedRemainingStockKg !== undefined &&
                            estimatedRemainingStockKg !== null
                            ? estimatedRemainingStockKg.toString()
                            : ''
                    );
                    setNotes(noteValue || '');
                }
                if (detail.documentIds && detail.documentIds.length > 0) {
                    const results = await Promise.all(
                        detail.documentIds.map(async id => {
                            try {
                                const url = await documentApi.getUrl(id);
                                return { id, url };
                            } catch {
                                return { id, url: '' };
                            }
                        })
                    );
                    const validResults = results.filter(
                        (r): r is { id: string; url: string } => !!r.url
                    );
                    const newImages = validResults.map(r => r.url);
                    const newDocIds = validResults.map(r => r.id);

                    setImages(prev =>
                        JSON.stringify(prev) === JSON.stringify(newImages) ? prev : newImages
                    );
                    setInitialDocumentIds(prev =>
                        JSON.stringify(prev) === JSON.stringify(newDocIds) ? prev : newDocIds
                    );
                } else {
                    setImages([]);
                    setInitialDocumentIds([]);
                }
            } else if (itemToEdit && itemToEdit.meta) {
                const meta = itemToEdit.meta as any;
                if (meta.date) setTime(new Date(meta.date));
                if (meta.shrimpSize) setShrimpSize(meta.shrimpSize);
                if (meta.remainingWeight) setRemainingWeight(meta.remainingWeight);
                if (meta.notes) setNotes(meta.notes);
                if (meta.images) {
                    setImages(meta.images);
                    setInitialDocumentIds(meta.documentIds || []);
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
        if (!shrimpSize || !remainingWeight) {
            Toast.show({ type: 'error', text1: 'Vui lòng nhập đủ thông tin bắt buộc' });
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
            sizeMeasurement: {
                shrimpSizePcsPerKg: size,
                estimatedRemainingStockKg: weight,
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
