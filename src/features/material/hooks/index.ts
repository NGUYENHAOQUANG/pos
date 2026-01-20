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
export { useInventoryTickets, useAddInventoryTicket } from '@/features/material/hooks/useInventory';
export {
    useWarehouseReceipts,
    useAddWarehouseReceipt,
} from '@/features/material/hooks/useWarehouse';
export { materialKeys } from '@/features/material/hooks/materialKeys';
