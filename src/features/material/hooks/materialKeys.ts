import { GetMaterialsParams } from '@/features/material/types/material.types';
import { GetInventoryParams } from '@/features/material/types/inventoryTicket.types';
import { GetExportWarehouseParams } from '@/features/material/types/exportReceipt.types';
import { GetWarehouseParams } from '@/features/material/types/warehouse.types';

// Query Keys
export const materialKeys = {
    all: ['materials'] as const,
    lists: () => [...materialKeys.all, 'list'] as const,
    list: (params?: GetMaterialsParams) => [...materialKeys.lists(), params] as const,
    details: () => [...materialKeys.all, 'detail'] as const,
    detail: (id: string) => [...materialKeys.details(), id] as const,
    groups: () => [...materialKeys.all, 'groups'] as const,
    types: () => [...materialKeys.all, 'types'] as const,
    typesByGroup: (groupName: string) => [...materialKeys.types(), 'by-group', groupName] as const,
    units: () => [...materialKeys.all, 'units'] as const,
    exportWarehouse: (params?: GetExportWarehouseParams) =>
        [...materialKeys.all, 'export-warehouse', params] as const,
    inventory: (params?: GetInventoryParams) => [...materialKeys.all, 'inventory', params] as const,
    inventoryDetail: (id: string) => [...materialKeys.all, 'inventory', 'detail', id] as const,
    inventoryItems: (id: string) => [...materialKeys.all, 'inventory', 'items', id] as const,
    warehouse: (params?: GetWarehouseParams) => [...materialKeys.all, 'warehouse', params] as const,
    warehouses: (params?: any) => [...materialKeys.all, 'warehouses', params] as const,
};
