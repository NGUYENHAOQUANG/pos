/**
 * @file exportWarehouseStore.ts
 * @description Export Warehouse Store - Legacy store
 * @deprecated Use React Query hooks from @/features/material/hooks/useExportWarehouse.ts
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * @deprecated Use React Query hooks instead
 */
interface ExportWarehouseState {}

export const useExportWarehouseStore = create<ExportWarehouseState>()(
    persist(
        immer((_set, _get) => ({})),
        {
            name: 'export-warehouse-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: _state => ({}),
        }
    )
);
