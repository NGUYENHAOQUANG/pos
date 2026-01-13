/**
 * @file materialsStore.ts
 * @description Materials Store - Zustand store for managing materials, groups, types, units, and filters
 * @created 2025-01-XX
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    IMaterial,
    IMaterialGroup,
    IMaterialType,
    IUnit,
    CreateMaterialRequest,
    UpdateMaterialRequest,
    GetMaterialsParams,
    MaterialResponse,
} from '@/features/material/types/material.types';
import { DropdownOption } from '@/features/material/components/material/DropdownMaterialGroup';
import { mockMaterialList } from '@/features/material/data/materialData';
import { showSuccessToast, showErrorToast } from '@/features/material/utils/validationToast';
import { materialGroupApi } from '@/features/material/api/materialGroupApi';
import { materialTypeApi } from '@/features/material/api/materialTypeApi';
import { unitApi } from '@/features/material/api/unitApi';
import { materialApi } from '@/features/material/api/materialApi';

interface MaterialsState {
    // Data
    materials: IMaterial[];
    materialGroups: IMaterialGroup[];
    materialTypes: IMaterialType[];
    units: IUnit[];

    // Loading states
    isLoadingMaterialGroups: boolean;
    materialGroupsError: string | null;
    isLoadingMaterialTypes: boolean;
    materialTypesError: string | null;
    isLoadingUnits: boolean;
    unitsError: string | null;
    isLoadingMaterials: boolean;
    materialsError: string | null;

    // UI State (for MaterialScreen)
    searchText: string;
    filterGroup: string;
    filterType: string; // Material type name for filtering
    filterMaterialName: string | null;

    // Actions - Materials (API)
    fetchMaterials: (params?: GetMaterialsParams) => Promise<void>;
    fetchMaterialById: (id: number) => Promise<void>;
    createMaterial: (request: CreateMaterialRequest) => Promise<void>;
    updateMaterial: (id: number, request: UpdateMaterialRequest) => Promise<void>;
    deleteMaterial: (id: number) => Promise<void>;
    // Actions - Materials (Local - for backward compatibility)
    addMaterial: (material: Omit<IMaterial, 'id'>) => void;
    getMaterialById: (id: string) => IMaterial | undefined;
    getMaterials: () => IMaterial[];

    // Actions - Material Groups
    fetchMaterialGroups: () => Promise<void>;
    getMaterialGroupOptions: () => string[];

    // Actions - Material Types
    fetchMaterialTypes: () => Promise<void>;
    fetchMaterialTypesByGroup: (groupName: string) => Promise<void>;
    getMaterialTypeOptions: (groupName: string) => string[];
    getAllMaterialTypeOptions: () => string[];

    // Actions - Units
    fetchUnits: () => Promise<void>;
    getUnitOptions: () => DropdownOption[];

    // Actions - Filters
    setSearchText: (text: string) => void;
    setFilterGroup: (group: string) => void;
    setFilterType: (type: string) => void;
    setFilterMaterialName: (name: string | null) => void;
    resetFilters: () => void;
}

export const useMaterialsStore = create<MaterialsState>()(
    persist(
        immer((set, get) => ({
            // Initial state
            materials: mockMaterialList,
            materialGroups: [],
            isLoadingMaterialGroups: false,
            materialGroupsError: null,
            materialTypes: [],
            isLoadingMaterialTypes: false,
            materialTypesError: null,
            units: [],
            isLoadingUnits: false,
            unitsError: null,
            isLoadingMaterials: false,
            materialsError: null,
            searchText: '',
            filterGroup: '',
            filterType: '',
            filterMaterialName: null,

            // Fetch material groups from API
            fetchMaterialGroups: async () => {
                set(state => {
                    state.isLoadingMaterialGroups = true;
                    state.materialGroupsError = null;
                });

                try {
                    console.log('[MaterialsStore] Fetching material groups...');
                    const response = await materialGroupApi.getAll({ Page: 1, PageSize: 100 });
                    console.log(
                        '[MaterialsStore] API Response:',
                        JSON.stringify(response, null, 2)
                    );

                    if (response.result && response.data?.items) {
                        console.log(
                            '[MaterialsStore] Material groups loaded:',
                            response.data.items
                        );
                        set(state => {
                            state.materialGroups = response.data.items || [];
                            state.isLoadingMaterialGroups = false;
                        });
                    } else {
                        console.log('[MaterialsStore] API Error:', response.message);
                        set(state => {
                            state.materialGroupsError =
                                response.message || 'Không thể tải nhóm vật tư';
                            state.isLoadingMaterialGroups = false;
                        });
                    }
                } catch (error) {
                    console.log('[MaterialsStore] Fetch error:', error);
                    set(state => {
                        state.materialGroupsError =
                            error instanceof Error ? error.message : 'Đã xảy ra lỗi';
                        state.isLoadingMaterialGroups = false;
                    });
                }
            },

            // Fetch units from API
            fetchUnits: async () => {
                set(state => {
                    state.isLoadingUnits = true;
                    state.unitsError = null;
                });

                try {
                    const response = await unitApi.getUnits();
                    let unitsData: IUnit[] = [];

                    if (response.data && response.data.items) {
                        unitsData = response.data.items;
                    }

                    set(state => {
                        state.units = unitsData;
                        state.isLoadingUnits = false;
                    });
                } catch (error) {
                    console.log('[MaterialsStore] Fetch units error:', error);
                    set(state => {
                        state.unitsError =
                            error instanceof Error ? error.message : 'Lỗi tải đơn vị tính';
                        state.isLoadingUnits = false;
                    });
                }
            },

            getUnitOptions: () => {
                const units = get().units;
                return units.map(u => ({ label: u.name, value: u.id }));
            },

            // Get material group options for dropdown
            getMaterialGroupOptions: () => {
                const groups = get().materialGroups;
                const options = groups
                    .filter(group => group.name)
                    .map(group => group.name as string);
                return ['Tất cả nhóm vật tư', ...options];
            },

            // Fetch all material types from API
            fetchMaterialTypes: async () => {
                set(state => {
                    state.isLoadingMaterialTypes = true;
                    state.materialTypesError = null;
                });

                try {
                    const response = await materialTypeApi.getList({
                        Page: 1,
                        PageSize: 100,
                    });

                    if (response.result && response.data?.items) {
                        set(state => {
                            state.materialTypes = response.data.items || [];
                            state.isLoadingMaterialTypes = false;
                        });
                    } else {
                        throw new Error(response.message || 'Không thể tải loại vật tư');
                    }
                } catch (error) {
                    console.log('[MaterialsStore] Fetch material types error:', error);
                    set(state => {
                        state.materialTypesError =
                            error instanceof Error ? error.message : 'Đã xảy ra lỗi';
                        state.isLoadingMaterialTypes = false;
                    });
                }
            },

            // Fetch material types by group name
            fetchMaterialTypesByGroup: async (groupName: string) => {
                if (!groupName) {
                    return;
                }

                const groups = get().materialGroups;
                const selectedGroup = groups.find(g => g.name === groupName);

                if (!selectedGroup) {
                    console.warn('[MaterialsStore] Selected group not found:', groupName);
                    return;
                }

                set(state => {
                    state.isLoadingMaterialTypes = true;
                    state.materialTypesError = null;
                });

                try {
                    // Fetch all types and filter client-side (API doesn't support MaterialGroupId filter)
                    const response = await materialTypeApi.getList({
                        Page: 1,
                        PageSize: 100,
                    });

                    if (response.result && response.data?.items) {
                        // Filter types by materialGroupId client-side
                        const filteredTypes = (response.data.items || []).filter(
                            item => item.materialGroupId === selectedGroup.id
                        );

                        // Update materialTypes in store (keep all types, but we'll filter when getting options)
                        set(state => {
                            // Merge with existing types, avoiding duplicates
                            const existingIds = new Set(state.materialTypes.map(t => t.id));
                            const newTypes = filteredTypes.filter(t => !existingIds.has(t.id));
                            state.materialTypes = [...state.materialTypes, ...newTypes];
                            state.isLoadingMaterialTypes = false;
                        });
                    } else {
                        throw new Error(response.message || 'Không thể tải loại vật tư');
                    }
                } catch (error) {
                    console.log('[MaterialsStore] Fetch material types by group error:', error);
                    set(state => {
                        state.materialTypesError =
                            error instanceof Error ? error.message : 'Đã xảy ra lỗi';
                        state.isLoadingMaterialTypes = false;
                    });
                }
            },

            // Get material type options for a specific group
            getMaterialTypeOptions: (groupName: string) => {
                if (!groupName) {
                    return [];
                }

                const groups = get().materialGroups;
                const types = get().materialTypes;
                const selectedGroup = groups.find(g => g.name === groupName);

                if (!selectedGroup) {
                    return [];
                }

                // Filter types by materialGroupId and return names
                return types
                    .filter(item => item.materialGroupId === selectedGroup.id)
                    .map(item => item.name || '')
                    .filter(n => n);
            },

            // Get all material type options (without group filter)
            getAllMaterialTypeOptions: () => {
                const types = get().materialTypes;
                return ['Tất cả loại vật tư', ...types.map(t => t.name || '').filter(n => n)];
            },

            // Material API actions
            fetchMaterials: async (params?: GetMaterialsParams) => {
                set(state => {
                    state.isLoadingMaterials = true;
                    state.materialsError = null;
                });

                try {
                    // Ensure groups and types are loaded for mapping
                    const groups = get().materialGroups;
                    const types = get().materialTypes;

                    // Fetch groups if not loaded
                    if (groups.length === 0) {
                        await get().fetchMaterialGroups();
                    }

                    // Fetch types if not loaded
                    if (types.length === 0) {
                        await get().fetchMaterialTypes();
                    }

                    // Build API params with filterType if set
                    const filterType = get().filterType;
                    const searchText = get().searchText;
                    const apiParams: GetMaterialsParams = {
                        ...params,
                    };

                    // Map filterType (type name) to MaterialTypeId
                    if (filterType && filterType !== '' && filterType !== 'Tất cả loại vật tư') {
                        const updatedTypes = get().materialTypes;
                        const selectedType = updatedTypes.find(t => t.name === filterType);
                        if (selectedType) {
                            apiParams.MaterialTypeId = selectedType.id;
                        }
                    }

                    // Add Search param if searchText is set
                    if (searchText) {
                        apiParams.Search = searchText;
                    }

                    const response = await materialApi.getAll(apiParams);
                    if (response.result && response.data?.items) {
                        // Get groups and types for mapping (refresh after fetch)
                        const updatedGroups = get().materialGroups;
                        const updatedTypes = get().materialTypes;

                        // Map API response to local IMaterial format
                        const mappedMaterials: IMaterial[] = (response.data.items || []).map(
                            (item: MaterialResponse) => {
                                // Map materialGroupId to group name
                                const group = item.materialGroupId
                                    ? updatedGroups.find(g => g.id === item.materialGroupId)
                                          ?.name || ''
                                    : '';

                                // Map materialTypeId to type name
                                const type = item.materialTypeId
                                    ? updatedTypes.find(t => t.id === item.materialTypeId)?.name ||
                                      ''
                                    : '';

                                return {
                                    id: item.id.toString(),
                                    name: item.name || '',
                                    group: group,
                                    type: type,
                                    unit: item.unitId,
                                    unitName: item.unitName || undefined, // Map unitName for display
                                    manufacturer: item.manufacturer || undefined,
                                    usage: item.description || undefined, // Map description to usage
                                    remaining: 0, // Not in API response
                                };
                            }
                        );

                        set(state => {
                            state.materials = mappedMaterials;
                            state.isLoadingMaterials = false;
                        });
                    } else {
                        throw new Error(response.message || 'Không thể tải danh sách vật tư');
                    }
                } catch (error) {
                    console.log('[MaterialsStore] Fetch materials error:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi';
                    set(state => {
                        state.materialsError = errorMessage;
                        state.isLoadingMaterials = false;
                    });
                    throw error;
                }
            },

            fetchMaterialById: async (id: number) => {
                try {
                    // Ensure groups and types are loaded for mapping
                    const groups = get().materialGroups;
                    const types = get().materialTypes;

                    // Fetch groups if not loaded
                    if (groups.length === 0) {
                        await get().fetchMaterialGroups();
                    }

                    // Fetch types if not loaded
                    if (types.length === 0) {
                        await get().fetchMaterialTypes();
                    }

                    const response = await materialApi.getById(id);
                    if (response.result && response.data) {
                        // Get groups and types for mapping (refresh after fetch)
                        const updatedGroups = get().materialGroups;
                        const updatedTypes = get().materialTypes;

                        // Map materialGroupId to group name
                        const group = response.data.materialGroupId
                            ? updatedGroups.find(g => g.id === response.data.materialGroupId)
                                  ?.name || ''
                            : '';

                        // Map materialTypeId to type name
                        const type = response.data.materialTypeId
                            ? updatedTypes.find(t => t.id === response.data.materialTypeId)?.name ||
                              ''
                            : '';

                        // Map API response to local IMaterial format
                        const material: IMaterial = {
                            id: response.data.id.toString(),
                            name: response.data.name || '',
                            group: group,
                            type: type,
                            unit: response.data.unitId,
                            unitName: response.data.unitName || undefined, // Map unitName for display
                            manufacturer: response.data.manufacturer || undefined,
                            usage: response.data.description || undefined, // Map description to usage
                            remaining: 0, // Not in API response
                        };

                        // Update or add to materials list
                        set(state => {
                            const index = state.materials.findIndex(m => m.id === material.id);
                            if (index !== -1) {
                                state.materials[index] = material;
                            } else {
                                state.materials.unshift(material);
                            }
                        });
                    } else {
                        throw new Error(response.message || 'Không thể tải thông tin vật tư');
                    }
                } catch (error) {
                    console.log('[MaterialsStore] Fetch material by id error:', error);
                    throw error;
                }
            },

            createMaterial: async (request: CreateMaterialRequest) => {
                try {
                    const response = await materialApi.create(request);
                    if (response.result) {
                        showSuccessToast('Tạo vật tư thành công');
                        // Optionally refresh materials list
                        await get().fetchMaterials();
                    } else {
                        throw new Error(response.message || 'Tạo vật tư thất bại');
                    }
                } catch (error) {
                    console.log('[MaterialsStore] Create material error:', error);
                    const errorMessage =
                        error instanceof Error ? error.message : 'Tạo vật tư thất bại';
                    showErrorToast(errorMessage);
                    throw error;
                }
            },

            updateMaterial: async (id: number, request: UpdateMaterialRequest) => {
                try {
                    const response = await materialApi.update(id, request);
                    if (response.result) {
                        showSuccessToast('Cập nhật thông tin vật tư thành công');
                        // Optionally refresh materials list or update local state
                        await get().fetchMaterialById(id);
                    } else {
                        throw new Error(response.message || 'Cập nhật vật tư thất bại');
                    }
                } catch (error) {
                    console.log('[MaterialsStore] Update material error:', error);
                    const errorMessage =
                        error instanceof Error ? error.message : 'Cập nhật vật tư thất bại';
                    showErrorToast(errorMessage);
                    throw error;
                }
            },

            deleteMaterial: async (id: number) => {
                try {
                    const response = await materialApi.delete(id);
                    if (response.result) {
                        showSuccessToast('Xóa vật tư thành công');
                        // Remove from local state
                        set(state => {
                            state.materials = state.materials.filter(m => m.id !== id.toString());
                        });
                    } else {
                        throw new Error(response.message || 'Xóa vật tư thất bại');
                    }
                } catch (error) {
                    console.log('[MaterialsStore] Delete material error:', error);
                    const errorMessage =
                        error instanceof Error ? error.message : 'Xóa vật tư thất bại';
                    showErrorToast(errorMessage);
                    throw error;
                }
            },

            // Material local actions (for backward compatibility)
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

            getMaterialById: (id: string) => {
                return get().materials.find(m => m.id === id);
            },

            getMaterials: () => {
                return get().materials;
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

            setFilterType: (type: string) => {
                set(state => {
                    state.filterType = type;
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
                    state.filterType = '';
                    state.filterMaterialName = null;
                });
            },
        })),
        {
            name: 'materials-storage',
            storage: createJSONStorage(() => AsyncStorage),
            // Only persist data, not UI state
            partialize: state => ({
                materials: state.materials,
                materialGroups: state.materialGroups,
                materialTypes: state.materialTypes,
            }),
        }
    )
);
