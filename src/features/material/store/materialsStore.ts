/**
 * @file materialsStore.ts
 * @description Materials Store - Zustand store for backward compatibility
 * @note This store is kept for backward compatibility. New code should use React Query hooks from useMaterials.ts
 * @created 2025-01-XX
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMaterial } from '@/features/material/types/material.types';
import { mockMaterialList } from '@/features/material/data/materialData';
import { showSuccessToast } from '@/features/material/utils/validationToast';

/**
 * @deprecated This store is kept for backward compatibility only.
 * Use React Query hooks from @/features/material/hooks/useMaterials.ts instead.
 */
interface MaterialsState {
    // Data (for backward compatibility - now managed by React Query)
    materials: IMaterial[];

    // Actions - Materials (Local - for backward compatibility)
    addMaterial: (material: Omit<IMaterial, 'id'>) => void;
    getMaterialById: (id: string) => IMaterial | undefined;
    getMaterials: () => IMaterial[];
}

export const useMaterialsStore = create<MaterialsState>()(
    persist(
        immer((set, get) => ({
            // Initial state (for backward compatibility)
            materials: mockMaterialList,

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
        })),
        {
            name: 'materials-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: state => ({
                materials: state.materials,
            }),
        }
    )
);
