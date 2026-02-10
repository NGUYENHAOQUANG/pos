// Export all material hooks from a single entry point
export { useMaterialGroups } from '@/features/material/hooks/useMaterialGroups';
export {
    useMaterialTypes,
    useMaterialTypesByGroup,
} from '@/features/material/hooks/useMaterialTypes';
export { useUnits } from '@/features/material/hooks/useUnits';
export {
    useMaterials,
    useInfiniteMaterials,
    useMaterial,
    useCreateMaterial,
    useUpdateMaterial,
    useDeleteMaterial,
} from '@/features/material/hooks/useMaterials';
export {
    useExportWarehouse,
    useInfiniteExportWarehouse,
    useAddExportWarehouseReceipt,
} from '@/features/material/hooks/useExportWarehouse';
export {
    useInventoryTickets,
    useInfiniteInventoryTickets,
} from '@/features/material/hooks/inventory/useInventory';
export {
    useImportReceipts,
    useInfiniteImportReceipts,
} from '@/features/material/hooks/useImportReceipts';
export { materialKeys } from '@/features/material/hooks/materialKeys';
