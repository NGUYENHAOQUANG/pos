import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/features/material/api/inventoryApi';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { materialApi } from '@/features/material/api/materialApi';

export const useInventoryDetail = (inventoryId?: string) => {
    return useQuery({
        queryKey: materialKeys.inventoryDetail(inventoryId || ''),
        queryFn: async () => {
            if (!inventoryId) return null;
            const res = await inventoryApi.getDetail(inventoryId);
            if (res.success) {
                return res.data;
            }
            throw new Error(res.message || 'Failed to fetch inventory detail');
        },
        enabled: !!inventoryId,
        refetchOnWindowFocus: false,
    });
};

export const useInventoryItems = (inventoryId?: string) => {
    return useQuery({
        queryKey: materialKeys.inventoryItems(inventoryId || ''),
        queryFn: async () => {
            if (!inventoryId) return [];

            const itemsRes = await inventoryApi.getItems(inventoryId);

            if (itemsRes.success && itemsRes.data) {
                const itemsData = itemsRes.data;
                const itemsList = itemsData.items || itemsData || [];

                if (itemsList && itemsList.length > 0) {
                    console.log(
                        'API Items List Order React Query:',
                        itemsList.map((i: any) => ({
                            id: i.inventoryCheckItemId || i.InventoryCheckItemId,
                            name: i.materialName || i.MaterialName,
                        }))
                    );

                    const mappedItems = await Promise.all(
                        itemsList.map(async (item: any) => {
                            let unit = item.unitName || item.UnitName || item.unit || item.Unit;

                            // Fetch fresh material detail to ensure correct unit
                            const mId = item.materialId || item.MaterialId;
                            if (mId) {
                                try {
                                    const mRes = await materialApi.getById(mId);
                                    if (mRes.success && mRes.data) {
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
                                createdAt:
                                    item.createdAt ||
                                    item.CreatedAt ||
                                    item.createdDate ||
                                    item.CreatedDate ||
                                    null,
                            };
                        })
                    );

                    // Sort by CreatedAt (asc) to restore insertion order
                    mappedItems.sort((a: any, b: any) => {
                        if (a.createdAt && b.createdAt) {
                            return (
                                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                            );
                        }
                        // Fallback to ID
                        const idA = a.inventoryCheckItemId || '';
                        const idB = b.inventoryCheckItemId || '';
                        return idA.toString().localeCompare(idB.toString());
                    });

                    return mappedItems;
                }
                return [];
            }
            return [];
        },
        enabled: !!inventoryId,
        refetchOnWindowFocus: false,
    });
};
