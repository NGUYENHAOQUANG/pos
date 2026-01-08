/**
 * @file materialStore.ts
 * @description Material Store - Zustand store for managing materials, warehouse receipts, and inventory tickets
 * @created 2025-01-XX
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Storage } from '@/core/services/storage.service';
import { IMaterial, IWarehouseReceipt, IInventoryTicket } from '../types/material.types';
import { mockMaterialList, mockWarehouseList, mockInventoryList } from '../data/materialData';
import { showSuccessToast } from '../utils/validationToast';

interface MaterialState {
    // Data
    materials: IMaterial[];
    warehouseList: IWarehouseReceipt[];
    inventoryList: IInventoryTicket[];

    // UI State (for MaterialScreen)
    searchText: string;
    filterGroup: string;
    filterMaterialName: string | null;

    // Actions - Materials
    addMaterial: (material: Omit<IMaterial, 'id'>) => void;
    updateMaterial: (material: IMaterial) => void;
    getMaterialById: (id: string) => IMaterial | undefined;
    getMaterials: () => IMaterial[];

    // Actions - Warehouse
    addWarehouseReceipt: (receipt: Omit<IWarehouseReceipt, 'id'>) => void;
    getWarehouseReceipts: () => IWarehouseReceipt[];

    // Actions - Inventory
    addInventoryTicket: (ticket: IInventoryTicket) => void;
    getInventoryTickets: () => IInventoryTicket[];

    // Actions - Filters
    setSearchText: (text: string) => void;
    setFilterGroup: (group: string) => void;
    setFilterMaterialName: (name: string | null) => void;
    resetFilters: () => void;

    // Actions - Reset/Initialize
    initializeData: () => void;
}

export const useMaterialStore = create<MaterialState>()(
    persist(
        (set, get) => ({
            // Initial state
            materials: mockMaterialList,
            warehouseList: mockWarehouseList,
            inventoryList: mockInventoryList,
            searchText: '',
            filterGroup: '',
            filterMaterialName: null,

            // Initialize data (for Fast Refresh support)
            initializeData: () => {
                set({
                    materials: mockMaterialList,
                    warehouseList: mockWarehouseList,
                    inventoryList: mockInventoryList,
                });
            },

            // Material actions
            addMaterial: (material: Omit<IMaterial, 'id'>) => {
                const newMaterial: IMaterial = {
                    ...material,
                    id: Date.now().toString(),
                };
                set(state => ({
                    materials: [...state.materials, newMaterial],
                }));
                showSuccessToast('Tạo vật tư thành công');
            },

            updateMaterial: (material: IMaterial) => {
                set(state => ({
                    materials: state.materials.map(item =>
                        item.id === material.id ? material : item
                    ),
                }));
                showSuccessToast('Cập nhật thông tin vật tư thành công');
            },

            getMaterialById: (id: string) => {
                return get().materials.find(m => m.id === id);
            },

            getMaterials: () => {
                return get().materials;
            },

            // Warehouse actions
            addWarehouseReceipt: (receipt: Omit<IWarehouseReceipt, 'id'>) => {
                const newReceipt: IWarehouseReceipt = {
                    ...receipt,
                    id: Date.now().toString(),
                };
                set(state => ({
                    warehouseList: [newReceipt, ...state.warehouseList],
                }));
                showSuccessToast('Tạo phiếu nhập kho thành công');
            },

            getWarehouseReceipts: () => {
                return get().warehouseList;
            },

            // Inventory actions
            addInventoryTicket: (ticket: IInventoryTicket) => {
                set(state => {
                    const newInventoryList = [ticket, ...state.inventoryList];

                    // Update actual stock in material list
                    const updatedMaterials = state.materials.map(mat => {
                        const ticketItem = ticket.items.find(
                            item => item.materialName === mat.name
                        );
                        if (ticketItem) {
                            return {
                                ...mat,
                                remaining: ticketItem.afterQuantity,
                            };
                        }
                        return mat;
                    });

                    return {
                        inventoryList: newInventoryList,
                        materials: updatedMaterials,
                    };
                });
                showSuccessToast('Tạo phiếu điều chỉnh tồn kho thành công');
            },

            getInventoryTickets: () => {
                return get().inventoryList;
            },

            // Filter actions
            setSearchText: (text: string) => {
                set({ searchText: text });
            },

            setFilterGroup: (group: string) => {
                set({ filterGroup: group });
            },

            setFilterMaterialName: (name: string | null) => {
                set({ filterMaterialName: name });
            },

            resetFilters: () => {
                set({
                    searchText: '',
                    filterGroup: '',
                    filterMaterialName: null,
                });
            },
        }),
        {
            name: 'material-storage',
            storage: createJSONStorage(() => Storage),
            // Only persist data, not UI state
            partialize: state => ({
                materials: state.materials,
                warehouseList: state.warehouseList,
                inventoryList: state.inventoryList,
            }),
        }
    )
);
