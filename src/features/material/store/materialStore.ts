/**
 * @file materialStore.ts
 * @description Material Store - Zustand store for managing materials, warehouse receipts, and inventory tickets
 * @created 2025-01-XX
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    IMaterial,
    IWarehouseReceipt,
    IInventoryTicket,
    IMaterialGroup,
} from '../types/material.types';
import { mockMaterialList, mockWarehouseList, mockInventoryList } from '../data/materialData';
import { showSuccessToast } from '../utils/validationToast';
import { materialGroupApi } from '../api/materialGroupApi';

interface MaterialState {
    // Data
    materials: IMaterial[];
    warehouseList: IWarehouseReceipt[];
    inventoryList: IInventoryTicket[];
    materialGroups: IMaterialGroup[];

    // Loading states
    isLoadingMaterialGroups: boolean;
    materialGroupsError: string | null;

    // UI State (for MaterialScreen)
    searchText: string;
    filterGroup: string;
    filterMaterialName: string | null;

    // Actions - Materials
    addMaterial: (material: Omit<IMaterial, 'id'>) => void;
    updateMaterial: (material: IMaterial) => void;
    getMaterialById: (id: string) => IMaterial | undefined;
    getMaterials: () => IMaterial[];

    // Actions - Material Groups
    fetchMaterialGroups: () => Promise<void>;
    getMaterialGroupOptions: () => string[];

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
        immer((set, get) => ({
            // Initial state
            materials: mockMaterialList,
            warehouseList: mockWarehouseList,
            inventoryList: mockInventoryList,
            materialGroups: [],
            isLoadingMaterialGroups: false,
            materialGroupsError: null,
            searchText: '',
            filterGroup: '',
            filterMaterialName: null,

            // Initialize data (for Fast Refresh support)
            initializeData: () => {
                set(state => {
                    state.materials = mockMaterialList;
                    state.warehouseList = mockWarehouseList;
                    state.inventoryList = mockInventoryList;
                });
            },

            // Fetch material groups from API
            fetchMaterialGroups: async () => {
                set(state => {
                    state.isLoadingMaterialGroups = true;
                    state.materialGroupsError = null;
                });

                try {
                    console.log('[MaterialStore] Fetching material groups...');
                    const response = await materialGroupApi.getAll({ Page: 1, PageSize: 100 });
                    console.log('[MaterialStore] API Response:', JSON.stringify(response, null, 2));

                    if (response.result && response.data?.items) {
                        console.log('[MaterialStore] Material groups loaded:', response.data.items);
                        set(state => {
                            state.materialGroups = response.data.items || [];
                            state.isLoadingMaterialGroups = false;
                        });
                    } else {
                        console.log('[MaterialStore] API Error:', response.message);
                        set(state => {
                            state.materialGroupsError =
                                response.message || 'Không thể tải nhóm vật tư';
                            state.isLoadingMaterialGroups = false;
                        });
                    }
                } catch (error) {
                    console.log('[MaterialStore] Fetch error:', error);
                    set(state => {
                        state.materialGroupsError =
                            error instanceof Error ? error.message : 'Đã xảy ra lỗi';
                        state.isLoadingMaterialGroups = false;
                    });
                }
            },

            // Get material group options for dropdown
            getMaterialGroupOptions: () => {
                const groups = get().materialGroups;
                const options = groups
                    .filter(group => group.name)
                    .map(group => group.name as string);
                return ['Tất cả nhóm vật tư', ...options];
            },

            // Material actions
            addMaterial: (material: Omit<IMaterial, 'id'>) => {
                const newMaterial: IMaterial = {
                    ...material,
                    id: Date.now().toString(),
                };
                set(state => {
                    state.materials.unshift(newMaterial);
                });
                showSuccessToast('Tạo vật tư thành công');
            },

            updateMaterial: (material: IMaterial) => {
                set(state => {
                    const index = state.materials.findIndex(item => item.id === material.id);
                    if (index !== -1) {
                        state.materials[index] = material;
                    }
                });
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
                set(state => {
                    state.warehouseList.unshift(newReceipt);
                });
                showSuccessToast('Tạo phiếu nhập kho thành công');
            },

            getWarehouseReceipts: () => {
                return get().warehouseList;
            },

            // Inventory actions
            addInventoryTicket: (ticket: IInventoryTicket) => {
                set(state => {
                    state.inventoryList.unshift(ticket);

                    // Update actual stock in material list
                    ticket.items.forEach(ticketItem => {
                        const material = state.materials.find(
                            mat => mat.name === ticketItem.materialName
                        );
                        if (material) {
                            material.remaining = ticketItem.afterQuantity;
                        }
                    });
                });
                showSuccessToast('Tạo phiếu điều chỉnh tồn kho thành công');
            },

            getInventoryTickets: () => {
                return get().inventoryList;
            },

            // Filter actions
            setSearchText: (text: string) => {
                set(state => {
                    state.searchText = text;
                });
            },

            setFilterGroup: (group: string) => {
                set(state => {
                    state.filterGroup = group;
                });
            },

            setFilterMaterialName: (name: string | null) => {
                set(state => {
                    state.filterMaterialName = name;
                });
            },

            resetFilters: () => {
                set(state => {
                    state.searchText = '';
                    state.filterGroup = '';
                    state.filterMaterialName = null;
                });
            },
        })),
        {
            name: 'material-storage',
            storage: createJSONStorage(() => AsyncStorage),
            // Only persist data, not UI state
            partialize: state => ({
                materials: state.materials,
                warehouseList: state.warehouseList,
                inventoryList: state.inventoryList,
                materialGroups: state.materialGroups,
            }),
        }
    )
);
