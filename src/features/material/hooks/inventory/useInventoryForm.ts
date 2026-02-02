import { useState, useEffect } from 'react';
import { useInventoryDetail, useInventoryItems } from './useInventoryDetails';
import { showValidationError } from '@/features/material/utils/validationToast';

interface UseInventoryFormProps {
    inventoryId?: string;
}

export const useInventoryForm = ({ inventoryId }: UseInventoryFormProps) => {
    // Queries
    const {
        data: detailData,
        isLoading: isLoadingDetailData,
        error: detailError,
    } = useInventoryDetail(inventoryId);
    const {
        data: itemsData,
        isLoading: isLoadingItemsData,
        error: itemsError,
    } = useInventoryItems(inventoryId);

    // Form State
    const [date, setDate] = useState(new Date());
    const [note, setNote] = useState('');
    const [creatorName, setCreatorName] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    // Items State
    const [items, setItems] = useState<any[]>([]);

    // Loading State
    const isLoadingDetail = isLoadingDetailData || isLoadingItemsData;

    // Error Handling
    useEffect(() => {
        if (detailError || itemsError) {
            console.error('Failed to fetch inventory data:', detailError || itemsError);
            showValidationError('Không thể tải thông tin phiếu kiểm kê');
        }
    }, [detailError, itemsError]);

    // Sync Detail
    useEffect(() => {
        if (detailData) {
            setNote(detailData.note || '');
            setStatus(detailData.status || '');
            if (detailData.creator) {
                setCreatorName(detailData.creator.fullname || '');
            }
            if (detailData.createdAt) {
                setDate(new Date(detailData.createdAt));
            }
        }
    }, [detailData]);

    // Sync Items
    useEffect(() => {
        if (itemsData && itemsData.length > 0) {
            setItems(itemsData);
        } else if (itemsData && itemsData.length === 0 && inventoryId) {
            // If existing inventory returns empty, init with 1 empty item
            setItems([
                {
                    id: Date.now().toString(),
                    materialId: '',
                    materialName: '',
                    oldStock: 0,
                    newStock: '',
                    difference: 0,
                },
            ]);
        }
    }, [itemsData, inventoryId]);

    // Initial item for create mode (no inventoryId)
    useEffect(() => {
        if (!inventoryId) {
            setItems([
                {
                    id: Date.now().toString(),
                    materialId: '',
                    materialName: '',
                    oldStock: 0,
                    newStock: '',
                    difference: 0,
                },
            ]);
        }
    }, [inventoryId]);

    return {
        formState: {
            date,
            note,
            items,
            isLoadingDetail,
            creatorName,
            status,
        },
        setters: {
            setDate,
            setNote,
            setItems,
        },
    };
};
