import { useState, useEffect, useCallback } from 'react';
import { inventoryApi } from '@/features/material/api/inventoryApi';
import { materialApi } from '@/features/material/api/materialApi';
import { showValidationError } from '@/features/material/utils/validationToast';

interface UseInventoryFormProps {
    inventoryId?: string;
}

export const useInventoryForm = ({ inventoryId }: UseInventoryFormProps) => {
    // Form State
    const [date, setDate] = useState(new Date());
    const [note, setNote] = useState('');
    const [creatorName, setCreatorName] = useState<string>('');
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [status, setStatus] = useState<string>('');

    // Items State
    const [items, setItems] = useState<any[]>([]);

    const fetchInventoryDetail = useCallback(async () => {
        setIsLoadingDetail(true);
        try {
            const [detailRes, itemsRes] = await Promise.all([
                inventoryApi.getDetail(inventoryId!),
                inventoryApi.getItems(inventoryId!),
            ]);

            if (detailRes.success && detailRes.data) {
                const detail = detailRes.data;
                setNote(detail.note || '');
                setStatus(detail.status || '');
                if (detail.creator) {
                    setCreatorName(detail.creator.fullname || '');
                }
                if (detail.createdAt) {
                    setDate(new Date(detail.createdAt));
                }
            }

            if (itemsRes.success && itemsRes.data) {
                const itemsData = itemsRes.data;
                const itemsList = itemsData.items || itemsData || [];

                console.log(`Fetched ${itemsList.length} items for InventoryCheck ${inventoryId}`);

                if (itemsList && itemsList.length > 0) {
                    const mappedItems = await Promise.all(
                        itemsList.map(async (item: any) => {
                            let unit = item.unitName || item.UnitName || item.unit || item.Unit;

                            // Fetch fresh material detail to ensure correct unit
                            const mId = item.materialId || item.MaterialId;
                            if (mId) {
                                try {
                                    const mRes = await materialApi.getById(mId);
                                    if (mRes.success && mRes.data) {
                                        // Prioritize Fresh Unit Name
                                        unit =
                                            mRes.data.unitName ||
                                            (mRes.data as any).UnitName ||
                                            unit;
                                    }
                                } catch (error) {
                                    console.warn('Failed to fetch material detail', error);
                                }
                            }

                            return {
                                id: Date.now().toString() + Math.random(), // Temporary UI ID
                                inventoryCheckItemId:
                                    item.inventoryCheckItemId ||
                                    item.InventoryCheckItemId ||
                                    item.id ||
                                    item.Id,
                                materialId: mId,
                                materialName:
                                    item.materialName ||
                                    item.MaterialName ||
                                    item.materialCode ||
                                    item.MaterialCode ||
                                    '',
                                oldStock: item.expectedQty ?? item.ExpectedQty ?? 0,
                                newStock: String(item.actualQty ?? item.ActualQty ?? 0),
                                difference: (item.actualQty ?? 0) - (item.expectedQty ?? 0),
                                unit: unit,
                            };
                        })
                    );
                    setItems(mappedItems);
                } else {
                    // If no items are returned for an existing inventory, initialize with one empty item
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
            } else {
                console.warn('Failed to fetch items or no items found', itemsRes);
                // If items fetch fails for an existing inventory, initialize with one empty item
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
        } catch (error) {
            console.error('Failed to fetch inventory detail:', error);
            showValidationError('Không thể tải thông tin phiếu kiểm kê');
        } finally {
            setIsLoadingDetail(false);
        }
    }, [inventoryId]);

    useEffect(() => {
        if (inventoryId) {
            fetchInventoryDetail();
        } else {
            // Initial item for create mode
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
    }, [inventoryId, fetchInventoryDetail]);

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
