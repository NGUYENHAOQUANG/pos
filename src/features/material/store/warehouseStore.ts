/**
 * @file warehouseStore.ts
 * @description Warehouse Store - Legacy store
 * @deprecated Use React Query hooks from @/features/material/hooks/useWarehouse.ts
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * @deprecated Use React Query hooks instead
 */
interface WarehouseState {}

export const useWarehouseStore = create<WarehouseState>()(
    persist(
        immer((_set, _get) => ({})),
        {
            name: 'warehouse-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: _state => ({}),
        }
    )
);
