/**
 * @file exportWarehouseStore.ts
 * @description Export Warehouse Store - Zustand store for managing export warehouse receipts
 * @created 2025-01-XX
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IExportWarehouseReceipt } from '@/features/material/types/material.types';
import { mockExportWarehouseList } from '@/features/material/data/materialData';
import { showSuccessToast } from '@/features/material/utils/validationToast';

interface ExportWarehouseState {
    // Data
    exportWarehouseList: IExportWarehouseReceipt[];

    // Actions
    addExportWarehouseReceipt: (receipt: Omit<IExportWarehouseReceipt, 'id'>) => void;
    getExportWarehouseReceipts: () => IExportWarehouseReceipt[];
}

export const useExportWarehouseStore = create<ExportWarehouseState>()(
    persist(
        immer((set, get) => ({
            // Initial state
            exportWarehouseList: mockExportWarehouseList,

            // Export Warehouse actions
            addExportWarehouseReceipt: (receipt: Omit<IExportWarehouseReceipt, 'id'>) => {
                const newReceipt: IExportWarehouseReceipt = {
                    ...receipt,
                    id: Date.now().toString(),
                };
                set(state => {
                    state.exportWarehouseList.unshift(newReceipt);
                });
                showSuccessToast('Tạo phiếu xuất kho thành công');
            },

            getExportWarehouseReceipts: () => {
                return get().exportWarehouseList;
            },
        })),
        {
            name: 'export-warehouse-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: state => ({
                exportWarehouseList: state.exportWarehouseList,
            }),
        }
    )
);
