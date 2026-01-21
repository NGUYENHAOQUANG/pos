/**
 * @file inventoryStore.ts
 * @description Inventory Store - Legacy store
 * @deprecated Use React Query hooks from @/features/material/hooks/useInventory.ts
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * @deprecated Use React Query hooks instead
 */
interface InventoryState {}

export const useInventoryStore = create<InventoryState>()(
    persist(
        immer((_set, _get) => ({})),
        {
            name: 'inventory-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: _state => ({}),
        }
    )
);
