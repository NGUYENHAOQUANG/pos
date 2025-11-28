/**
 * @file store.ts
 * @description Global Store - Zustand setup. This is the main store file. Feature-specific stores should be in their respective feature folders.
 * @author Kindy
 * @created 2025-11-16
 */
import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {Storage} from '@/core/services/storage.service';

// Global app state interface
interface AppState {
  isInitialized: boolean;
  setInitialized: (value: boolean) => void;
}

// Create global store
export const useAppStore = create<AppState>()(
  persist(
    set => ({
      isInitialized: false,
      setInitialized: value => set({isInitialized: value}),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => Storage),
    },
  ),
);

