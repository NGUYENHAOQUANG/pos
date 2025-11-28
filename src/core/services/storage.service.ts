/**
 * @file storage.service.ts
 * @description Storage Service - MMKV wrapper. Adapter for Zustand persist middleware
 * @author Kindy
 * @created 2025-11-16
 */
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
    id: 'app-storage',
});

// Storage adapter for Zustand persist
export const Storage = {
    setItem: (key: string, value: string): void => {
        try {
            storage.set(key, value);
        } catch (error) {
            console.warn('[Storage] Failed to set item:', key, error);
        }
    },
    getItem: (key: string): string | null => {
        try {
            const value = storage.getString(key);
            return value ?? null;
        } catch (error) {
            console.warn('[Storage] Failed to get item:', key, error);
            return null;
        }
    },
    removeItem: (key: string): void => {
        try {
            storage.delete(key);
        } catch (error) {
            console.warn('[Storage] Failed to remove item:', key, error);
        }
    },
    clear: (): void => {
        try {
            storage.clearAll();
        } catch (error) {
            console.warn('[Storage] Failed to clear:', error);
        }
    },
};
