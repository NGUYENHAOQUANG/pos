/**
 * @file inventoryStore.ts
 * @description Inventory Store - Zustand store for managing inventory tickets
 * @created 2025-01-XX
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IInventoryTicket } from '@/features/material/types/material.types';
import { mockInventoryList } from '@/features/material/data/materialData';
import { showSuccessToast } from '@/features/material/utils/validationToast';
import { useMaterialsStore } from './materialsStore';

interface InventoryState {
    // Data
    inventoryList: IInventoryTicket[];

    // Actions
    addInventoryTicket: (ticket: IInventoryTicket) => void;
    getInventoryTickets: () => IInventoryTicket[];
}

export const useInventoryStore = create<InventoryState>()(
    persist(
        immer((set, get) => ({
            // Initial state
            inventoryList: mockInventoryList,

            // Inventory actions
            addInventoryTicket: (ticket: IInventoryTicket) => {
                set(state => {
                    state.inventoryList.unshift(ticket);
                });

                // Update actual stock in material list
                const materials = useMaterialsStore.getState().materials;
                ticket.items.forEach(ticketItem => {
                    const material = materials.find(mat => mat.name === ticketItem.materialName);
                    if (material) {
                        useMaterialsStore.setState(state => {
                            const index = state.materials.findIndex(m => m.id === material.id);
                            if (index !== -1) {
                                state.materials[index].remaining = ticketItem.afterQuantity;
                            }
                        });
                    }
                });

                showSuccessToast('Tạo phiếu điều chỉnh tồn kho thành công');
            },

            getInventoryTickets: () => {
                return get().inventoryList;
            },
        })),
        {
            name: 'inventory-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: state => ({
                inventoryList: state.inventoryList,
            }),
        }
    )
);
