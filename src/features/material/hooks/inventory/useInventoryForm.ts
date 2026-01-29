import { useState, useEffect } from 'react';
import { inventoryApi } from '@/features/material/api/inventoryApi';
import { showValidationError } from '@/features/material/utils/validationToast';

interface UseInventoryFormProps {
    inventoryId?: string;
}

export const useInventoryForm = ({ inventoryId }: UseInventoryFormProps) => {
    const [date, setDate] = useState(new Date());
    const [note, setNote] = useState('');
    const [creatorName, setCreatorName] = useState<string>(''); // Store creator name from API
    const [materialName, setMaterialName] = useState('');
    const [oldStock, setOldStock] = useState(0);
    const [newStock, setNewStock] = useState('');
    const [materialGroup, setMaterialGroup] = useState('');
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
    const [itemId, setItemId] = useState<string>(''); // Store existing item ID for updates
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    // Fetch inventory detail when in edit mode
    useEffect(() => {
        if (inventoryId) {
            const fetchInventoryDetail = async () => {
                setIsLoadingDetail(true);
                try {
                    const response = await inventoryApi.getDetail(inventoryId);
                    if (response.success && response.data) {
                        const detail = response.data;
                        setNote(detail.note || '');
                        // ...
                        if (detail.creator) {
                            setCreatorName(detail.creator.fullname || '');
                        }
                        if (detail.createdAt) {
                            setDate(new Date(detail.createdAt));
                        }

                        // Handle PaginatedList or Array
                        // @ts-ignore - API change adaptation
                        const itemsList = detail.items?.items || detail.items || [];

                        if (itemsList && itemsList.length > 0) {
                            const firstItem = itemsList[0];
                            setItemId(firstItem.inventoryCheckItemId || firstItem.id); // Save item ID for updates
                            setSelectedMaterialId(firstItem.materialId);
                            setMaterialName(firstItem.materialName || firstItem.materialCode || '');
                            setOldStock(firstItem.expectedQty);
                            setNewStock(String(firstItem.actualQty));
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch inventory detail:', error);
                    showValidationError('Không thể tải thông tin phiếu kiểm kê');
                } finally {
                    setIsLoadingDetail(false);
                }
            };
            fetchInventoryDetail();
        }
    }, [inventoryId]);

    return {
        formState: {
            date,
            note,
            creatorName,
            materialName,
            oldStock,
            newStock,
            materialGroup,
            selectedMaterialId,
            itemId,
            isLoadingDetail,
        },
        setters: {
            setDate,
            setNote,
            setMaterialName,
            setOldStock,
            setNewStock,
            setMaterialGroup,
            setSelectedMaterialId,
        },
    };
};
