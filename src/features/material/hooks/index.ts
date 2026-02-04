// Export all material hooks from a single entry point
export { useMaterialGroups } from '@/features/material/hooks/useMaterialGroups';
export {
    useMaterialTypes,
    useMaterialTypesByGroup,
} from '@/features/material/hooks/useMaterialTypes';
export { useUnits } from '@/features/material/hooks/useUnits';
export {
    useMaterials,
    useMaterial,
    useCreateMaterial,
    useUpdateMaterial,
    useDeleteMaterial,
} from '@/features/material/hooks/useMaterials';
export {
    useExportWarehouse,
    useAddExportWarehouseReceipt,
} from '@/features/material/hooks/useExportWarehouse';
export { useInventoryTickets } from '@/features/material/hooks/inventory/useInventory';
export { useImportReceipts } from '@/features/material/hooks/useImportReceipts';
export { materialKeys } from '@/features/material/hooks/materialKeys';
