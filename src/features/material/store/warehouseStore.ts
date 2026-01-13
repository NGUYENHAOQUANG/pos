/**
 * @file warehouseStore.ts
 * @description Warehouse Store - Zustand store for managing warehouse receipts
 * @created 2025-01-XX
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IWarehouseReceipt } from '@/features/material/types/material.types';
import { mockWarehouseList } from '@/features/material/data/materialData';
import { showSuccessToast } from '@/features/material/utils/validationToast';

interface WarehouseState {
    // Data
    warehouseList: IWarehouseReceipt[];

    // Actions
    addWarehouseReceipt: (receipt: Omit<IWarehouseReceipt, 'id'>) => void;
    getWarehouseReceipts: () => IWarehouseReceipt[];
}

export const useWarehouseStore = create<WarehouseState>()(
    persist(
        immer((set, get) => ({
            // Initial state
            warehouseList: mockWarehouseList,

            // Warehouse actions
            addWarehouseReceipt: (receipt: Omit<IWarehouseReceipt, 'id'>) => {
                const newReceipt: IWarehouseReceipt = {
                    ...receipt,
                    id: Date.now().toString(),
                };
                set(state => {
                    state.warehouseList.unshift(newReceipt);
                });
                showSuccessToast('Tạo phiếu nhập kho thành công');
            },

            getWarehouseReceipts: () => {
                return get().warehouseList;
            },
        })),
        {
            name: 'warehouse-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: state => ({
                warehouseList: state.warehouseList,
            }),
        }
    )
);
