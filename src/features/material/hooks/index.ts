// Export all material hooks from a single entry point

// ─── Material CRUD ──────────────────────────────────────
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

// ─── Export Warehouse ───────────────────────────────────
export {
    useExportWarehouse,
    useInfiniteExportWarehouse,
    useAddExportWarehouseReceipt,
} from '@/features/material/hooks/useExportWarehouse';
export {
    useExportReceipts,
    useExportReceipt,
    useCreateExportReceipt,
    useUpdateExportReceipt,
    useDeleteExportReceipt,
    useApproveExportReceipt,
    useRejectExportReceipt,
} from '@/features/material/hooks/useExportReceipt';
export {
    useExportReceiptItems,
    useDeleteExportReceiptItem,
} from '@/features/material/hooks/useExportReceiptItems';

// ─── Import Receipt ────────────────────────────────────
export {
    importReceiptKeys,
    useImportReceipts,
    useInfiniteImportReceipts,
    useImportReceiptDetail,
    useImportReceiptItems,
    useCreateImportReceipt,
    useUpdateImportReceipt,
    useDeleteImportReceipt,
    useAddImportReceiptItems,
    useUpdateImportReceiptItems,
    useApproveImportReceipt,
    useRejectImportReceipt,
} from '@/features/material/hooks/useImportReceipts';

// ─── Inventory ─────────────────────────────────────────
export {
    useInventoryTickets,
    useInfiniteInventoryTickets,
    useDeleteInventoryTicket,
    useCreateInventoryCheck,
    useUpdateInventoryCheck,
    useInventoryDetail,
    useInventoryItems,
    useApproveInventoryCheck,
    useRejectInventoryCheck,
} from '@/features/material/hooks/useInventory';

// ─── Warehouse ─────────────────────────────────────────
export {
    useWarehouses,
    useCurrentWarehouse,
    fetchCurrentWarehouseId,
    useWarehouseItems,
    useInfiniteWarehouseItems,
} from '@/features/material/hooks/useWarehouses';

// ─── Suppliers ─────────────────────────────────────────
export { useSuppliers, useInfiniteSuppliers } from '@/features/material/hooks/useSuppliers';

// ─── Shrimp Seeds ──────────────────────────────────────
export { useShrimpSeeds, useCurrentShrimpBreed } from '@/features/material/hooks/useShrimpSeeds';

// ─── Shared / Utility ──────────────────────────────────
export { materialKeys } from '@/features/material/hooks/materialKeys';
export { useMaterialListState } from '@/features/material/hooks/useMaterialListState';
export {
    useDropdownScroll,
    DropdownScrollContext,
} from '@/features/material/hooks/useDropdownScroll';

// ─── Logic (form actions) ──────────────────────────────
export { useExportMaterialActions } from '@/features/material/hooks/logic/useExportMaterialActions';
export { useWarehouseMaterialActions } from '@/features/material/hooks/logic/useWarehouseMaterialActions';
export { useInventoryMaterialActions } from '@/features/material/hooks/logic/useInventoryMaterialActions';
